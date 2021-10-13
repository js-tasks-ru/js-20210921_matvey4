import fetchJson from './utils/fetch-json.js';
const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class SortableTable {
  start = 0
  rowsPerPage = 30
  end = this.start + this.rowsPerPage;
  isLoading = false;

  onClickSort = async (event) => {
    const column = event.target.closest('[data-sortable = "true"]');
    if (column) {
      column.dataset.order = column.dataset.order === 'asc' ? 'desc' : 'asc';

      this.sorted.id = column.dataset.id;
      this.sorted.order = column.dataset.order;

      const sortedData = this.isSortLocally ? this.sortOnClient(column.dataset.id, column.dataset.order) :
        await this.sortOnServer(column.dataset.id, column.dataset.order);

      this.makeRows(sortedData);

      if (!column.querySelector('.sortable-table__sort-arrow')) {
        column.append(this.subElements.arrow);
      }
    }
  }

  onScroll = async () => {
    const {clientHeight} = document.documentElement;

    if ((this.element.getBoundingClientRect().bottom < clientHeight) && (!this.isSortLocally) && (!this.isLoading)) {
      this.start = this.end;
      this.end += this.rowsPerPage;
      this.isLoading = true;
      const nextPageData = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
      this.addNextPageData(nextPageData);
      this.isLoading = false;
    }

  }

  constructor(headerConfig, {
    data = [],
    url = '',
    isSortLocally = false,
    sorted = {id: headerConfig.find(item => item.sortable).id,
      order: 'asc'}
  } = {})
  {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = new URL(BACKEND_URL + url);
    this.isSortLocally = isSortLocally;
    this.render();

  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTable(this.data);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.isLoading = true;
    const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
    this.makeRows(data);
    this.isLoading = false;

    this.addEventListeners();
  }

  async loadData(field, order, start, end) {
    this.element.classList.add('sortable-table_loading');
    this.url.searchParams.set('_sort', field);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');
    return data;
  }

  makeRows(data) {
    if (data.length) {
      this.data = data;
      this.subElements.body.innerHTML = this.getTableRows(this.data);
      this.element.classList.remove('sortable-table_empty');
    }
    else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  addNextPageData(newData) {
    this.data = [...this.data, ...newData];
    this.renderNextPageData(newData);
  }

  renderNextPageData(newData) {
    const element = document.createElement('div');
    element.innerHTML = this.getTableRows(newData);
    this.subElements.body.append(...element.childNodes);

  }

  getTable(data) {
    return `<div class="sortable-table">
                ${this.getTableHeaders()}
                ${this.getTableBody(data)}

              <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

              <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                <div>
                  <p>No products satisfies your filter criteria</p>
                  <button type="button" class="button-primary-outline">Reset all filters</button>
                </div>
              </div>

            </div>` ;
  }

  getTableHeaders() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHeaderCells()}
            </div>`;
  }

  getHeaderCells() {
    return this.headerConfig.map(header =>{
      const order = this.sorted.id === header.id ? this.sorted.order : 'asc';
      return `<div class="sortable-table__cell" data-id=${header.id} data-sortable=${header.sortable} data-order=${order}>
         <span>${header.title}</span>
           ${this.getHeaderArrow(header)}
      </div>`;})
      .join('');
  }


  getHeaderArrow(header) {
    return this.sorted.id === header.id ? '<span data-element="arrow" class="sortable-table__sort-arrow">' +
      '    <span class="sort-arrow"></span> ' +
      ' </span>' : '';
  }

  getTableBody(data) {
    return `<div data-element="body" class="sortable-table__body">
                ${this.getTableRows(data)}
            </div>`;

  }

  getTableRows(data) {
    return data.map(item => ` <a href="/products/${item.id}" class="sortable-table__row">
                                        ${this.getColumnValues(item)}
                                   </a>`)
      .join('');
  }

  getColumnValues(item) {
    return this.headerConfig.map(header => header.template ? header.template(item[header.id]) :
      `<div class="sortable-table__cell">${item[header.id]}</div>`)
      .join('');
  }


  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === field);
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onClickSort);
    document.addEventListener('scroll', this.onScroll);
  }

  sortOnClient (id, order) {
    return this.sortData(id, order);
  }

  async sortOnServer (id, order) {
    return await this.loadData(id, order, 1, this.end);
  }

  remove () {
    if (this.element) {
      this.element.remove();
      document.removeEventListener('scroll', this.onScroll);
    }
  }

  destroy() {
    this.remove();
    this.subElements.header.removeEventListener('pointerdown', this.onClickSort);
  }


}
