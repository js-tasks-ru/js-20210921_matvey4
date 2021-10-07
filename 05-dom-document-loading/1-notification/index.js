export default class NotificationMessage {
  static activeNotification;

  constructor(msg, {duration = 0, type = ''} = {}) {
    this.msg = msg;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  get template() {
    return `<div class="notification ${this.type}" style="--value:${this.duration}ms">
                <div class="timer"></div>
                <div class="inner-wrapper">
                        <div class="notification-header">${this.type}</div>
                        <div class="notification-body">
                                ${this.msg}
                        </div>
                </div>
            </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.destroy();
    }

    target.append(this.element);
    NotificationMessage.activeNotification = this;
    setTimeout(() => this.destroy(), this.duration);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

}
