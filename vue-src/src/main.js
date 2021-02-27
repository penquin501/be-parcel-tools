import Vue from "vue";
import App from "./App.vue";
import VueZoomer from "vue-zoomer";
import vSelect from "vue-select";
import router from "./router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "vue-select/dist/vue-select.css";
import "v-slim-dialog/dist/v-slim-dialog.css";
import SlimDialog from "v-slim-dialog";
import VueSession from "vue-session";
import VueMoment from "vue-moment";
import moment from "moment-timezone";
import Viewer from 'v-viewer';
import 'viewerjs/dist/viewer.css';
// import moment from 'moment';
// const moment = require('moment')
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(VueSession);
Vue.use(SlimDialog);
Vue.use(Viewer);
library.add(faUserSecret);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("v-select", vSelect);

require("moment/locale/th");

Vue.use(VueMoment, {
  moment
});

Vue.use(VueZoomer);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  router
}).$mount("#app");
