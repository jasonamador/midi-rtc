<template>
  <div class="home">
    <h1>MIDI RTC</h1>
    <div class="md-layout">
      <div class="md-layout-item md-size-30">
        <lobby></lobby>
      </div>
      <div class="md-layout-item md-size-70">
        <room></room>
      </div>
    </div>
  </div>
</template>
<script>

import Lobby from './Lobby'
import Room from './Room'
import { mapActions } from 'vuex'
export default {
  name: 'Home',
  components: {
    Lobby,
    Room
  },
  methods: {
    ...mapActions(['connectRTC'])
  },
  mounted() {
    this.connectRTC()
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
a {
  color: #42b983;
}
</style>
