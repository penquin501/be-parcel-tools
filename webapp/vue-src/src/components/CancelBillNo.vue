<template>
  <div class="container" style="
    margin-top: 60px;">
    <div class="search">
      <b style="font-size:18px;">กรุณาใส่เลขที่บิล : </b>
      <input maxlength="30" v-model="billingInput" autocomplete="false" />
      <button v-on:click="getData" type="button" >Search</button>
    </div>

     <div class="row">
       <div class="col-md-4"></div>
        <div class="col-md-4">
              <div class="center" >
      <div>
        <b style="font-size:16px;">Billing No : {{billingNo}}</b>
      </div>
      <div>
        <b style="font-size:16px;">จำนวน Tracking : {{countTracking}}</b>
      </div>
      <div>
        <b style="font-size:16px;" v-if="!status">
          สถานะ :
          <label style="color: red">{{txtStatus}}</label>
        </b>
        <b style="font-size:16px;" v-if="status">
          สถานะ :
          <label style="color: green">{{txtStatus}}</label>
        </b>
      </div>
    </div>
        </div>
         <div class="col-md-4"></div>
     </div>
    <div class="group-btn">
      <button v-on:click="confirmData" type="button" >บันทึก</button>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
import Vue from "vue";
import "v-slim-dialog/dist/v-slim-dialog.css";
import SlimDialog from "v-slim-dialog";

Vue.use(SlimDialog);

export default {
  data: function() {
    return {
      billingInput: "",
      billingNo: "",
      countTracking: "",
      billingStatus:"",
      status: false,
      txtStatus: "",
      previous_value:{}
    };
  },
  methods: {
    getData() {
      const options = { okLabel: "ตกลง" };
      if (this.billingInput == "") {
        this.$dialogs.alert("กรุณาใส่เลขที่บิลให้ถูกต้อง", options);
      } else {
        axios
          .get(
            "http://127.0.0.1:3200/check/info/billing?billing=" +
              this.billingInput
          )
          .then(response => {
            if (response.data) {
              this.txtStatus="";
              var data = response.data.billingInfo;
              this.billingNo = data.billingNo;
              this.billingStatus = data.billingStatus;
              this.countTracking = data.countTracking;
              this.status = response.data.statusParcel;

              if (this.status) {
                this.txtStatus = "สามารถยกเลิกเลขที่บิลนี้ได้";
              } else {
                this.txtStatus = "ไม่สามารถยกเลิกเลขที่บิลนี้ได้";
              }
              this.previous_value=this.billingStatus
              // console.log(this.billingNo);
            } else {
              this.$dialogs.alert("ไม่พบข้อมุล", options);
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    confirmData() {
      const options = { okLabel: "ตกลง" };
      if (!this.status) {
        this.$dialogs.alert("ไม่สามารถยกเลิกเลขที่บิลนี้ได้", options);
      } else {
        var dataConfirm={
            billing_no:this.billingNo,
            previous_value:this.previous_value,
            user:'1'
          };
        axios.post("http://127.0.0.1:3200/save/cancel/billing" ,dataConfirm)
        .then(response => {
            if(response.data.status=='SUCCESS'){
              this.$dialogs.alert("ยกเลิกเรียบร้อยแล้ว", options);
              window.location.reload();
            }
          })
      }
    }
  }
};
</script>

<style>
</style>