<template>
  <div class="container" style="margin-top: 60px;">
    <div class="row" style="margin-top: 80px;">
        <div class="col-ms-4 col-sm-4 col-xs-4"></div>
        <div class="col-ms-2 col-sm-2 col-xs-2"><b style="font-size:18px;">ค้นหา Tracking :</b></div>
        <div class="col-ms-3 col-sm-3 col-xs-3">
            <div class="search">
                <input maxlength="20" v-model="trackingSeach" autocomplete="false" style="margin-top: 0px;"/>
            </div>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
    </div>
    <div>
      <table class="table-branch">
        <tr>
          <th style="text-align: center; width: 10%;">Tracking</th>
          <th style="text-align: center; width: 25%;">หน้ากล่อง</th>
        </tr>
        <tr v-for="(item) in filteredResourcesTracking" v-bind:key="item.id">
          <td style="text-align: center;">{{ item.barcode }}</td>
          <td style="text-align: center;" v-if="item.image_path !== ''">
            <v-zoomer class="v-zoomer">
                <img :src="item.image_url" style="object-fit: contain; width: 20%; height: 20%;" :style="`transform: rotate(${rotation}deg);`" />
            </v-zoomer>
            <div class="btnOption">
                <button v-on:click="rotateLeft(index)"><img style="width: 20px;" src="../assets/left.png" /></button>
                &nbsp;
                <button v-on:click="rotateRight(index)"><img style="width: 20px;" src="../assets/right.png" /></button>
            </div>    
          </td>
          <td style="text-align: center;" v-else>{{ item.image_url }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data: function() {
    return {
      selectData: "",
      data: [],
      rotation: 0,
      trackingSeach: "",
      url: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.selectData = this.$route.params;
    this.getData();
  },
  methods: {
    getData() {
      const options = { okLabel: "ตกลง" };
      axios
        .get(this.url + "/list-capture-by-phone?phone_number=" + this.selectData.phoneNumber + "&date_check=" +this.selectData.dateSelect)
        .then(response => {
          if (response.data.length === 0) {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
            this.data = [];
          } else {
            this.data = response.data;
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    rotateRight(index) {
      console.log(index);
      this.rotation += 90;
    },
    rotateLeft(index) {
      console.log(index);
      this.rotation -= 90;
    },
  },
    computed: {
    filteredResourcesTracking() {
      if (this.trackingSeach) {
        return this.data.filter(item => {
          var trackingfind = item.barcode;
          if (trackingfind == null) {
            trackingfind = "";
          }
          return (
            !this.trackingSeach || trackingfind.toLowerCase().includes(this.trackingSeach.toLowerCase())
          );
        });
      } else {
        return this.data;
      }
    }
  }
};
</script>

<style lang="scss" >
    .v-zoomer {
      border: 1px solid #dfdfdf;
      background: #fff;
    }

    .btnOption {
      text-align: center;
    }
    button {
      background-color: rgb(0, 136, 148);
      border: none;
      padding: 10px;
      color: #fff;
      margin: 5px 5px 0 5px;
    }
</style>