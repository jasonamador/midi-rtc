import Vue from 'vue'
import App from './App.vue'
// import VueNativeSock from 'vue-native-websocket'
import store from './store'

import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import { MdButton, MdDialog, MdTable, MdList, MdContent, MdTabs, MdCard, MdField } from 'vue-material/dist/components'
Vue.use(MdButton)
Vue.use(MdCard)
Vue.use(MdContent)
Vue.use(MdDialog)
Vue.use(MdTabs)
Vue.use(MdField)
Vue.use(MdList)
Vue.use(MdTable)

// import {Signaling} from './plugins/signaling'
// Vue.use(Signaling, process.env.VUE_APP_SIGNALING_URL)

import {SingleRTC} from './plugins/single-rtc'
Vue.use(SingleRTC, {iceUrl: 'stun:stun.1.google.com:19302', signalingUrl: process.env.VUE_APP_SIGNALING_URL})

Vue.config.productionTip = false
// Vue.use(VueNativeSock, process.env.VUE_APP_SIGNALING_URL, { store, format: 'json' })

new Vue({
  render: h => h(App),
  store
}).$mount('#app')
