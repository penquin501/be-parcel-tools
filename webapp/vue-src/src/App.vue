<template>
  <div id="app">
    <div v class="login" v-if="state == 'login'">
        <div class="content">
            <h3>Parcel-Tool</h3>
            <input placeholder="Username" v-model="username" v-on:keyup.enter="btnLogin" />
            <br>
            <input placeholder="Password" type="password" v-on:keyup.enter="btnLogin"  v-model="password" />
            <br>
            <br>
            <button v-on:click="logIn">LOGIN</button>
        </div>
    </div>

    <div v-if="state == 'blank'">
      <div class="menu">
        <div>
          <ul>
          <router-link to="/"><li v-on:click="toViewStaff">Tools<i class="fas fa-tools"></i></li></router-link>
          <router-link to="/listtracking"><li v-on:click="toViewCheckData">Check Data Match</li></router-link>
          <router-link to="/cancelbillno"><li v-on:click="toViewCancelBill">Cancel Bill</li></router-link>
          </ul>
        </div>
        <ul>

          <li v-on:click="Logout"  >Logout</li>
        </ul>

      </div>

       <div v-show="showMain">
       <router-view></router-view>
       </div>
    </div>


  </div>
</template>

<script>
import "vue-select/dist/vue-select.css";
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
    var dataLogin = JSON.parse(localStorage.getItem("dataLogin"));
    console.log("dataLogin",dataLogin);
    if (dataLogin != null) {
      this.state = 'blank';
    }
  },

  methods: {
    logIn(){
      this.state = 'blank';
      var username =  this.username;
      var password =  this.password;
      //datatoLogin
      var dataLogin = {
        username: username,
        password: password
      }
      //setlocalDatalogin
      localStorage.setItem("dataLogin",JSON.stringify(dataLogin));
       window.location.reload();
    },
    Logout(){
      localStorage.clear();
      window.location.reload();

    },
    
    toViewStaff(){
      this.showMain = true;
      // this.$router.push({ path: '/' });

    },
    toViewCheckData(){
     this.showMain = true;
    //  this.$router.push({ path: '/listtracking' });
    },
    toViewCancelBill(){
      this.showMain = true;
    //  this.$router.push({ path: '/cancelbillno' });
    }

  }
};
</script>

<style lang="scss" scoped>

.menu {
  position: sticky;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  /* padding: 0 100px; */
  align-items: center;
  background: #000;
}

.menu ul {
  padding: 0;
  margin: 0;
  display: flex;
}

.menu ul li {
  list-style: none;
  padding: 0 15px;
  line-height: 50px;
  text-transform: uppercase;
  letter-spacing: 2px;
  height: 50px;
  cursor: pointer;
  color:#fff;
  font-weight: bold;
        &:hover {
        color: red;
        text-decoration: underline;
      }
}



.login{
    width: 500px;
    margin: 250px auto;

    .content{
        text-align: center;
        border: 2px solid rgb(0, 136, 148);;
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


