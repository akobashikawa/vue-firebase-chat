<template>
  <div class="container">
    <h3 class="text-center" :title="room">Mi Chat</h3>
    <p>
      <input
        type="text"
        class="form-control text-center col-sm-2 d-inline-block"
        v-model="newRoom"
        @keyup.enter="gotoRoom"
      />
    </p>
    <h4 class="text-center">
      <div style="width: 50px; display:inline-block;">
        <img :src="authUser.photoURL" alt="Foto" />
      </div>
      {{ authUser.displayName }}
      <button class="btn" @click="logout">Salir</button>
    </h4>
    <div class="messaging">
      <div class="inbox_msg">
        <div class="inbox_people">
          <div class="headind_srch">
            <div class="recent_heading">
              <h4>Reciente</h4>
            </div>
            <div class="srch_bar">
              <div class="stylish-input-group">
                <input
                  v-model="usersFilter"
                  type="text"
                  class="search-bar"
                  placeholder="Buscar"
                  @keyup="searchUser"
                />
              </div>
            </div>
          </div>
          <div class="inbox_chat">
            <div class="chat_list" v-for="user of usersFiltered" :key="user.email">
              <div class="chat_people">
                <div class="chat_img">
                  <img :src="user.photoURL" :title="user.displayName" />
                  <div class="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="user.email"
                      v-model="usersSelected[user.email]"
                    />
                    <label class="custom-control-label" :for="user.email">Ver</label>
                  </div>
                </div>
                <div class="chat_ib">
                  <h5>{{ user.displayName }}</h5>
                  <span
                    class="time_date"
                  >{{ user.lastUpdate.toDate() | moment('YYYY/MM/DD, HH:mm') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mesgs">
          <div class="msg_history">
            <div v-for="(message, index) of messagesFiltered" :key="index">
              <div v-if="message.author!==authUser.email" class="incoming_msg">
                <div class="incoming_msg_img">
                  <img :src="message.authorUser.photoURL" :title="message.author" />
                </div>
                <div class="received_msg">
                  <div class="received_withd_msg">
                    <p>{{ message.message }}</p>
                    <span
                      class="time_date"
                    >{{ message.authorUser.displayName }} | {{ message.createdAt.toDate() | moment('YYYY/MM/DD, HH:mm:ss') }}</span>
                  </div>
                </div>
              </div>
              <div v-if="message.author===authUser.email" class="outgoing_msg">
                <div class="sent_msg">
                  <p>{{ message.message }}</p>
                  <span
                    class="time_date"
                  >{{ message.authorUser.displayName }} | {{ message.createdAt.toDate() | moment('YYYY/MM/DD, HH:mm:ss') }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="type_msg">
            <div class="input_msg_write">
              <input
                @keyup.enter="saveMessage"
                v-model="message"
                type="text"
                class="write_msg"
                placeholder="Escribe un mensaje"
              />
              <button @click="saveMessage" class="msg_send_btn" type="button">
                <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <p class="text-center top_spac">Mi Chat - 2019JUL</p>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import firebase from "firebase";
import { setTimeout } from "timers";

export default {
  name: "home",

  props: {
    roomParam: {
      type: String
    }
  },

  data() {
    return {
      newRoom: null,
      message: null,
      messages: [],
      authUser: {},
      users: [],
      usersFilter: "",
      usersFiltered: [],
      usersSelected: null,
      searchTimeout: null
    };
  },

  computed: {
    room() {
      return this.$store.state.room;
    },

    messagesFiltered() {
      return this.messages.filter(
        message =>
          this.usersSelected.hasOwnProperty(message.author) &&
          this.usersSelected[message.author]
      );
    },

    roomUrl: function() {
      return window.location.href;
    }
  },

  methods: {
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router.push(`/login/${this.room}`);
        })
        .catch(error => {
          console.log(error);
        });
    },

    gotoRoom() {
      if (confirm(`Ir a la sala ${this.newRoom}?`)) {
        const roomUrl = `/?room=${this.newRoom}`;
        window.open(roomUrl, "_blank");
      }
    },

    saveMessage: function() {
      const roomRef = db.collection("rooms").doc(this.room);
      const newMessage = {
        message: this.message,
        author: this.authUser.email,
        createdAt: new Date()
      };
      roomRef
        .collection("chat")
        .add(newMessage)
        .then(docRef => {
          // console.log("Mensaje agregado con ID:", docRef.id);
          this.scrollToBottom(".msg_history");
          this.message = null;
        })
        .catch(error => {
          console.log("Error agregando mensaje:", error);
        });
    },

    fetchMessages() {
      const roomRef = db.collection("rooms").doc(this.room);
      roomRef
        .collection("chat")
        .orderBy("createdAt")
        .onSnapshot(querySnapshot => {
          let allMessages = [];
          querySnapshot.forEach(doc => {
            const data = doc.data();
            allMessages.push(data);
          });

          const promises = allMessages.map(message =>
            roomRef
              .collection("users")
              .doc(message.author)
              .get()
              .then(userDoc => {
                if (userDoc.exists) {
                  message.authorUser = userDoc.data();
                }
              })
          );

          Promise.all(promises).then(() => {
            // console.log(allMessages);
            this.messages = allMessages;
            setTimeout(() => {
              this.scrollToBottom(".msg_history");
            }, 100);
          });
        });
    },

    fetchUsers() {
      db.collection("rooms")
        .doc(this.room)
        .collection("users")
        .orderBy("lastUpdate")
        .onSnapshot(querySnapshot => {
          let allUsers = [];
          querySnapshot.forEach(doc => {
            const data = doc.data();
            allUsers.push(data);
          });
          // console.log(allUsers);
          this.users = allUsers;
          this.usersSelected = this.users.reduce((result, item) => {
            result[item.email] = true;
            return result;
          }, {});
          this.filterUsers();
          setTimeout(() => {
            this.scrollToBottom(".inbox_chat");
          }, 100);
        });
    },

    filterUsers() {
      if (this.usersFilter.trim().length > 0) {
        this.usersFiltered = this.users.filter(item => {
          const result = new RegExp(this.usersFilter, "i").test(
            item.displayName
          );
          return result;
        });
      } else {
        this.usersFiltered = this.users;
      }
    },

    searchUser() {
      window.clearTimeout(this.searchTimeout);
      this.searchTimeout = window.setTimeout(() => {
        this.filterUsers();
      }, 1000);
    },

    scrollToBottom(boxSelector) {
      let box = document.querySelector(boxSelector);
      if (!box) {
        return;
      }
      box.scrollTop = box.scrollHeight;
    }
  },

  created() {
    if (this.roomParam) {
      this.$store.commit("setRoom", this.roomParam);
      this.newRoom = this.roomParam;
    } else {
      this.$router.push("/login");
      return;
    }

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        let roomRef;
        roomRef = db.collection("rooms").doc(this.room);
        roomRef.set({ id: this.room }, { merge: true }); // si ya existe, merge

        this.authUser = user;
        const newUser = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastUpdate: new Date()
        };
        roomRef
          .collection("users")
          .doc(user.email)
          .set(newUser, { merge: true }); // si ya existe, merge
      } else {
        this.authUser = {};
      }
    });

    this.fetchUsers();
    this.fetchMessages();
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          next();
        } else {
          vm.$router.push(`/login/${vm.$store.state.room}`);
        }
      });
    });
  }
};
</script>

