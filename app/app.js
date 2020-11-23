import Vue from "nativescript-vue";
import Gallery from "./components/Gallery";
import Vuex from "vuex";
import { store } from "./store/store";
import {
    getString,
    setString,
    clear
} from "tns-core-modules/application-settings";

Vue.use(Vuex);

Vue.prototype.$store = store;
Vue.prototype.setSetting = setString;

new Vue({
    render: h => h("frame", [h(Gallery)]),
    store
}).$start();
