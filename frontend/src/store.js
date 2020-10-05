import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: {
      open: false,
    },
    me: {},
    users: [],
    connectedTo: '',
    rtc: {
      connection: null,
      channel: null,
    },
    messages: {},
    currentMessages: []
  },
  mutations: {
    // updateUsers (state, message) {
    //   state.me = message.users.find(u => u.me)
    //   state.users = message.users
    // },
    // updateChannel (state, channel) {
    //   state.rtc.channel = channel
    // },
    // updateConnection (state, connection) {
    //   state.rtc.connection = connection
    // },
    // setConnectedTo(state, user) {
    //   state.connectedTo = user
    // },
    // answer (state, message) {
    //   state.connectedTo = message.sender
    //   state.rtc.connection.setRemoteDescription(new RTCSessionDescription(message.answer))
    // },
    // candidate (state, message) {
    //   state.rtc.connection.addIceCandidate(new RTCIceCandidate(message.candidate));
    // },
    // addMessage (state, message) {
    //   if (!Array.isArray(state.messages[state.connectedTo])){
    //     state.messages[state.connectedTo] = []
    //   }
    //   state.messages[state.connectedTo].push(message)
    //   state.currentMessages = [...state.messages[state.connectedTo]]
    // }
  },
  actions: {
    error (context, err) {
      console.log(err)
    },
    offer ({state, commit}, message) {
      console.log('offer', message)
      const connection = state.rtc.connection
      commit('setConnectedTo', message.sender)
      connection
        .setRemoteDescription(new RTCSessionDescription(message.offer))
        .then(() => connection.createAnswer())
        .then(answer => connection.setLocalDescription(answer))
        .then(() =>
          Vue.prototype.$socket.sendObj({ action: "answer", answer: connection.localDescription, recipient: message.sender })
        )
        .catch(console.error)
    },
    connectRTC ({state, commit}) {
      const configuration = {
        iceServers: [{ url: "stun:stun.1.google.com:19302" }]
      }
      let connection = new RTCPeerConnection(configuration)

      connection.onicecandidate = ({ candidate }) => {
        if (candidate && !!state.connectedTo) {
          Vue.prototype.$socket.sendObj({
            recipient: state.connectedTo,
            action: 'candidate',
            candidate
          })
        }
      };
      connection.ondatachannel = event => {
        console.log("Data channel is created!")
        let receiveChannel = event.channel
        receiveChannel.onopen = () => {
          console.log("Data channel is open and ready to be used.")
        }
        receiveChannel.onmessage = message => commit('addMessage', {sender: state.connectedTo, message: message.data})
        commit('updateChannel', receiveChannel)
      };
      commit('updateConnection', connection)
    },
    sendRTC ({state, commit}, message) {
      state.rtc.channel.send(message)
      commit('addMessage', { sender: state.me.name, message })
    },
    sendOffer ({state, commit}, recipient) {
      const dataChannel = state.rtc.connection.createDataChannel('messenger')
      dataChannel.onmessage = message => commit('addMessage', {sender: recipient, message: message.data})
      commit('updateChannel', dataChannel)
      const connection = state.rtc.connection
      connection.createOffer()
        .then(offer => connection.setLocalDescription(offer))
        .then(() => {
          const message = {
            action: 'offer',
            recipient,
            offer: connection.localDescription
          }
          Vue.prototype.$socket.sendObj(message)
        })
        .catch(console.error)
    },
    // sendAnswer(context, answer) {
    // },
    sendChangeName(context, name) {
      const message = {
        action: 'changeName',
        name
      }
      Vue.prototype.$socket.sendObj(message)
    }
  }
})
