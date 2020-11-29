export default function EventBus () {
  const eventTarget = new EventTarget()
  this.emit = (eventName, payload) => eventTarget.dispatchEvent(new CustomEvent(eventName, { detail: payload }))
  this.on = (eventName, handler) => {
    eventTarget.addEventListener(eventName, event => handler(event.detail))
  }
}
