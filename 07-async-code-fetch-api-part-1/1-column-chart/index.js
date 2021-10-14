import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = data => data,
    url = '',
    range = {from: new Date(),
      to: new Date()}
  } = {})
  {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.render();
  }

  getTemplate () {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
        <div data-element="body" class="column-chart__chart">
           ${this.getChartColumns()}
        </div>
      </div>
    </div>
    `;
  }

  getLink() {
    return this.link ? `<a href="/${this.link}" class="column-chart__link">View all</a>` : '';
  }

  async render() {
    const element = document.createElement('div'); // (*)

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.update(this.range.from, this.range.to);

  }

  async loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    return await fetchJson(this.url);
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');
    this.range.from = from;
    this.range.to = to;
    const data = await this.loadData(from, to);
    this.data = Object.values(data);
    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
      this.subElements.body.innerHTML = this.getChartColumns();
      this.subElements.header.textContent = this.formatHeading(this.getChartValue(this.data));
    }
    return data;
  }

  getChartValue(data) {
    return data.reduce((sum, current) => sum + current, 0);
  }

  getColumnProps() {
    const maxValue = Math.max(...this.data);
    const scale = 50 / maxValue;

    return this.data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  getChartColumns() {
    return this.getColumnProps()
      .map(item => `<div style="--value: ${item.value}" data-tooltip=${item.percent}></div>`)
      .join('');
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

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
