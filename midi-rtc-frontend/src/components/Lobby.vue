<template>
  <div class="lobby-list">
    <md-card>
      <md-card-header>
        <div class="md-title">Lobby</div>
      </md-card-header>
      <md-card-content>
        <md-list :md-expand-single="true">
          <md-list-item md-expand v-for="user in users" :key="user.name" v-bind:class="{me: user.me}">
            <span v-bind:class="{me: user.me}">{{user.name}}</span>
            <div slot="md-expand">
              <div v-if="user.me">
                <md-field>
                  <label>Change Name</label>
                  <md-input v-model="newName"></md-input>
                  <span class="md-error" v-if="nameError">{{nameError}}</span>
                </md-field>
                <md-button @click="changeName()">Submit</md-button>
              </div>
              <div v-if="!user.me">
                <md-button @click="sendOffer(user.name)">Connect</md-button>
              </div>
            </div>
          </md-list-item>
        </md-list>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Lobby',
  data: () => {
    return {
      newName: '',
      nameError: ''
    }
  },
  computed: {
    ...mapState(['me', 'users'])
  },
  mounted () {
  },
  methods: {
    ...mapActions(['sendOffer', 'sendChangeName']),
    changeName() {
      if (this.users.map(u => u.name).includes(this.newName)) {
        this.nameError = `Username ${this.newName} is taken`
      } else {
        this.sendChangeName(this.newName)
        this.newName = ''
        this.nameError = ''
      }
      
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
