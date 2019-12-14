<template>
  <div>
    <section v-if="menu == 1" class="table">
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

    <section v-if="menu == 2">
      <div class="item">
        <CompareData v-bind:selectedTracking="tracking"></CompareData>
      </div>
    </section>
  </div>
</template>

<script>
const axios = require("axios");
import CompareData from "../components/CompareData";
export default {
  components: {
    CompareData
  },
  data: function() {
    return {
      menu: 1,
      listTracking: [],
      tracking: ""
    };
  },
    mounted(){
        this.getlistTracking();
    },
  methods: {
    select(item) {
      this.tracking = item;
      this.menu = 2;
    },
    getlistTracking() {
      axios
        .get("http://127.0.0.1:3200/tools/list/tracking")
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
      this.menu = 1;
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
</style>