<template>
  <div class="user-list">
    <md-card>
      <md-card-header>
        <div class="md-title">Me</div>
      </md-card-header>
      <md-card-content>
        <div v-if="!showInput">
          <md-list>
            <md-list-item>
              Handle: {{me.handle}}
            </md-list-item>
            <md-list-item>
              Id: {{me.id}}
            </md-list-item>
            <md-list-item>
              Peer Connection: {{rtcState}}
            </md-list-item>
            <md-list-item>
              Text Data Channel: {{textState}}
            </md-list-item>
            <md-list-item>
              MIDI Data Channel: {{midiState}}
            </md-list-item>
          </md-list>
        </div>
        <md-field v-if="showInput">
          <label>New Handle</label>
          <md-input v-model="newHandle"></md-input>
        </md-field>
      </md-card-content>
    </md-card>
    <md-card>
      <md-card-header>
        <div class="md-title">Others</div>
      </md-card-header>
      <md-card-content>
        <md-list :md-expand-single="true">
          <md-list-item v-for="user in notMe" :key="user.handle" @click="sendOffer(user)">
            <span>{{user.handle}}</span>
          </md-list-item>
        </md-list>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
// import { mapState, mapActions } from 'vuex'

export default {
  name: 'Users',
  data: () => {
    return {
      users: [],
      newHandle: '',
      handleError: '',
      showInput: false
    }
  },
  computed: {
    me () {
      return this.users.find(u => u.me) || {}
    },
    notMe () {
      return this.users.filter(u => !u.me)
    },
    rtcState () {
      return this.$rtc.rtcState
    },
    textState () {
      return this.$rtc.channels.textState
    },
    midiState () {
      return this.$rtc.channels.midiState
    }
  },
  mounted () {
    this.$rtc.$on('updateUsers', users => {
      this.users = users
    })
  },
  methods: {
    changeHandle() {
      if (this.users.map(u => u.handle).includes(this.newHandle)) {
        this.handleError = `Username ${this.newHandle} is taken`
      } else {
        this.newName = ''
        this.nameError = ''
      }
    },
    sendOffer(user) {
      this.$rtc.sendOffer(user)
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
