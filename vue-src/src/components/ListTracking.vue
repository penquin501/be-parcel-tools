<template>
  <div class="container" style="margin-top: 50px;">
    <div class="row">
      <div class="col-md-4"></div>
      <div class="col-md-4" style="text-align: center;margin-top: 20px;margin-bottom: 20px;">
        <b style="font-size:22px;">Tracking</b>
      </div>
      <div class="col-md-4"></div>
    </div>

    <section v-if="inMenu == 1  || inMenu == 2.5" class="table">
      <div class="row">
        <div class="col-ms-9 col-sm-9 col-xs-9"></div>
        <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align:right;">
          <label style="margin-top: 5px;">Refresh</label>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1" style="margin-bottom: 5px;">
          <button class="button-re" v-on:click="getlistTracking()">
            <i class="fa fa-refresh" aria-hidden="true"></i>
          </button>
        </div>
        <table class="table table-striped">
          <tbody style="text-align:center;">
            <tr v-for="(item, index) in listTracking" v-bind:key="item.id">
              <router-link :to="{ name: 'CompareData', params: { branch_id: listTracking[index].branch_id }}">
                <td>{{listTracking[index].branch_name}}({{ listTracking[index].total }})</td>
              </router-link>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  components: {},
  data: function() {
    return {
      inMenu: 1,
      listTracking: []
    };
  },
  mounted() {
    this.inMenu = 2.5;
    this.getlistTracking();
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
  },
  methods: {
    getlistTracking() {
      const options = { okLabel: "ตกลง" };
      axios
        .get("/tools/list/tracking")
        .then(response => {
          if (response.data.status == "SUCCESS") {
            this.listTracking = response.data.listTracking;
          } else {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
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
  height: auto;
  // overflow-y: scroll;
}

.btnBack {
  padding: 5px 10px;
  margin: 0 10px 10px 10px;
  border: 1px solid red;
  color: red;
  cursor: pointer;
  outline: none;
  &:hover {
    color: #fff;
    background-color: red;
  }
}

.button-re {
  padding: 5px 20px;
  background-color: #fff;
  // border: 2px solid rgb(169, 170, 170);
  // border-radius: 70px;
  cursor: pointer;
  color: rgb(169, 170, 170);
  font-weight: bold;
  outline: none;
  transition: 0.5s;
  &:hover {
    background-color: rgb(169, 170, 170);
    color: #fff;
  }
  &:focus {
    outline: 5px auto rgb(169, 170, 170);
  }
}
</style>