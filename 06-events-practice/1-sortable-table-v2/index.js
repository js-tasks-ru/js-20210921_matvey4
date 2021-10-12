export default class SortableTable {

  onClickSort = (event) => {
    const column = event.target.closest('[data-sortable = "true"]');
    if (column) {
      column.dataset.order = column.dataset.order === 'asc' ? 'desc' : 'asc';
      const sortedData = this.sortData(column.dataset.id, column.dataset.order);
      if (!column.querySelector('.sortable-table__sort-arrow')) {
        column.append(this.subElements.arrow);
      }
      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  }

  constructor(headerConfig, {
    data = [],
    sorted = {}
  } = {})
  {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.render();

  }

  render() {
    const sortedData = this.sortData(this.sorted.id, this.sorted.order);
    const element = document.createElement('div');
    element.innerHTML = this.getTable(sortedData);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.addEventListeners();
  }

  getTable(data) {
    return `<div class="sortable-table">
                ${this.getTableHeaders()}
                ${this.getTableBody(data)}
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
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements.header.removeEventListener('pointerdown', this.onClickSort);
  }
}
