<template>
  <div class="room">
    <md-card v-if="!connectedTo">
      <md-card-header>
        Not Connected Yet
      </md-card-header>
    </md-card>
    <md-card v-if="connectedTo">
      <md-card-header>
        <div class="md-title">Chat with {{connectedTo.handle}}</div>
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
      newMessage: '',
      messages: {},
      // _currentMessages: [],
      me: {}
    }
  },
  computed: {
    connectedTo () {
      return this.$rtc.connectedTo
    },
    currentMessages () {
      return this.messages[this.connectedTo.id]
    }
  },
  methods: {
    sendMessage() {
      this.$rtc.sendText(this.newMessage)
      this.currentMessages.push({sender: 'me', message: this.newMessage})
      this.messages = { ...this.messages }
      this.newMessage = ''
    }
  },
  mounted() {
    this.$rtc.$on('text', message => {
      this.currentMessages.push({sender: this.connectedTo.handle, message})
      this.messages = { ...this.messages }
    })
    this.$rtc.$on('change', () => {
      this.currentMessages = this.messages[this.connectedTo.id]
    })
    this.$rtc.$on('updateUsers', users => {
      users.forEach(u => {
        if (u.me) {
          this.me = u
        } else if (!this.messages[u.id]) {
            this.messages[u.id] = []
        }
      })
    })
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
