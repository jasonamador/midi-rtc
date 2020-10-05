import Vue from 'vue'
let instance
export const getInstance = () => instance

export const useSignaling = (url) => {
  if (instance) return instance
  instance = new Vue({
    data () {
      return {
        connected: false,
        socket: null,
      }
    },
    methods: {
      send(message) {
        this.socket.send(JSON.stringify(message))
      },
      messageHandler(message) {
        try {
          message = JSON.parse(message.data)
        } catch (e) {
          this.$emit('error', 'Invalid message')
        }
        this.$emit(message.type, message)
      },
      open() {
        const socket = new WebSocket(url)
        const self = this
        socket.onopen = () => {
          self.connected = true
          self.$emit('open')
        }
        socket.onclose = () => {
          self.connected = false
          self.$emit('close')
        }
        socket.onerror = (e) => {
          self.$emit('error', e)
        }
        socket.onmessage = this.messageHandler
        this.socket = socket
      },
    },
  })
  return instance
}

export const Signaling = {
  install (Vue, options) {
    Vue.prototype.$signaling = useSignaling(options)
  }
}