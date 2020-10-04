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
                <md-table-row v-for="input of inputs" :key="input.id">
                  <md-table-cell>{{input.id}}</md-table-cell>
                  <md-table-cell>{{input.name}}</md-table-cell>
                  <md-table-cell>{{input.manufacturer}}</md-table-cell>
                  <md-table-cell>{{input.state}}</md-table-cell>
                  <md-table-cell>{{input.connection}}</md-table-cell>
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
                <md-table-row v-for="output of outputs" :key="output.id" @click="selectOutput(output)">
                  <md-table-cell>{{output.id}}</md-table-cell>
                  <md-table-cell>{{output.name}}</md-table-cell>
                  <md-table-cell>{{output.manufacturer}}</md-table-cell>
                  <md-table-cell>{{output.state}}</md-table-cell>
                  <md-table-cell>{{output.connection}}</md-table-cell>
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
      selectedOutput: null,
      midiAccess: null
    }
  },
  components: {
  },
  methods: {
    discoverMidi () {
      const self = this
      navigator.requestMIDIAccess().then(midi => {
        self.midiAccess = midi
        midi.inputs.forEach(input => {
          self.inputs.push(input)
          console.log(input)
        })
        midi.outputs.forEach(output => {
          self.outputs.push(output)
        })
      })
    },
    selectOutput(output) {
      this.selectedOutput = output
    },
    playNote(note = 60) {
      const noteOnMessage = [0x90, note, 0x7f]    // note on, middle C, full velocity
      const output = this.selectedOutput;
      output.send(noteOnMessage);  //omitting the timestamp means send immediately.
      output.send([0x80, 60, 0x40], window.performance.now() + 1000.0 ); // Inlined array creation- note off, middle C,  
    }
  },
  mounted() {
    this.discoverMidi()
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


