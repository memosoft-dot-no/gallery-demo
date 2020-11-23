import Vue from "nativescript-vue";
import Vuex from "vuex";

import projectModule from "./project";

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        project: projectModule
    }
});
