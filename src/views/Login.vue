<template>
  <div class="home">
    <h3>
      Usa tu cuenta Google para entrar al chat
      <br />
      <input
        type="text"
        class="form-control text-center col-sm-2 d-inline-block"
        placeholder="ID de la sala"
        v-model="room"
      />
    </h3>

    <p class="mt-4">
      <button @click="login" class="btn btn-primary">Login con Google</button>
    </p>
  </div>
</template>

<script>
// @ is an alias to /src
import firebase from "firebase";

export default {
  name: "login",

  props: {
    _room: {
      type: String
    }
  },

  data() {
    return {
      room: ""
    };
  },

  created() {
    if (this._room) {
      this.room = this._room;
    } else {
      this.room = this.getRandomRoomId();
    }
  },

  methods: {
    getRandomRoomId() {
      // genera nombre aleatorio para la sala
      const charmap = "0123456789abcdefghijklmnopqrstuvwxyz";
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((s, x) => {
        const i = Math.floor(Math.random() * charmap.length);
        s += charmap[i];
        return s;
      }, "");
    },

    login() {
      const room = this.room;
      const $router = this.$router;

      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/contacts.readonly");

      firebase
        .auth()
        .signInWithPopup(provider)
        .then(function(result) {
          // console.log({ result });
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;

          $router.push("/?room=" + room);
        })
        .catch(function(error) {
          console.log({ error });
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
          alert(`ERROR: ${errorCode}: ${errorMessage}`);
        });
    }
  }
};
</script>
