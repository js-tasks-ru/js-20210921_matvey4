export default class SortableTable {

  constructor(headerConfig = [], {data = []} = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  get template() {
    return `
  <div class="sortable-table">
    <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headers}
    </div>

    <div data-element="body" class="sortable-table__body">
        ${this.rows}
    </div>

    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>

  </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  get headers() {
    return this.headerConfig.map(h => `<div class="sortable-table__cell" data-id=${h.id} data-sortable=${h.sortable} data-order="">
                                            <span>${h.title}</span>
                                            ${h.sortable ? '<span data-element="arrow" class="sortable-table__sort-arrow">' +
                                                '    <span class="sort-arrow"></span> ' +
                                                ' </span>' : ''}
                                        </div>`)
                            .join('');
  }

  get rows() {
    return this.data.map(item => ` <a href="/products/${item.id}" class="sortable-table__row">
                                        ${this.getColumnValues(item)}
                                   </a>`)
                   .join('');

  }

  getColumnValues(item) {
    return this.headerConfig.map(h => h.template ? h.template(item[h.id]) : `<div class="sortable-table__cell">${item[h.id]}</div>`)
                            .join('');
  }


  sort(field, orderValue) {
    const directions = {"asc": 1, "desc": -1};

    const columnToSort = this.headerConfig.find(function (h) {
      if (h.id === field) {
        return true;
      }
    });

    const sortFn = function(a, b) {
      if (columnToSort.sortType === 'string') {
        return directions[orderValue] * (a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'}));
      }
      else if (columnToSort.sortType === 'number') {
        return directions[orderValue] * (a - b);
      }
    };

    if (columnToSort.sortable) {
      this.data.sort((a, b) => sortFn(a[field], b[field]));
    }
    const subElements = this.getSubElements(this.element);
    subElements.body.innerHTML = this.rows;

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

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

