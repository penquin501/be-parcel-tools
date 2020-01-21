<template>
  <div>
    <section v-if="inMenu == 1  || inMenu == 2.5"  class="table">
      <table>
        <thead>
          <td>Tracking</td>
        </thead>
        <tbody>       
          <tr v-for="(item, index) in listTracking" v-bind:key="item.id">
            <td v-on:click="select(item)">{{listTracking[index].tracking}}</td>
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
      tracking: "",
    };
  },
    mounted(){
      this.inMenu = 2.5;
      this.getlistTracking();
    },
  methods: {
    select(item) {
      var trackingSend = item.tracking;
      this.$router.push({name:'CompareData',params:{tracking:trackingSend}});
      this.inMenu = 2;
    },
    getlistTracking() {
      this.listTracking=[]
      axios
        .get("https://tool.945parcel.com/tools/list/tracking")
        .then(response => {
            if(response.data.status=='SUCCESS'){
                this.listTracking=response.data.listTracking;

            } else {
                alert('ไม่พบข้อมูล');
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
.table {
  text-align: center;

  table {
    margin: 0 auto;
    width: 99vw;

    thead {
      background-color: #000;
      color: #fff;
    }

    tbody {
      tr:nth-child(even) {
        background-color: #eee;
        margin: 10px 0;
      }
    }
  }
}

.item {
  padding: 20px;
  border: 2px solid #000;
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