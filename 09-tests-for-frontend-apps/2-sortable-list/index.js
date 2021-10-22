export default class SortableList {
  element;
  draggingElement;
  shift;
  placeHolder;

  onPointerDown = (event) => {
    const element = event.target.closest('.sortable-list__item');
    if (element) {
      if (event.target.closest('[data-grab-handle]')) {
        event.preventDefault();
        this.dragStart(element, event);
      }

      if (event.target.closest('[data-delete-handle]')) {
        event.preventDefault();
        element.remove();
      }
    }
  }

  onPointerUp = () => { this.dragStop();}

  onPointerMove = (event) => {
    this.moveAt(event.clientX, event.clientY);
    const prevElem = this.placeHolder.previousElementSibling;
    const nextElem = this.placeHolder.nextElementSibling;
    if (prevElem && this.isAbove(event.clientY, prevElem)) {
      return prevElem.before(this.placeHolder);
    }

    if (nextElem && !this.isAbove(event.clientY, nextElem)) {
      return nextElem.after(this.placeHolder);
    }

    const { firstElementChild, lastElementChild } = this.element;

    if (event.clientY < firstElementChild.getBoundingClientRect().top) {
      return firstElementChild.before(this.placeHolder);
    }

    if (event.clientY > lastElementChild.bottom) {
      return lastElementChild.after(this.placeHolder);
    }

  }


  constructor({
    items = [],
  } = {}) {
    this.items = items;
    this.render();
  }

  render() {
    const element = document.createElement('ul');
    element.classList.add('sortable-list');
    this.items.forEach(item => {
      item.classList.add('sortable-list__item');
      element.append(item);
    });

    this.element = element;
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  isAbove(clientY, item) {
    const rect = item.getBoundingClientRect();
    return clientY < rect.top + rect.height / 2;
  }

  createPlaceHolderElement(width, height) {
    const placeHolderElem = document.createElement('ul');
    placeHolderElem.style.height = `${height}px`;
    placeHolderElem.style.width = `${width}px`;
    placeHolderElem.classList.add('sortable-list__placeholder');
    return placeHolderElem;
  }

  dragStart(element, {clientX, clientY}) {
    this.draggingElement = element;
    this.draggingElement.classList.add('sortable-list__item_dragging');
    this.draggingElement.style.height = `${element.offsetHeight}px`;
    this.draggingElement.style.width = `${element.offsetWidth}px`;
    this.draggingElement.style.height = `${element.offsetHeight}px`;
    this.draggingElement.style.width = `${element.offsetWidth}px`;
    const clientRect = element.getBoundingClientRect();
    this.shift = {
      x: clientX - clientRect.left,
      y: clientY - clientRect.top
    };
    this.placeHolder = this.createPlaceHolderElement(element.offsetWidth, element.offsetHeight);
    this.draggingElement.after(this.placeHolder);
    this.element.append(this.draggingElement);
    this.moveAt(clientX, clientY);
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  removeEventListeners() {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  dragStop() {
    this.draggingElement.classList.remove('sortable-list__item_dragging');
    this.placeHolder.replaceWith(this.draggingElement);
    this.removeEventListeners();
    this.draggingElement = null;

  }

  moveAt(clientX, clientY) {
    this.draggingElement.style.left = `${clientX - this.shift.x}px`;
    this.draggingElement.style.top = `${clientY - this.shift.y}px`;
  }


  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.removeEventListeners();
    this.element = null;
  }


}
