<template>
  <div>
    <div class="search">
      <label>กรุณาใส่เลขที่บิล:</label>
      <input maxlength="30" v-model="billingInput" autocomplete="false" />
      <button v-on:click="getData">Search</button>
    </div>
    <div class="center">
        <div>
          <b>Billing No: {{billingNo}}</b>
          <!-- <input :disabled="billingInfo" v-model="tracking" /> -->
        </div>
        <div>
          <b>จำนวน Tracking ใน Billing: {{}}</b>
          <!-- <input :disabled="billingInfo" v-model="tracking" /> -->
        </div>
    </div>
    <div class="group-btn">
      <button v-on:click="confirmData">บันทึก</button>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
import Vue from 'vue'
import 'v-slim-dialog/dist/v-slim-dialog.css'
import SlimDialog from 'v-slim-dialog'
 
Vue.use(SlimDialog)

export default {
  data: function() {
    return {

      billingInput: "",
      billingNo:"",
      
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
              var data=response.data.data;
              this.billingNo=data[0].billing_no;
              console.log(this.billingNo);

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

    }
  }
};
</script>

<style>
</style>