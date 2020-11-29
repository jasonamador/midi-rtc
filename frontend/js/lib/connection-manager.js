import SignalingEmitter from './signal-emitter.js'
import RTCClient from './rtc-client.js'

export default function ConnectionManager ({ signalingUrl, iceUrl }) {
  const signaling = new SignalingEmitter(signalingUrl)
  const eventTarget = new EventTarget()
  const emit = (eventName, payload) => eventTarget.dispatchEvent(new CustomEvent(eventName, { detail: payload }))

  const connections = {}

  this.me = null
  this.on = (eventName, handler) => eventTarget.addEventListener(eventName, event => handler(event.detail))

  signaling.on('updateUsers', message => {
    this.me = message.data.find(u => u.me === true)
    emit('update:users', message.data)
  })

  signaling.on('offer', async message => {
    const rtc = getConnection(message.sender).rtc
    const answer = await rtc.createAnswer(message.data)
    await signaling.send({
      type: 'answer',
      recipient: message.sender,
      data: answer
    })
  })

  signaling.on('answer', async message => {
    const rtc = getConnection(message.sender).rtc
    await rtc.handleAnswer(message.data)
  })

  signaling.on('candidate', async message => {
    const rtc = getConnection(message.sender).rtc
    await rtc.addCandidate(message.data)
  })

  this.getConversation = peer => {
    const connection = getConnection(peer)
    return {
      me: this.me,
      peer,
      messages: connection.messages
    }
  }

  this.sendOffer = async peer => {
    const connection = getConnection(peer)
    const offer = await connection.rtc.createOffer()
    await signaling.send({
      type: 'offer',
      data: offer,
      recipient: peer
    })
  }

  this.sendText = async message => {
    const connection = getConnection(message.recipient)
    connection.rtc.sendText(message.text)
    connection.messages.push({ sender: this.me, recipient: message.recipient, text: message.text })
  }

  this.sendMidi = async message => {
    const connection = getConnection(message.recipient)
    connection.rtc.sendMidi(message.text)
    connection.messages.push({ sender: this.me, recipient: message.recipient, text: message.text })
  }

  this.getSendMidi = peer => getConnection(peer).rtc.sendMidi

  const getConnection = peer => {
    if (!connections[peer.handle]) {
      const rtc = new RTCClient()
      connections[peer.handle] = {
        rtc,
        peer,
        messages: [],
        midiHandler: message => console.log(message)
      }
      rtc.on('candidate', candidate => {
        signaling.send({
          type: 'candidate',
          peer: peer,
          data: candidate
        })
      })
      // TODO: allow direct access to channels, too many middleman events
      rtc.on('message:text', text => {
        console.log('message', text)
        connections[peer.handle].messages.push({ sender: peer, text })
        emit('update:conversation', peer)
      })
      rtc.on('message:midi', connections[peer.handle].midiHandler)
    }
    return connections[peer.handle]
  }

  this.setMidiHandler = (peer, handler) => {
    const connection = getConnection(peer)
    connection.midiHandler = handler
  }

  this.getRTC = peer => getConnection(peer).rtc
}
