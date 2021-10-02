export default class ColumnChart {
  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = data => data
  } = {})
  {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;
    this.render();
  }

  getTemplate () {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.label}
        <a href="/${this.link}" class="column-chart__link">View all</a>
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

  render() {
    const element = document.createElement('div'); // (*)

    element.innerHTML = this.getTemplate();

    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;

    if (this.data.length === 0) {
      this.element.classList.add('column-chart_loading');
    }
  }

  initEventListeners () {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  update(data) {
    this.data = data;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
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


}
