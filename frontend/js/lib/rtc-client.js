export default function SingleRTC (url = 'stun:stun.1.google.com:19302') {
  // PRIVATE
  const rtcConfig = { iceServers: [{ url }] }
  const peerConnection = new RTCPeerConnection(rtcConfig)
  peerConnection.onconnectionstatechange = event => {
    this.connectionState = event.target.connectionState
  }
  peerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) {
      emit('candidate', candidate)
    }
  }
  peerConnection.ondatachannel = ({ channel }) => initChannel(channel)

  const eventTarget = new EventTarget()
  const channels = {}
  const emit = (eventName, payload) => eventTarget.dispatchEvent(new CustomEvent(eventName, { detail: payload }))
  const initChannel = channel => {
    channel.onopen = () => {
      channels[channel.label] = channel
    }
    channel.onclose = () => {
      channels[channel.label] = null
    }
    channel.onmessage = message => emit(`message:${channel.label}`, message.data)
  }

  // PUBLIC
  this.connectionState = 'none'
  this.sendText = message => channels.text.send(message)
  this.sendMidi = message => channels.midi.send(message)
  this.createOffer = async () => {
    const textChannel = peerConnection.createDataChannel('text')
    const midiChannel = peerConnection.createDataChannel('midi')
    initChannel(textChannel)
    initChannel(midiChannel)
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    return offer
  }
  this.createAnswer = async offerData => {
    const offer = new RTCSessionDescription(offerData)
    await peerConnection.setRemoteDescription(offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    return answer
  }
  this.addCandidate = candidate => peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  this.handleAnswer = answer => peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
  this.on = (eventName, handler) => eventTarget.addEventListener(eventName, event => handler(event.detail))
}
