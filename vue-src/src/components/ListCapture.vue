<template>
  <div class="container" style="margin-top: 60px;">
    <div class="row" style="margin-top: 80px;">
      <div class="col-ms-5 col-sm-5 col-xs-5">
        <b style="font-size:18px;">ชื่อผู้ส่ง : </b>{{ selectData.memberName }}
      </div>
      <div class="col-ms-2 col-sm-2 col-xs-2"></div>
      <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align: right;">
        <b style="font-size: 16px;">ค้นหา Tracking :</b>
      </div>
      <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: right;">
        <div class="search">
          <input maxlength="20" v-model="trackingSeach" autocomplete="false" style="margin-top: 0px;" />
        </div>
      </div>
    </div>
    <div>
      <table class="table-branch">
        <tr>
          <th style="text-align: center; width: 10%;">Tracking</th>
          <th style="text-align: center; width: 25%;">หน้ากล่อง</th>
        </tr>
        <tr v-for="item in filteredResourcesTracking" v-bind:key="item.id" >
          <td style="text-align: center;">{{ item.barcode }}</td>
          <td style="text-align: center;" v-if="item.image_path !== ''" >
            <div class="images" v-viewer="vImgOptions">
              <img :src="item.image_url" style="object-fit: contain; width: 20%; height: 20%;" />
            </div>
          </td>
          <td style="text-align: center;" v-else >{{ item.image_url }}</td>
        </tr>
      </table>
    </div>
    <div style="margin-top: 60px;"></div>
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
      vImgOptions: {
        navbar: false,
        zoomable: true,
        rotatable: true,
        title: false,
        movable: false
      },
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
        .get(this.url + "/list-capture-by-phone?phone_number=" + this.selectData.phoneNumber + "&date_check=" + this.selectData.dateSelect)
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
    }
  },
  computed: {
    filteredResourcesTracking() {
      if (this.trackingSeach) {
        return this.data.filter(item => {
          if (item.barcode == null) {
            item.barcode = "";
          }
          return (!this.trackingSeach || item.barcode.toLowerCase().includes(this.trackingSeach.toLowerCase()));
        });
      } else {
        return this.data;
      }
    }
  }
};
</script>

<style lang="scss" >
</style>