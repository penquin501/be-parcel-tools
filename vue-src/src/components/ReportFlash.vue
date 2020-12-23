<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
      <div class="row" style="margin-top: 68px;grid-gap: 10px;">
        <div class="col-2"></div>
        <div
          class="col-ms-4 col-sm-4 col-xs-4"
          style="text-align:center; border: 1px solid #000; padding: 10px 30px;"
        >
          <div class="imgPart">
            <v-zoomer class="v-zoomer">
              <img
                :src="imgUrl"
                style="object-fit: contain; width: 100%; height: 100%;"
                :style="`transform: rotate(${rotation}deg);`"
              />
            </v-zoomer>
            <div class="btnRotation">
              <button v-on:click="rotateLeft">
                <img style="width: 20px" src="../assets/left.png" />
              </button>
              &nbsp;
              <button v-on:click="rotateRight">
                <img style="width: 20px" src="../assets/right.png" />
              </button>
            </div>
          </div>
        </div>
        <div
          class="col-ms-4 col-sm-4 col-xs-4 mycontent"
          style="display: grid ;border: 1px solid #000;padding: 10px 30px;"
        >
          <div class="address">
            <b>Tracking</b>
            <input style="text-align:left;" :disabled="true" v-model="tracking" />
            <b>ชื่อ</b>
            <input maxlength="50" style="text-align:left;" v-model="receiver_name" />
            <b>โทรศัพท์</b>
            <input
              maxlength="10"
              @keypress="isNumber($event)"
              style="text-align:left;"
              v-model="receiver_phone"
            />
            <b>ตำบล</b>
            <input style="text-align:left;" v-model="district_name" />
            <b>อำเภอ</b>
            <input style="text-align:left;" v-model="amphur_name" />
            <b>จังหวัด</b>
            <input style="text-align:left;" :disabled="true" v-model="province_name" />
            <b>รหัสไปรษณีย์</b>
            <input maxlength="5" @keypress="isNumber($event)" style="text-align:left;" v-model="zipcode" />
            <b>ที่อยู่</b>
            <input style="text-align:left;" v-model="receiver_address" />

            <div class="py-2 text-center">
              <button class="btn btn-primary" type="button" @click="submit">บันทึก</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top: 100px;"></div>
  </div>
