<template>
  <div class="midi">
    <md-card>
      <md-card-header>
        MIDI
      </md-card-header>
      <md-card-content>
        <div class="md-layout md-gutter">
          <div class="md-layout-item">
            <md-content>
              <h3>
                Inputs
              </h3>
              <md-table>
                <md-table-row>
                  <md-table-head>ID</md-table-head>
                  <md-table-head>Name</md-table-head>
                  <md-table-head>Manufacturer</md-table-head>
                  <md-table-head>State</md-table-head>
                  <md-table-head>Connection</md-table-head>
                </md-table-row>
                <md-table-row v-for="i of inputs" :key="i.id" @click="selectInput(i)" v-bind:class="{selectedMidi: i === input}" >
                  <md-table-cell>{{i.id}}</md-table-cell>
                  <md-table-cell>{{i.name}}</md-table-cell>
                  <md-table-cell>{{i.manufacturer}}</md-table-cell>
                  <md-table-cell>{{i.state}}</md-table-cell>
                  <md-table-cell>{{i.connection}}</md-table-cell>
                </md-table-row>
              </md-table>
            </md-content>
          </div>
          <div class="md-layout-item">
            <md-content>
              <h3>Outputs</h3>
              <md-table>
                <md-table-row>
                  <md-table-head>ID</md-table-head>
                  <md-table-head>Name</md-table-head>
                  <md-table-head>Manufacturer</md-table-head>
                  <md-table-head>State</md-table-head>
                  <md-table-head>Connection</md-table-head>
                </md-table-row>
                <md-table-row v-for="o of outputs" :key="o.id" @click="selectOutput(o)" v-bind:class="{selectedMidi: o === output}">
                  <md-table-cell>{{o.id}}</md-table-cell>
                  <md-table-cell>{{o.name}}</md-table-cell>
                  <md-table-cell>{{o.manufacturer}}</md-table-cell>
                  <md-table-cell>{{o.state}}</md-table-cell>
                  <md-table-cell>{{o.connection}}</md-table-cell>
                </md-table-row>
              </md-table>
            </md-content>
          </div>
          <md-button @click=playNote()>Play Note</md-button>
        </div>
      </md-card-content>
    </md-card>
  </div>
</template>
<script>

export default {
  name: 'Midi',
  data: () => {
    return {
      inputs: [],
      outputs: [],
      output: null,
      input: null,
      midiAccess: null
    }
  },
  components: {
  },
  methods: {
    async discoverMidi () {
      this.midi = await navigator.requestMIDIAccess()
      this.refreshMidi()
      this.midi.onstatechange = this.refreshMidi
    },
    refreshMidi() {
      this.inputs = []
      this.outputs = []

      this.midi.inputs.forEach(input => {
        this.inputs.push(input)
      })
      this.midi.outputs.forEach(output => {
        this.outputs.push(output)
      })
    },
    selectOutput(output) {
      this.output = output
    },
    selectInput(input) {
      input.onmidimessage = this.sendMidi
      this.input = input
    },
    sendMidi(message) {
      this.$rtc.sendMidi(message.data)
    },
    playNote(note = 60) {
      const noteOnMessage = [0x90, note, 0x7f]    // note on, middle C, full velocity
      const output = this.output;
      output.send(noteOnMessage);  //omitting the timestamp means send immediately.
      output.send([0x80, 60, 0x40], window.performance.now() + 1000.0 ); // Inlined array creation- note off, middle C,  
    },
    handleMidi(message) {
      this.output.send(new Uint8Array(message))
    }
  },
  mounted() {
    this.discoverMidi()
    this.$rtc.$on('midi', this.handleMidi)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.selectedMidi {
  /* background-color: #999999; */
  font-weight: bold;
}
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


