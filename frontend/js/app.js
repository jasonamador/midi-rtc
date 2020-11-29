import SignalingEmitter from './lib/signal-emitter.js'
import RTCClient from './lib/rtc-client.js'

const WS_URL = 'ws://localhost:9000'

window.addEventListener('load', initialize)

let signaling, me
const conversations = {}
const elements = {}

function initialize () {
  signaling = new SignalingEmitter(WS_URL)

  const userList = document.getElementById('user-list')
  userList.addEventListener('clickUser', event => selectConversation(event.detail.user))
  elements.userList = userList

  elements.chatWindow = document.getElementById('chat-window')
  elements.me = document.getElementById('me')
  elements.chatWindow.addEventListener('sendMessage', event => sendMessage(event.detail))

  signaling.on('updateUsers', message => {
    me = message.data.find(u => u.me === true)
    elements.me.innerHTML = me.handle
    userList.update(message.data)
  })
  signaling.on('offer', handleOffer)
  signaling.on('answer', handleAnswer)
  signaling.on('candidate', handleCandidate)
}

async function sendMessage (message) {
  const conversation = getConversation(message.recipient)
  await conversation.rtc.sendText(message.text)
  conversation.messages.push(message)
  elements.chatWindow.loadConversation({ me, peer: message.recipient, messages: conversation.messages })
}

async function selectConversation (peer) {
  const conversation = getConversation(peer)
  if (conversation.rtc.connectionState !== 'connected') {
    const offer = await conversation.rtc.createOffer()
    await signaling.send({
      type: 'offer',
      data: offer,
      recipient: peer
    })
  }
  elements.chatWindow.loadConversation({ me, peer, messages: conversation.messages })
}

const getConversation = peer => {
  if (!conversations[peer.handle]) {
    const rtc = new RTCClient()
    rtc.on('candidate', candidate => {
      signaling.send({
        type: 'candidate',
        peer: peer,
        data: candidate
      })
    })
    rtc.on('message:text', text => {
      conversations[peer.handle].messages.push({ sender: peer, text })
      elements.chatWindow.loadConversation({ me, peer, messages: conversations[peer.handle].messages })
    })
    conversations[peer.handle] = {
      rtc,
      peer,
      messages: []
    }
  }
  return conversations[peer.handle]
}

const handleOffer = async message => {
  const rtc = getConversation(message.sender).rtc
  const answer = await rtc.createAnswer(message.data)
  await signaling.send({
    type: 'answer',
    recipient: message.sender,
    data: answer
  })
}

const handleAnswer = async message => {
  const rtc = getConversation(message.sender).rtc
  await rtc.handleAnswer(message.data)
}

const handleCandidate = async message => {
  const rtc = getConversation(message.sender).rtc
  await rtc.addCandidate(message.data)
}