</template>
<script>
const axios = require("axios");
// import moment from 'moment';
export default {
  data: function() {
    return {
      date: new Date(),
      tracking: "",
      billing_no: "",
      imgUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC",
      rotation: 0,
      receiver_name: "",
      receiver_phone: "",
      district_name: "",
      amphur_name: "",
      province_name: "",
      zipcode: "",
      receiver_address: "",
      reasonCode: "",
      url: "http://localhost:3000"
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    var strTracking = this.$route.params.tracking;
    var strReasonCode = this.$route.params.reasonCode;
    this.tracking = strTracking;
    this.reasonCode = strReasonCode;

    this.getData();
  },
  methods: {
    getData() {
      const options = { okLabel: "ตกลง" };
      axios
        .get(this.url + "/check/info/tracking?tracking=" + this.tracking)
        .then(response => {
          if (response.data.status == "SUCCESS") {
            var responseData = response.data.billingInfo;
            this.billingInfo = responseData[0];

            this.receiver_name = this.billingInfo.receiver_name;
            this.receiver_phone = this.billingInfo.phone;
            this.receiver_address = this.billingInfo.receiver_address;
            this.district_name = (this.reasonCode == "dstDistrictName")?"":this.billingInfo.district_name;
            this.amphur_name = (this.reasonCode == "dstCityName")?"":this.billingInfo.amphur_name;
            this.province_name = this.billingInfo.province_name;
            this.zipcode = (this.reasonCode == "dstPostalCode")?"":this.billingInfo.br_zipcode;

            this.imgCapture = response.data.imgCapture;
            if (this.imgCapture == false) {
              this.imgUrl =
                "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC";
            } else {
              this.imgUrl = this.imgCapture[0].image_url;
            }
          } else {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    submit() {
      const options = { okLabel: "ตกลง" };
      var phone = this.receiver_phone;
      if (this.tracking == "") {
        this.$dialogs.alert("กรุณาระบุ Tracking เพื่อทำรายการ", options);
      } else if (this.receiver_name == "" || this.receiver_name == undefined) {
        this.$dialogs.alert("กรุณาใส่ชื่อ-นามสกุลผู้รับให้ถูกต้อง", options);
      } else if (this.receiver_name.indexOf(' ') == -1){
        this.$dialogs.alert("กรุณาใส่ชื่อ-นามสกุลผู้รับให้ครบถ้วน", options);
      } else if (this.receiver_address.trim() == "") {
        this.$dialogs.alert("กรุณาระบุ ที่อยู่ให้ถูกต้อง", options);
      } else if (this.district_name.trim() == "") {
        this.$dialogs.alert("กรุณากรอก ตำบล ให้ถูกต้อง", options);
      } else if (this.amphur_name.trim() == "") {
        this.$dialogs.alert("กรุณากรอก อำเภอ ให้ถูกต้อง", options);
      } else if (this.zipcode == "") {
        this.$dialogs.alert("กรุณากรอก รหัสไปรษณีย์ ให้ถูกต้อง", options);
      } else if (
        phone[0] + phone[1] != "06" &&
        phone[0] + phone[1] != "08" &&
        phone[0] + phone[1] != "09"
      ) {
        this.$dialogs.alert("กรุณากรอก เบอร์โทรศัทพ์มือถือ เท่านั้น", options);
      } else if (phone.length < 10) {
        this.$dialogs.alert("กรุณากรอก เบอร์โทรศัพท์ ให้ถูกต้อง", options);
      } else {
        var dataConfirm = {
          tracking: this.tracking,
          billing_no: this.billingInfo.billing_no,
          previous_value: this.billingInfo,
          current_value: {
            receiver_name: this.receiver_name,
            receiver_address: this.receiver_address,
            receiver_phone: this.receiver_phone,
            district_code: this.billingInfo.DISTRICT_CODE,
            district_name: this.district_name,
            amphur_name: this.amphur_name,
            province_name: this.province_name,
            zipcode: this.zipcode
          },
          user: this.$session.get("session_username")
        };
        axios
          .post(this.url + "/update/flash/data", dataConfirm)
          .then(response => {
            if (response.data.status == "SUCCESS") {
              this.$dialogs.alert("ข้อมูลได้ update เข้าระบบแล้ว", options);
              this.$router.push("/report-flash-booking");
            } else {
              this.$dialogs.alert("ไม่สามารถแก้ไข ได้ เนื่องจาก..." + response.data.status, options);
              this.$router.push("/");
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    rotateRight() {
      this.rotation += 90;
    },
    rotateLeft() {
      this.rotation -= 90;
    },
    isNumber: function(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.mycontent {
  input {
    background: none;
    border: none;
    border-bottom: 1px solid #000;
    width: 100%;
    margin: 0 0 10px 0;
    padding: 5px 10px;
    outline: none;
  }
}
.imgPart {
  padding: 10px 10px;
  .v-zoomer {
    padding: 5px;
    width: auto;
    height: 500px;
    border: 2px solid #dfdfdf;
    background: #fff;
  }

  .btnRotation {
    text-align: center;

    button {
      background-color: rgb(0, 136, 148);
      border: none;
      border-radius: 5px;
      padding: 10px;
      color: #fff;
      margin: 5px 5px 0 5px;
    }
  }
  .address {
    input {
      background: none;
      border: none;
      border-bottom: 1px solid #000;
      width: 100%;
      margin: 0 0 10px 0;
      padding: 5px 10px;
      outline: none;
    }
    input:disabled {
      color: #9e9e9e;
    }
    input:enabled {
      background: #dfdfdf;
      font-size: 14px;
    }
  }
}
</style>
