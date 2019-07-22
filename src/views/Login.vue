<template>
  <div class="home">
    <h3>
      Usa tu cuenta Google para entrar al chat
      <code>{{ room }}</code>
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
    room: {
      type: String,
      default: (() => {
        // genera nombre aleatorio para la sala
        const charmap = "0123456789abcdefghijklmnopqrstuvwxyz";
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((s, x) => {
          const i = Math.floor(Math.random() * charmap.length);
          s += charmap[i];
          return s;
        }, "");
      })()
    }
  },

  methods: {
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
