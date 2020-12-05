<template>
  <div id="app">
    <div v class="login" v-if="state == 'login'">
      <div class="content2">
        <div class="row">
          <h3>Parcel-Tool</h3>
        </div>

        <input placeholder="Username" v-model="username" v-on:keyup.enter="logIn" />
        <br />
        <input placeholder="Password" type="password" v-on:keyup.enter="logIn" v-model="password" />
        <br />
        <br />
        <button v-on:click="logIn" class="btn btn-outline-success">LOGIN</button>
      </div>
    </div>

    <div v-if="state == 'blank'">
      <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <h4 style="color:rgb(0, 136, 148);">Parcel Tools</h4>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarTogglerDemo02"
          aria-controls="navbarTogglerDemo02"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarTogglerDemo02" style="margin-left: 30px;">
          <div v-if="role==1">
            <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
              <li class="nav-item">
                <router-link to="/list-skip-tracking">
                  <a class="nav-link" v-on:click="toView" role="button" aria-haspopup="true" aria-expanded="false">List Skip Tracking</a>
                </router-link>
              </li>
            </ul>
          </div>
          <div v-else>
            <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Tools</a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <!-- <router-link to="/tools"><a v-on:click="toView" class="dropdown-item">เครื่องมือทั่วไป</a></router-link> -->
                  <router-link to="/cancelbillno"><a v-on:click="toView" class="dropdown-item">ยกเลิก Tracking</a></router-link>
                  <router-link to="/cancelallbillno"><a v-on:click="toView" class="dropdown-item">ยกเลิก Bill</a></router-link>
                  <router-link to="/change-member"><a v-on:click="toView" class="dropdown-item">เปลี่ยน Member</a></router-link>
                  <router-link to="/relabeling"><a v-on:click="toView" class="dropdown-item">Re-Labeling</a></router-link>
                  <router-link to="/listtracking"><a v-on:click="toView" class="dropdown-item">QL Checker</a></router-link>
                  <router-link to="/movemember"><a v-on:click="toView" class="dropdown-item">ย้าย Member ไป Shop อื่น</a></router-link>
                  <router-link to="/change-phoneregis"><a v-on:click="toView" class="dropdown-item">ย้าย Member ไป Shop อื่น</a></router-link>

                </div>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">KEY-IN Helper</a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <router-link to="/listphone"><a v-on:click="toView" class="dropdown-item">List Sender</a></router-link>
                  <!-- <router-link to="/list-skip-tracking"><a v-on:click="toView"  class="dropdown-item" >List Skip Tracking</a></router-link> -->
                </div>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Report</a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <router-link to="/list-daily-billing"><a v-on:click="toView" class="dropdown-item">Report Billing</a></router-link>
                  <router-link to="/list-branch"><a v-on:click="toView"  class="dropdown-item" >Report Branch</a></router-link>
                  <router-link to="/report-relabel"><a v-on:click="toView"  class="dropdown-item" >Report Relabel</a></router-link>
                  <router-link to="/report-ql-checker"><a v-on:click="toView"  class="dropdown-item" >Report QL Checker</a></router-link>
                  <router-link to="/report-tool-log"><a v-on:click="toView"  class="dropdown-item" >Report Tools Log</a></router-link>
                </div>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fa fa-cog" aria-hidden="true"></i></a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <router-link to="/branch-info"><a v-on:click="toView"  class="dropdown-item" >Branch Info</a></router-link>
                  <router-link to="/size-info"><a v-on:click="toView" class="dropdown-item">Size Info</a></router-link>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div style="text-align: right;">
          <a class="nav-link" v-on:click="Logout">
            <label style="color:rgb(0, 136, 148);">
              <img style="width: 20px" src="./assets/logout.png" /> Logout
            </label>
          </a>
        </div>
      </nav>

      <div v-show="showMain">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import "vue-select/dist/vue-select.css";
const queryString = require("query-string");
const axios = require("axios");
export default {
  name: "app",
  components: {},
  data: function() {
    return {
      state: "login",
      inMenu: 0,
      showMain: false,
      username: "",
      password: "",
      role: 0
    };
  },
  mounted: function() {
    this.$session.start();
    var dataLogin = JSON.parse(localStorage.getItem("dataLoginParcelTool"));
    // console.log("dataLogin",dataLogin);
    if (dataLogin != null) {
      this.state = "blank";
    }
    if (!this.$session.get("session_username")) {
      this.state = "login";
    }
  },

  methods: {
    logIn() {
      // this.state = 'blank';
      var username = this.username;
      var password = this.password;
      //datatoLogin
      var dataLogin = {
        username: username,
        password: password
      };
      //setlocalDatalogin
      axios
        .post("https://945cs.work/login_api", queryString.stringify(dataLogin))
        .then(response => {
          if (response.data.status) {
            localStorage.setItem("dataLoginParcelTool",JSON.stringify(dataLogin));
            this.$session.set("session_username", response.data.name);
            this.state = "blank";
            this.role = response.data.role;
          } else {
            this.state = "login";
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    Logout() {
      this.$session.clear();
      this.state = "login";
      this.$router.push('/');
    },

    toView() {
      this.showMain = true;
      // this.$router.push({ path: '/' });
    }
  }
};
</script>

<style lang="scss" >
.login {
  width: 500px;
  margin: 250px auto;

  .content2 {
    text-align: center;
    border: 2px solid rgb(0, 136, 148);
    padding: 30px;
    background-color: #fff;
    color: #fff;
    // border-radius: 10px;
    box-shadow: 0 4px 10px 4px rgba(#13232f, 0.3);

    h3 {
      margin: 50px auto;
      text-transform: uppercase;
      color: rgb(0, 136, 148);
      letter-spacing: 2px;
    }

    input {
      border: none;
      border-bottom: 2px solid rgb(0, 136, 148);
      background: none;
      outline: none;
      padding: 5px 10px;
      margin: 10px auto;
      width: 100%;
      text-align: center;
      transition: 0.5s;
      color: rgb(0, 136, 148);
      &::placeholder {
        color: rgb(0, 136, 148);
      }
      &:focus {
        border-bottom: 2px solid rgb(0, 136, 148);
      }
    }

    button {
      padding: 5px 10px;
      background: none;
      border: 1px solid rgb(0, 136, 148);
      color: rgb(0, 136, 148);
      outline: none;
      cursor: pointer;
      &:hover {
        color: #fff;
        background-color: rgb(0, 136, 148);
      }
    }
  }
}

@media screen and (min-width: 0px) and (max-width: 800px) {
  .login {
    width: 350px;
    margin: 100px auto;
  }
}
</style>


