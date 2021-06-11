<template>
  <div class="container" style="margin-top: 60px;">
    <div style="overflow-x:auto;">
      <div class="row">
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
        <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: right;">
          <b style="font-size:18px; margin-top: 10px;">ค้นหา :</b>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3">
          <div class="search">
            <input v-model="billingSearch" autocomplete="false" style="margin-top: 0px;"/>
          </div>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
      </div>
    </div>
    <div class="row">
      <div class="col-ms-9 col-sm-9 col-xs-9"></div>
      <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align: right;"><label style="margin-top: 5px;">Refresh</label></div>
      <div class="col-ms-1 col-sm-1 col-xs-1" style="margin-bottom: 5px;"><button class="button-re" v-on:click="getData()"><i class="fa fa-refresh" aria-hidden="true"></i></button></div>

      <table class="table-detail">
        <tr>
          <th style="text-align:center; width: 5%;">เลขที่พัสดุ</th>
          <th style="text-align:center; width: 5%;">ขนาด/ราคา</th>
          <th style="text-align:center; width: 5%;">ประเภท(QL/KI)</th>
          <th style="text-align:center; width: 5%;">รหัสไปรษณีย์(QL/KI)</th>
          <th style="text-align:center; width: 5%;">มูลค่า COD</th>
          <th style="text-align:center; width: 5%;">ชื่อผู้รับ</th>
          <th style="text-align:center; width: 5%;">เบอร์ผู้รับ</th>
          <th style="text-align:center;">ที่อยู่ผู้รับ</th>
          <th style="text-align:center; width: 5%;">สถานะ</th>
          <th style="text-align:center; width: 5%;">วัน/เวลา Flash booking</th>
          <th style="text-align:center; width: 5%;">วัน/เวลา DHL booking</th>
        </tr>
        <tr v-bind:key="item.id" v-for="item in filteredResources">
          <td v-if="item.receiverInfo.booking_status != 100" style="text-align: center; background-color: powderblue;"><a href="#" v-on:click="getTracking(item.tracking)">{{ item.tracking }}</a></td>
          <td v-else style="text-align: center;">{{ item.tracking }}</td>

          <td style="text-align: center;">{{ item.alias_size }}/{{ item.size_price }}</td>

          <td v-if="item.bi_parcel_type != item.receiverInfo.br_parcel_type" style="text-align: center; color: red;">{{ item.bi_parcel_type }}/{{ item.receiverInfo.br_parcel_type }}</td>
          <td v-else style="text-align: center;">{{ item.bi_parcel_type }}/{{ item.receiverInfo.br_parcel_type }}</td>

          <td v-if="item.bi_zipcode != item.receiverInfo.br_zipcode" style="text-align: center; color: red;">{{ item.bi_zipcode }}/{{ item.receiverInfo.br_zipcode }}</td>
          <td v-else style="text-align: center;">{{ item.bi_zipcode }}/{{ item.receiverInfo.br_zipcode }}</td>

          <td style="text-align: center;">{{ item.cod_value }}</td>
          <td style="text-align: center;">{{ item.receiverInfo.receiver_name }}</td>
          <td style="text-align: center;">{{ item.receiverInfo.phone }}</td>
          <td style="text-align: center;">{{ item.receiverInfo.receiver_address }} {{ item.receiverInfo.district_name }} {{ item.receiverInfo.amphur_name }} {{ item.receiverInfo.province_name }}</td>
          <td style="text-align: center;">{{ item.receiverInfo.status }}</td>
          <td style="text-align: center;">{{ item.receiverInfo.booking_flash_date | moment("YYYY-MM-DD HH:mm:ss") }}</td>
          <td style="text-align: center;">{{ item.receiverInfo.booking_date | moment("YYYY-MM-DD HH:mm:ss") }}</td>
        </tr>
      </table>
    </div>
    <div style="margin-top: 10px; text-align: center;">
      <p>ready = ข้อมูลกำลังถูกส่งไปยัง บ. ขนส่ง</p>
      <p>booked = ข้อมูลถูกส่งไปยัง บ. ขนส่ง แล้ว</p>
      <p>booking = ไม่สามารถส่งข้อมูลไปยัง บ. ขนส่ง</p>
      <p>SUCCESS = ข้อมูลได้ส่งเข้า server หลักแล้ว</p>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data: function() {
    return {
      dataBilling: [],
      billing_no: "",
      str_billing_no: "",
      billingSearch: "",
      url: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    var str_billing_no = this.$route.params.billing_no;
    this.billing_no = str_billing_no;
    this.getData();
  },
  methods: {
    getTracking(tracking) {
      window.open("https://key.my945capture.com/v2/api/parcel-capture/tasks/manual/pick/" + tracking);
    },
    getData() {
      const options = { okLabel: "ตกลง" };
      axios.get(this.url + "/list-tracking-bill?billing_no=" + this.billing_no)
        .then(response => {
          if (response.data.length === 0) {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
            this.dataBilling = [];
          } else {
            this.dataBilling = response.data;
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  },
  computed: {
    filteredResources() {
      if (this.billingSearch) {
        return this.dataBilling.filter(item => {
          var tracking = item.tracking;

          if (tracking == null) {
            tracking = "";
          }
          return !this.billingSearch || tracking.includes(this.billingSearch);
        });
      } else {
        return this.dataBilling;
      }
    }
  }
};
</script>

<style lang="scss">
input {
  margin: 10px 5px 10px 5px;
  background: none;
  border: none;
  border-bottom: 1px solid #000;
  outline: none;
  width: 200px;
  text-align: center;
}
.button-set {
  padding: 5px 20px;
  background-color: #fff;
  border: 2px solid rgb(0, 136, 148);
  cursor: pointer;
  color: rgb(0, 136, 148);
  font-weight: bold;
  outline: none;
  transition: 0.5s;
  &:hover {
    background-color: rgb(0, 136, 148);
    color: #fff;
  }
  &:focus {
    outline: 5px auto rgb(0, 136, 148);
  }
}
.button-list {
  padding: 5px 20px;
  background-color: #fff;
  border: 2px solid rgb(169, 170, 170);
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

.table-detail {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  border: 1px solid #ddd;
  th,
  td {
    text-align: left;
    padding: 8px;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
}
</style>
