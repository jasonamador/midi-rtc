import Vue from 'vue'
import App from './App.vue'
import VueNativeSock from 'vue-native-websocket'
import store from './store'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import { MdButton, MdTable, MdList, MdContent, MdTabs, MdCard, MdField } from 'vue-material/dist/components'

Vue.use(MdButton)
Vue.use(MdCard)
Vue.use(MdContent)
Vue.use(MdTabs)
Vue.use(MdField)
Vue.use(MdList)
Vue.use(MdTable)

Vue.config.productionTip = false
Vue.use(VueNativeSock, 'ws://localhost:9000', { store, format: 'json' })

new Vue({
  render: h => h(App),
  store
}).$mount('#app')
