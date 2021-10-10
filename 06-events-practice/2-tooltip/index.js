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
    const left = event.clientX + 15;
    const top = event.clientY + 15;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }
  remove () {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
    this.remove();
  }
}

export default Tooltip;
