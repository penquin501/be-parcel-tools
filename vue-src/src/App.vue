<template>
  <div id="app">
    <div v class="login" v-if="state == 'login'">
        <div class="content2">
            <div class="row">
                  <h3 >Parcel-Tool</h3>
            </div>
           
            <input placeholder="Username" v-model="username" v-on:keyup.enter="logIn" />
            <br>
            <input placeholder="Password" type="password" v-on:keyup.enter="logIn"  v-model="password" />
            <br>
            <br>
            <button v-on:click="logIn" class="btn btn-outline-success" >LOGIN</button>


        </div>
    </div>

    <div v-if="state == 'blank'">
<nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top" >
  <h4 style="color:rgb(0, 136, 148);">Parcel Tools</h4>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarTogglerDemo02" style="margin-left: 30px;">
    <ul class="navbar-nav mr-auto mt-2 mt-lg-0">

    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">เมนู</a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
          <router-link to="/tools"><a v-on:click="toView"  class="dropdown-item" >เครื่องมือทั่วไป</a></router-link>
          <router-link to="/cancelbillno"><a v-on:click="toView"  class="dropdown-item" >ยกเลิกเลขที่บิล</a></router-link>
          <router-link to="/listtracking"><a v-on:click="toView"  class="dropdown-item" >QL Checker</a></router-link>
        </div>
      </li>
       <li class="nav-item">
           <router-link to="/listphone"><a class="nav-link"  id="navbarDropdown" v-on:click="toView" role="button"  aria-haspopup="true" aria-expanded="false">KEY-IN Helper</a></router-link>
      </li>


    </ul>
    <form class="form-inline my-2 my-lg-0">
      <a  class="nav-link" v-on:click="Logout"><label style="color:rgb(0, 136, 148);"> <img style="width: 20px" src="./assets/logout.png" />   Logout</label></a>
    </form>
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
const queryString = require('query-string');
const axios = require("axios");
export default {
  name: "app",
  components: {
  },
  data: function() {
    return {
      state: 'login',
      inMenu: 0,
      showMain:false,
      username: '',
      password: '',

    };
  },
    mounted: function() {
    this.$session.start()
    var dataLogin = JSON.parse(localStorage.getItem("dataLoginParcelTool"));
    console.log("dataLogin",dataLogin);
    if (dataLogin != null) {
      this.state = 'blank';
    }
    if(!this.$session.get('session_username')){
      this.state = "login"
    }
  },

  methods: {
    logIn(){
      // this.state = 'blank';
      var username =  this.username;
      var password =  this.password;
      //datatoLogin
      var dataLogin = {
        username: username,
        password: password
      }
      //setlocalDatalogin
      axios.post("https://945cs.work/login_api" ,queryString.stringify(dataLogin))
          .then(response => {   
            console.log(response.data.name)
            if(response.data.status){
              localStorage.setItem("dataLoginParcelTool",JSON.stringify(dataLogin));
              this.$session.set("session_username",response.data.name);
                 this.state = 'blank';
              // window.location.reload();
            } else {
                  this.state = 'login';
              // window.location.reload();
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      
    },
    Logout(){
      // localStorage.clear();
      this.$session.clear();
      // window.location.reload();
      this.state = 'login';

    },
    
    toView(){
      this.showMain = true;
      // this.$router.push({ path: '/' });

    },


  }
};
</script>

<style lang="scss" >

.login{
    width: 500px;
    margin: 250px auto;

    .content2{
        text-align: center;
        border: 2px solid rgb(0, 136, 148);
        padding: 30px;
        background-color: #fff;
        color: #fff;
        // border-radius: 10px;
        box-shadow:0 4px 10px 4px rgba(#13232f,.3);

        h3{
            margin: 50px auto; 
            text-transform: uppercase;
            color: rgb(0, 136, 148);;
            letter-spacing: 2px;
        }

        input{
            border:none;
            border-bottom: 2px solid rgb(0, 136, 148);;
            background: none;
            outline: none;
            padding: 5px 10px;
            margin: 10px auto;
            width: 100%;
            text-align: center;
            transition: .5s;
            color: rgb(0, 136, 148);;
            &::placeholder{
                color:rgb(0, 136, 148);;
            }
            &:focus{
                border-bottom: 2px solid rgb(0, 136, 148);;
            }
        }

        button{
            padding: 5px 10px;
            background: none;
            border: 1px solid rgb(0, 136, 148);;
            color: rgb(0, 136, 148);;
            outline: none;
            cursor: pointer;
            &:hover{
                color:#fff;
                background-color: rgb(0, 136, 148);;
            }
        }
    }
}

@media screen and (min-width: 0px) and (max-width: 800px) {
    .login{
        width: 350px;
        margin: 100px auto;
    }
}
</style>


