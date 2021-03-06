class Tooltip {
  static activeTooltip;
  element;

  onPointerOut = () => {
    document.removeEventListener('pointermove', this.onPointerMove);
    this.remove();
  }


  onPointerOver = event => {
    const htmlEl = event.target.closest('[data-tooltip]');
    if (htmlEl) {
      this.render(htmlEl.dataset.tooltip);
      document.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerMove = event => {
    this.move(event);
  }

  constructor() {
    if (Tooltip.activeTooltip) {
      return Tooltip.activeTooltip;
    }

    Tooltip.activeTooltip = this;
  }

  render(text) {
    this.element = document.createElement('div');
    this.element.classList.add('tooltip');
    this.element.innerHTML = text;

    document.body.append(this.element);
  }

  initialize() {
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  move(event) {
    const left = event.clientX + 10;
    const top = event.clientY + 10;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }
  remove () {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
  removeEventListeners() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}

export default Tooltip;
