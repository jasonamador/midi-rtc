import Vue from 'vue'
let instance
export const getInstance = () => instance

export const useSingleRTC = ({iceUrl, signalingUrl}) => {
  if (instance) return instance
  instance = new Vue({
    data () {
      return {
        signaling: null,
        connection: null,
        connected: false,
        connectedTo: '',
        channel: null
      }
    },
    methods: {
      sendSignal(message) {
        this.signaling.send(JSON.stringify(message))
      },
      sendOffer(recipientId) {
        const self = this
        this.connectedTo = recipientId
        const channel = this.connection.createDataChannel('messenger')
        channel.onmessage = message => self.$emit('rtc:message', message.data)
        this.channel = channel
        this.connection.createOffer()
          .then(offer => {
            self.connection.setLocalDescription(offer)
            self.sendSignal({ 
              type: 'offer', 
              data: offer, 
              recipientId: recipientId 
            })
          })
          .catch(e => self.$emit('error', e))
      },
      handleOffer(message) {
        const self = this
        const offer = message.data
        this.connectedTo = message.senderId
        return this.connection
          .setRemoteDescription(new RTCSessionDescription(offer))
          .then(() => self.connection.createAnswer())
          .then(answer => {
            self.connection.setLocalDescription(answer)
            self.sendSignal({
              type: 'answer',
              data: answer,
              recipientId: message.senderId
            })
          })
          .catch(e => self.$emit('error', e))
      },
      handleCandidate(message) {
        const candidate = message.data
        this.connectedTo = message.senderId
        this.connection.addIceCandidate(new RTCIceCandidate(candidate))
      },
      handleAnswer(message) {
        const answer = message.data
        this.connectedTo = message.senderId
        this.connection.setRemoteDescription(new RTCSessionDescription(answer))
      },
      signalHandler(message) {
        try {
          message = JSON.parse(message.data)
          switch (message.type) {
            case 'offer': 
              this.handleOffer(message)
              break;
            case 'answer':
              this.handleAnswer(message)
              break;
            case 'candidate': 
              this.handleCandidate(message)
              break;
            case 'updateUsers':
              this.$emit('updateUsers', message.data)
              break;
          }
        } catch (e) {
          this.$emit('signaling:error', 'Invalid message')
        }
      }
    },
    created() {
      const self = this

      const socket = new WebSocket(signalingUrl)
      socket.onopen = () => {
        self.signalingConnected = true
        self.$emit('signaling:open')
      }
      socket.onclose = () => {
        self.signalingConnected = false
        self.$emit('signaling:close')
      }
      socket.onerror = (e) => {
        self.$emit('signaling:error', e)
      }
      socket.onmessage = this.signalHandler
      this.signaling = socket

      const rtcConfig = {
        iceServers: [{ url: iceUrl }]
      }
      let connection = new RTCPeerConnection(rtcConfig)

      connection.onicecandidate = ({ candidate }) => {
        if (!self.connectedTo) {
          console.log('no connectedTo')
        }
        if (candidate && !!self.connectedTo) {
          this.sendSignal({
            type: 'candidate',
            data: candidate,
            recipientId: self.connectedTo
          })
        }
      }

      connection.ondatachannel = event => {
        console.log('channel')
        let receiveChannel = event.channel

        receiveChannel.onopen = () => {
          console.log('open')
          self.connected = true
        }

        receiveChannel.onclose = () => {
          self.connected = false
          self.connectedTo = ''
        }

        receiveChannel.onmessage = message => self.$emit('message', message.data)
        this.channel = receiveChannel
      }
      this.connection = connection
    }
  })
  return instance
}

export const SingleRTC = {
  install (Vue, options) {
    Vue.prototype.$rtc = useSingleRTC(options)
  }
}