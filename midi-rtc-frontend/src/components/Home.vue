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
    </div>
    <div class="md-layout md-gutter md-alignment-center-center">
    </div>
  </div>
</template>
<script>

import Lobby from './Lobby'
import Room from './Room'
import Midi from './Midi'
import { mapActions } from 'vuex'
export default {
  name: 'Home',
  components: {
    Lobby,
    Midi,
    Room
  },
  methods: {
    ...mapActions(['connectRTC']),
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
.md-layout-item {
  margin-bottom: 20px;
}
a {
  color: #42b983;
}
</style>
