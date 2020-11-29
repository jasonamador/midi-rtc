export default function SignalEmitter (url) {
  const ws = new WebSocket(url)
  const eventTarget = new EventTarget()
  const emit = (eventName, payload) => eventTarget.dispatchEvent(new CustomEvent(eventName, { detail: payload }))

  ws.onmessage = message => {
    try {
      message = JSON.parse(message.data)
    } catch (e) {
      emit('parseError', e)
      return
    }

    emit(message.type, message)
  }

  ws.onopen = () => {
    this.connected = true
    emit('open')
  }

  ws.onclose = () => {
    this.connected = false
    emit('close')
  }

  ws.onerror = error => {
    emit('error', error)
  }

  this.connected = false
  this.on = (eventName, handler) => {
    eventTarget.addEventListener(eventName, event => handler(event.detail))
  }
  this.send = message => ws.send(JSON.stringify(message))
}
