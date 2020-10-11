import Vue from 'vue'
let instance
export const getInstance = () => instance

export const useSingleRTC = ({
  iceUrl,
  signalingUrl
}) => {
  if (instance) return instance
  const rtcConfig = {
    iceServers: [{
      url: iceUrl
    }]
  }
  const pc = new RTCPeerConnection(rtcConfig)
  const socket = new WebSocket(signalingUrl)

  instance = new Vue({
    data() {
      return {
        signaling: {
          state: 'none',
          handle: 'none'
        },
        rtcState: 'none',
        channels: {
          midiState: 'none',
          textState: 'none',
          midi: null,
          text: null
        },
        connectedTo: '',
      }
    },
    computed: {},
    methods: {
      sendSignal(message) {
        socket.send(JSON.stringify(message))
      },
      sendText(message) {
        this.channels.text.send(message)
      },
      sendMidi(message) {
        this.channels.midi.send(message)
      },
      async sendOffer(recipient) {
        this.connectedTo = recipient
        const textChannel = pc.createDataChannel('text')
        const midiChannel = pc.createDataChannel('midi')
        this.initChannel(textChannel)
        this.initChannel(midiChannel)
        try {
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          this.sendSignal({
            type: 'offer',
            data: offer,
            recipient
          })
        } catch (e) {
          this.$emit('error', e)
        }
      },
      async handleOffer(message) {
        console.log('got offer', message.sender)
        this.connectedTo = message.sender
        try {
          const offer = new RTCSessionDescription(message.data)
          await pc.setRemoteDescription(offer)
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          await this.sendSignal({
            type: 'answer',
            data: answer,
            recipient: message.sender
          })
        } catch (e) {
          this.$emit('error', e)
        }
      },
      handleCandidate(message) {
        console.log('got candidate signal', message.sender.handle)
        const candidate = message.data
        pc.addIceCandidate(new RTCIceCandidate(candidate))
      },
      handleAnswer(message) {
        console.log('got answer signal', message.sender.handle)
        const answer = message.data
        this.connectedTo = message.sender
        pc.setRemoteDescription(new RTCSessionDescription(answer))
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
      },
      initSignaling() {
        socket.onopen = () => {
          this.signaling.state = 'open'
        }
        socket.onclose = () => {
          this.signaling.state = 'closed'
        }
        socket.onerror = e => {
          this.$emit('signaling:error', e)
        }
        socket.onmessage = this.signalHandler
      },
      initPeerConnection() {
        pc.onconnectionstatechange = event => {
          this.rtcState = event.target.connectionState
        }
        pc.onicecandidate = ({
          candidate
        }) => {
          if (candidate) {
            this.sendSignal({
              type: 'candidate',
              data: candidate,
              recipient: this.connectedTo
            })
          }
        }
        pc.ondatachannel = ({channel}) => this.initChannel(channel)
      },
      initChannel(channel) {
        channel.onopen = () => {
          this.$set(this.channels, channel.label + 'State', 'open')
        }
        channel.onclose = () => {
          this.$set(this.channels, channel.label + 'State', 'closed')
        }
        channel.onmessage = message => this.$emit(channel.label, message.data)
        this.$set(this.channels, channel.label, channel)
      },
    },
    created() {
      this.initSignaling()
      this.initPeerConnection()
    }
  })
  return instance
}

export const SingleRTC = {
  install(Vue, options) {
    Vue.prototype.$rtc = useSingleRTC(options)
  }
}