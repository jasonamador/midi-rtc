<template>
  <div class="home">
    <h1>MIDI RTC</h1>
    <div class="md-layout md-gutter md-alignment-center-center">
      <div class="md-layout-item md-size-25">
        <lobby></lobby>
      </div>
      <div class="md-layout-item md-size-70">
        <room></room>
      </div>
      <div class="md-layout-item md-size-95">
        <midi></midi>
      </div>
      <md-dialog :md-active.sync="showOffer">
        <md-dialog-title>Invitation</md-dialog-title>
        <md-dialog-content>
          {{offer.sender}} wants to chat
        </md-dialog-content>
        <md-dialog-actions>
          <md-button @click=acceptOffer()>Accept</md-button>
          <md-button @click=declineOffer()>Decline</md-button>
        </md-dialog-actions>
      </md-dialog>
    </div>
    <div class="md-layout md-gutter md-alignment-center-center">
    </div>
  </div>
</template>
<script>

import Lobby from './Lobby'
import Room from './Room'
import Midi from './Midi'
// import { mapActions } from 'vuex'
export default {
  name: 'Home',
  components: {
    Lobby,
    Midi,
    Room
  },
  data: () => {
    return {
      showOffer: false,
      offer: {}
    }
  },
  computed: {
  },
  methods: {
    // ...mapActions(['connectRTC']),
    notifyOffer(message) {
      this.showOffer = true
      this.offer = message
    },
    declineOffer() {
      this.showOffer = false
    },
    acceptOffer() {
      this.showOffer = false
    },
  },
  mounted() {
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
.md-layout-item {
  margin-bottom: 20px;
}
a {
  color: #42b983;
}
</style>
