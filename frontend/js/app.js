import ConnectionManager from './lib/connection-manager.js'

const WS_URL = 'ws://localhost:9000'

window.addEventListener('load', initialize)

const components = {}
let connectionManager

function initialize () {
  connectionManager = new ConnectionManager({ signalingUrl: WS_URL })
  // get components
  components.userList = document.getElementById('user-list')
  components.chatWindow = document.getElementById('chat-window')
  components.midiManager = document.getElementById('midi-manager')
  components.me = document.getElementById('me')

  // start listeners
  components.userList.addEventListener('clickUser', event => selectConversation(event.detail.user))
  components.chatWindow.addEventListener('sendMessage', event => sendMessage(event.detail))
  components.midiManager.addEventListener('connect:input', event => connectMidiInput(event.detail))
  components.midiManager.addEventListener('connect:output', event => connectMidiOutput(event.detail))

  connectionManager.on('update:users', users => {
    components.me.innerHTML = connectionManager.me.handle
    components.userList.update(users)
    components.midiManager.updatePeers(users.filter(u => !u.me))
  })

  connectionManager.on('update:conversation', peer => {
    components.chatWindow.loadConversation(connectionManager.getConversation(peer))
  })
}

async function connectMidiInput ({ peer, input }) {
  input.onmidimessage = connectionManager.getSendMidi(peer)
}

async function connectMidiOutput ({ peer, output }) {
  connectionManager.getRTC(peer).on('midi', message => output.send(new Uint8Array(message)))
}

async function sendMessage (message) {
  await connectionManager.sendText(message)
  components.chatWindow.loadConversation(connectionManager.getConversation(message.recipient))
}

async function selectConversation (peer) {
  const connection = connectionManager.getRTC(peer)
  if (connection.connectionState !== 'connected') {
    await connectionManager.sendOffer(peer)
  }
  components.chatWindow.loadConversation(connectionManager.getConversation(peer))
}
