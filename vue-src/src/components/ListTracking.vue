<template>
  <div class="container" style="margin-top: 50px;">
<div class="row">
  <div class="col-md-4"></div>
   <div class="col-md-4" style="text-align: center;margin-top: 20px;margin-bottom: 20px;"> <b style="font-size:22px;">Tracking</b></div>
    <div class="col-md-4"></div>
</div>

    <section v-if="inMenu == 1  || inMenu == 2.5"  class="table">
      <table class="table table-striped">
    <tbody style="text-align:center;">
      <tr v-for="(item, index) in listTracking" v-bind:key="item.id">
           <router-link  :to="{ name: 'CompareData', params: { branch_id: listTracking[index].branch_id }}">
             <td >{{listTracking[index].branch_name}}({{ listTracking[index].cTracking }})</td></router-link> 
      </tr>
       
    </tbody>
</table>
     
    </section>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  components: {
    // CompareData
  },
  data: function() {
    return {
      inMenu: 1,
      listTracking: [],
      // tracking: "",
    };
  },
    mounted(){
      this.inMenu = 2.5;
      this.getlistTracking();
      if(!this.$session.get('session_username')){
       this.$router.push({ name: "Main"})
    }
    },
  methods: {
    getlistTracking() {
      const options = { okLabel: "ตกลง" };
      axios
        // .get("https://tool.945parcel.com/tools/list/tracking")
        .get("/tools/list/tracking")
        .then(response => {
            if(response.data.status=='SUCCESS'){
                this.listTracking=response.data.listTracking
                // console.log(this.listTracking);
            } else {
                this.$dialogs.alert("ไม่พบข้อมูล",options);
            }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    back() {
      this.inMenu = 1;
    }
  }
};
</script>

<style lang="scss" scoped>
.table{
  height: auto;
  // overflow-y: scroll;
}

.btnBack{
  padding: 5px 10px;
  margin: 0 10px 10px 10px;
  border: 1px solid red;
  color: red;
  cursor: pointer;
  outline: none;
  &:hover{
    color: #fff;
    background-color: red;
  }
}
</style>