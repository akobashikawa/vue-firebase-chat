import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import firebase from 'firebase'

require("firebase/firestore");

var firebaseConfig = {
  apiKey: "AIzaSyClPhm0yIaC5PkIpcF8o7g5HVaATqKWqls",
  authDomain: "rulokoba-vue-firebase-chat.firebaseapp.com",
  databaseURL: "https://rulokoba-vue-firebase-chat.firebaseio.com",
  projectId: "rulokoba-vue-firebase-chat",
  storageBucket: "",
  messagingSenderId: "250359732445",
  appId: "1:250359732445:web:fa24bb533a75cca8"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

window.db = db;

Vue.config.productionTip = false

Vue.use(require('vue-moment'));

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
