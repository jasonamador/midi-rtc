import ConnectionManager from './lib/connection-manager.js'

const WS_URL = 'ws://localhost:9000'

window.addEventListener('load', initialize)

const components = {}
let connectionManager

function initialize () {
  connectionManager = new ConnectionManager({ signalingUrl: WS_URL })
  components.userList = document.getElementById('user-list')
  components.chatWindow = document.getElementById('chat-window')
  components.me = document.getElementById('me')

  components.userList.addEventListener('clickUser', event => selectConversation(event.detail.user))
  components.chatWindow.addEventListener('sendMessage', event => sendMessage(event.detail))

  connectionManager.on('update:users', users => {
    components.me.innerHTML = connectionManager.me.handle
    components.userList.update(users)
  })
  connectionManager.on('update:conversation', peer => {
    components.chatWindow.loadConversation(connectionManager.getConversation(peer))
  })
}

async function sendMessage (message) {
  await connectionManager.sendTextMessage(message)
  components.chatWindow.loadConversation(connectionManager.getConversation(message.recipient))
}

async function selectConversation (peer) {
  const connection = connectionManager.getConnection(peer)
  if (connection.connectionState !== 'connected') {
    await connectionManager.sendOffer(peer)
  }
  components.chatWindow.loadConversation(connectionManager.getConversation(peer))
}

