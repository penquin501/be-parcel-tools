<template>
  <div id="app">
    <div class="menu">
      <ul>
        <li v-on:click="menuClick('1')">Staff Tools</li>
        <li v-on:click="menuClick('2')">Check Data Match</li>
      </ul>
      </div>

<div v-if="menu == 1">
<Main></Main>
</div>
  
   
<div v-if="menu == 2">
     <ListTracking></ListTracking>
</div>

  </div>
</template>

<script>
import Main from './components/main.vue'
import ListTracking from './components/ListTracking.vue'

export default {
  name: 'app',
  components: {
    Main,
    ListTracking
  },
  data:function(){
    return{
      menu: 1,
    }
  },
  methods:{
    menuClick(menu){
      this.menu = menu
    }
  }
}
</script>

<style lang="scss" scoped>
.menu{
  width: 100%;
  background-color: #000;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 1000;
  
  ul{
    display: flex;
    
    li{
      list-style: none;
      cursor: pointer;
      padding: 10px;
      transition: .2s;
      &:hover{
        color: red;
        text-decoration: underline;
      }
    }  
  }

}
</style>


