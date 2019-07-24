import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    room: null
  },
  mutations: {
    setRoom(state, room) {
      state.room = room;
    },

    // genera id aleatorio para la sala
    randomRoom(state) {
      const charmap = "0123456789abcdefghijklmnopqrstuvwxyz";
      const room = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((s, x) => {
        const i = Math.floor(Math.random() * charmap.length);
        s += charmap[i];
        return s;
      }, "");
      state.room = room;
    }
  },
  actions: {

  }
})
