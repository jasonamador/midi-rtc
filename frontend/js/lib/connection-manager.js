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
    const rtc = this.getConnection(message.sender)
    const answer = await rtc.createAnswer(message.data)
    await signaling.send({
      type: 'answer',
      recipient: message.sender,
      data: answer
    })
  })

  signaling.on('answer', async message => {
    const rtc = this.getConnection(message.sender)
    await rtc.handleAnswer(message.data)
  })

  signaling.on('candidate', async message => {
    const rtc = this.getConnection(message.sender)
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
    const connection = this.getConnection(peer)
    const offer = await connection.createOffer()
    await signaling.send({
      type: 'offer',
      data: offer,
      recipient: peer
    })
  }

  this.sendTextMessage = async message => {
    const connection = this.getConnection(message.recipient)
    connection.sendText(message.text)
    addTextMessage(message)
  }

  const addTextMessage = message => {
    const conversation = this.getConversation(message.recipient)
    conversation.messages.push({ sender: this.me, recipient: message.recipient, text: message.text })
  }

  const getConnection = peer => {
    if (!connections[peer.handle]) {
      const rtc = new RTCClient()
      rtc.on('candidate', candidate => {
        signaling.send({
          type: 'candidate',
          peer: peer,
          data: candidate
        })
      })
      rtc.on('message:text', text => {
        connections[peer.handle].messages.push({ sender: peer, text })
        emit('update:conversation', peer)
      })
      connections[peer.handle] = {
        rtc,
        peer,
        messages: []
      }
    }
    return connections[peer.handle]
  }

  this.getConnection = peer => getConnection(peer).rtc
}
