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

    const { firstElementChild, lastElementChild } = this.element;

    this.moveAt(event.clientX, event.clientY);
    const prevElem = this.placeHolder.previousElementSibling;
    const nextElem = this.placeHolder.nextElementSibling;

    if (event.clientY > lastElementChild.getBoundingClientRect().bottom) {
      return lastElementChild.after(this.placeHolder);
    }
    if (event.clientY < firstElementChild.getBoundingClientRect().top) {
      return firstElementChild.before(this.placeHolder);
    }

    if (prevElem && this.isAbove(event.clientY, prevElem)) {
      return prevElem.before(this.placeHolder);
    }

    if (nextElem && !this.isAbove(event.clientY, nextElem)) {
      return nextElem.after(this.placeHolder);
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
    const placeHolderElem = document.createElement('li');
    placeHolderElem.style.height = `${height}px`;
    placeHolderElem.style.width = `${width}px`;
    placeHolderElem.className = 'sortable-list__placeholder';
    return placeHolderElem;
  }

  dragStart(element, {clientX, clientY}) {
    this.draggingElement = element;

    element.style.height = `${element.offsetHeight}px`;
    element.style.width = `${element.offsetWidth}px`;

    const clientRect = element.getBoundingClientRect();
    this.shift = {
      x: clientX - clientRect.x,
      y: clientY - clientRect.y
    };
    this.placeHolder = this.createPlaceHolderElement(element.offsetWidth, element.offsetHeight);
    element.classList.add('sortable-list__item_dragging');
    element.before(this.placeHolder);
    this.element.append(element);
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
    this.placeHolder.replaceWith(this.draggingElement);
    this.draggingElement.classList.remove('sortable-list__item_dragging');

    this.draggingElement.style.left = '';
    this.draggingElement.style.top = '';
    this.draggingElement.style.width = '';
    this.draggingElement.style.height = '';

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
