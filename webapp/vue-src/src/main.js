import Vue from 'vue'
import App from './App.vue'
import VueZoomer from 'vue-zoomer'
import vSelect from 'vue-select'
import router from './router'
import'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap' 
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import 'vue-select/dist/vue-select.css';
import 'v-slim-dialog/dist/v-slim-dialog.css'
import SlimDialog from 'v-slim-dialog'
import VueSession from 'vue-session'
Vue.use(VueSession)
Vue.use(SlimDialog)
library.add(faUserSecret)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('v-select', vSelect)

Vue.use(VueZoomer)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
