import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  components = {};
  subElements = {};
  sortableTableUrl = 'api/dashboard/bestsellers';
  ordersChartUrl = 'api/dashboard/orders';
  salesChartUrl = 'api/dashboard/sales';
  customersChartUrl = 'api/dashboard/customers';

  initComponents() {
    const dateTo = new Date();
    const dateFrom = new Date(dateTo.getTime() - (30 * 24 * 60 * 60 * 1000));

    const rangePicker = new RangePicker({
      from: dateFrom,
      to: dateTo
    });

    const sortableTable = new SortableTable(header, {
      url: this.sortableTableUrl + `?from=${dateFrom.toISOString()}&to=${dateTo.toISOString()}`,
      isSortLocally: true
    });

    const ordersChart = new ColumnChart({
      label: 'Orders',
      url: this.ordersChartUrl,
      range: {
        from: dateFrom,
        to: dateTo
      }
    });

    const salesChart = new ColumnChart({
      label: 'Sales',
      url: this.salesChartUrl,
      formatHeading: data => `$${data}`,
      range: {
        from: dateFrom,
        to: dateTo
      }
    });

    const customersChart = new ColumnChart({
      label: 'Sales',
      url: this.customersChartUrl,
      range: {
        from: dateFrom,
        to: dateTo
      }
    });

    this.components.rangePicker = rangePicker;
    this.components.sortableTable = sortableTable;
    this.components.ordersChart = ordersChart;
    this.components.salesChart = salesChart;
    this.components.customersChart = customersChart;


  }


  async updateComponents(from, to) {
    const url = new URL(this.sortableTableUrl, BACKEND_URL);
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());
    url.searchParams.set('_sort', 'title');
    url.searchParams.set('_order', 'asc');

    const dataPromise = fetchJson(url);
    const ordersPromise = this.components.ordersChart.update(from, to);
    const salesPromise = this.components.salesChart.update(from, to);
    const customersPromise = this.components.customersChart.update(from, to);

    const [data] = await Promise.all([dataPromise, ordersPromise, salesPromise, customersPromise]);

    this.components.sortableTable.addRows(data);

  }

  async render() {
    this.initComponents();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    Object.keys(this.components).forEach(component => {
      if (this.subElements[component]) {
        this.subElements[component].append(this.components[component].element);
      }
    });

    this.addEventListeners();
    return this.element;
  }


  get template() {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable">
      </div>
    </div>`;

  }

  addEventListeners() {
    this.subElements.rangePicker.addEventListener('date-select', async event => {
      await this.updateComponents(event.detail.from, event.detail.to);
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

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}
