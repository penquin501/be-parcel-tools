<template>
  <div id="app">
    <div v-if="state == 'login'">
      <input type="text" >
     <input type="text" >
     <button v-on:click="logIn">Login</button>
    </div>

    <div v-if="state == 'blank'">
      <div class="menu">
        <ul>
          <li v-on:click="toViewMain">Tools<i class="fas fa-tools"></i></li>
          <li v-on:click="toViewCheckData">Check Data Match</li>
          <li v-on:click="toViewCancelBill">Cancel Bill</li>
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
    };
  },
  methods: {
    logIn(){
      this.state = 'blank';
    },
    toViewMain(){
      this.showMain = true;
      this.$router.push({ path: '/' });

    },
    toViewCheckData(){
     this.showMain = true;
     this.$router.push({ path: '/listtracking' });
    },
    toViewCancelBill(){
      this.showMain = true;
     this.$router.push({ path: '/cancelbill' });
    }

  }
};
</script>

<style lang="scss" scoped>
.menu {
  width: 100%;
  background-color: #000;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 1000;

  ul {
    display: flex;

    li {
      list-style: none;
      cursor: pointer;
      padding: 10px;
      transition: 0.2s;
      &:hover {
        color: red;
        text-decoration: underline;
      }
    }
  }
}
</style>