<style scoped>
.container {
  max-width: 1170px;
  margin: auto;
}
img {
  max-width: 100%;
}
.inbox_people {
  background: #f8f8f8 none repeat scroll 0 0;
  float: left;
  overflow: hidden;
  width: 40%;
  border-right: 1px solid #c4c4c4;
}
.inbox_msg {
  border: 1px solid #c4c4c4;
  clear: both;
  overflow: hidden;
}
.top_spac {
  margin: 20px 0 0;
}

.recent_heading {
  float: left;
  width: 40%;
}
.srch_bar {
  display: inline-block;
  text-align: right;
  width: 60%;
  padding: 0;
}
.headind_srch {
  padding: 10px 29px 10px 20px;
  overflow: hidden;
  border-bottom: 1px solid #c4c4c4;
}

.recent_heading h4 {
  color: #05728f;
  font-size: 21px;
  margin: auto;
}
.srch_bar input {
  border: 1px solid #cdcdcd;
  border-width: 0 0 1px 0;
  width: 80%;
  padding: 2px 0 4px 6px;
  background: none;
}
.srch_bar .input-group-addon button {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  padding: 0;
  color: #707070;
  font-size: 18px;
}
.srch_bar .input-group-addon {
  margin: 0 0 0 -27px;
}

.chat_ib h5 {
  font-size: 15px;
  color: #464646;
  margin: 0 0 8px 0;
}
.chat_ib h5 span {
  font-size: 13px;
  float: right;
}
.chat_ib p {
  font-size: 14px;
  color: #989898;
  margin: auto;
}
.chat_img {
  float: left;
  width: 11%;
}
.chat_ib {
  float: left;
  padding: 0 0 0 15px;
  width: 88%;
}

.chat_people {
  overflow: hidden;
  clear: both;
}
.chat_list {
  border-bottom: 1px solid #c4c4c4;
  margin: 0;
  padding: 18px 16px 10px;
}
.inbox_chat {
  height: 550px;
  overflow-y: scroll;
}

.active_chat {
  background: #ebebeb;
}

.incoming_msg_img {
  display: inline-block;
  width: 6%;
}
.received_msg {
  display: inline-block;
  padding: 0 0 0 10px;
  vertical-align: top;
  width: 92%;
}
.received_withd_msg p {
  background: #ade none repeat scroll 0 0;
  border-radius: 0 10px;
  color: #646464;
  font-size: 14px;
  margin: 0;
  padding: 5px 10px 5px 12px;
  width: 100%;
}
.time_date {
  color: #747474;
  display: block;
  font-size: 12px;
  margin: 8px 0 0;
}
.received_withd_msg {
  width: 57%;
}
.mesgs {
  float: left;
  padding: 30px 15px 0 25px;
  width: 60%;
}

.sent_msg p {
  background: #05728f55 none repeat scroll 0 0;
  border-radius: 0 10px;
  font-size: 14px;
  margin: 0;
  color: #000;
  padding: 5px 10px 5px 12px;
  width: 100%;
  position: relative;
}
.outgoing_msg {
  overflow: hidden;
  margin: 26px 0 26px;
}
.sent_msg {
  float: right;
  width: 46%;
}
.input_msg_write input {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  color: #4c4c4c;
  font-size: 15px;
  min-height: 48px;
  width: 100%;
}

.type_msg {
  border-top: 1px solid #c4c4c4;
  position: relative;
}
.msg_send_btn {
  background: #05728f none repeat scroll 0 0;
  border: medium none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-size: 17px;
  height: 33px;
  position: absolute;
  right: 0;
  top: 11px;
  width: 33px;
}
.msg_send_btn::before {
  content: ">";
}
.messaging {
  padding: 0 0 50px 0;
}
.msg_history {
  height: 516px;
  overflow-y: auto;
}
</style>
