<template>
  <div class="lobby-list">
    <md-card>
      <md-card-header>
        <div class="md-title">Lobby</div>
      </md-card-header>
      <md-card-content>
        <md-list :md-expand-single="true">
          <md-list-item md-expand v-for="user in users" :key="user.handle" v-bind:class="{me: user.me}">
            <span v-bind:class="{me: user.me}">{{user.handle}}</span>
            <div slot="md-expand">
              <div v-if="user.me">
                <md-field>
                  <label>Change Name</label>
                  <md-input v-model="newHandle"></md-input>
                  <span class="md-error" v-if="handleError">{{handleError}}</span>
                </md-field>
                <md-button @click="changeHandle()">Submit</md-button>
              </div>
              <div v-if="!user.me">
                <md-button @click="sendOffer(user)">Connect</md-button>
              </div>
            </div>
          </md-list-item>
        </md-list>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
// import { mapState, mapActions } from 'vuex'

export default {
  name: 'Lobby',
  data: () => {
    return {
      users: [],
      me: {},
      newHandle: '',
      handleError: ''
    }
  },
  computed: {
    // ...mapState(['me', 'users'])
  },
  mounted () {
    this.$rtc.$on('updateUsers', users => {
      this.users = users
    })
  },
  methods: {
    // ...mapActions(['sendOffer', 'sendChangeName']),
    changeHandle() {
      if (this.users.map(u => u.handle).includes(this.newHandle)) {
        this.handleError = `Username ${this.newHandle} is taken`
      } else {
        // this.$rtc.send({
        //   type: 'changeHandle',
        //   recipientId: 'server',
        //   data: this.newHandle
        // })
        this.newName = ''
        this.nameError = ''
      }
    },
    sendOffer(user) {
      this.$rtc.sendOffer(user.id)
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
