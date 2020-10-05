<template>
  <div class="room">
    <md-card v-if="!connectedTo">
      <md-card-header>
        Not Connected Yet
      </md-card-header>
    </md-card>
    <md-card v-if="rtcConnected">
      <md-card-header>
        <div class="md-title">Chat with {{connectedTo}}</div>
      </md-card-header>
      <md-card-content class="md-scrollbar">
        <md-list>
          <md-list-item v-for="message in currentMessages" :key="message.text" v-bind:class="{fromMe: message.sender === 'me'}">
            {{message.sender}}: {{message.message}}
          </md-list-item>
        </md-list>
        <md-field>
          <label>Message</label>
          <md-input v-model="newMessage"></md-input>
        </md-field>
        <md-button @click="sendMessage">Send</md-button>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
// import { mapState, mapActions } from 'vuex'

export default {
  name: 'Room',
  data: () => {
    return {
      newMessage: ''
    }
  },
  computed: {
    signalingConnected () {
      return this.$rtc.signalingConnected
    },
    rtcConnected () {
      return this.$rtc.connected
    },
    connectedTo () {
      return this.$rtc.connectedTo
    }
  },
  methods: {
    // ...mapActions(['sendRTC']),
    sendMessage() {
      // this.sendRTC(this.newMessage)
      this.$rtc.send(this.newMessage)
      this.newMessage = ''
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}

.me {
  color: #42b983;
}

a {
  color: #42b983;
}
</style>
