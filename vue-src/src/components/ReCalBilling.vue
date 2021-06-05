<template>
  <div class="container" style="margin-top: 100px;">
    <div class="center">
      <header class="title">
        <h1>อัพโหลดไฟล์ Excel/CSV</h1>
      </header>
      <input style="margin-top: 52px; margin-bottom: 30px;" type="file" id="file" ref="file" v-on:change="handleFileUpload($event)" />
      <button class="btn-upload" v-on:click="submitFile()">อัพโหลด</button>
    </div>
    <div>
      <div class="row">
        <div class="col-md-3">
          <table class="table">
            <thead style="background-color: #4aa96c; color: white;">
              <tr>
                <th style="text-align: center; font-size: 16px;">
                  รายการ เลขที่บิลใหม่ (Re-Cal) 
                </th>
              </tr>
            </thead>
            <tr v-for="item in listBilling" v-bind:key="item.id">
              <td style="text-align: center;">{{ item.billingNo }}</td>
            </tr>
          </table>
        </div>
        <div class="col-md-3">
          <table class="table">
            <thead style="background-color: #9ede73; color: white;">
              <tr>
                <th style="text-align: center; font-size: 16px;">
                  รายการ เลขที่บิลใหม่ (Remain) 
                </th>
              </tr>
            </thead>
            <tr v-for="item in listRemainBilling" v-bind:key="item.id">
              <td style="text-align: center;">{{ item.billingNo }}</td>
            </tr>
          </table>
        </div>
        <div class="col-md-3">
          <table class="table">
            <thead style="background-color: #ff4646; color: white;">
              <tr>
                <th style="text-align: center; font-size: 16px;">
                  รายการ เลขที่บิล ที่มีปัญหา
                </th>
              </tr>
            </thead>
            <tr v-for="item in listBillingError" v-bind:key="item.id">
              <td style="text-align: center;">{{ item.billingNo }}</td>
            </tr>
          </table>
        </div>
        <div class="col-md-3">
          <table class="table">
            <thead style="background-color: #ff8585; color: white;">
              <tr>
                <th style="text-align: center; font-size: 16px;">
                  รายการ Tracking ที่มีปัญหา
                </th>
              </tr>
            </thead>
            <tr v-for="item in listTrackingError" v-bind:key="item.id">
              <td style="text-align: center;">{{ item.tracking }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
import XLSX from "xlsx";

export default {
  data: function() {
    return {
      file: "",
      dataJson: [],
      listBilling: [],
      listRemainBilling: [],
      listBillingError: [],
      listTrackingError: [],
      url: ""
    };
  },
  mounted: function() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
  },
  methods: {
    submitFile() {
      const options = { okLabel: "ตกลง" };

      this.listBilling = [];
      this.listRemainBilling = [];
      this.listBillingError = [];
      this.listTrackingError = [];

      var moduleName = "recal_billing";
      var data = {
        user: this.$session.get("session_username"),
        moduleName: moduleName,
        resultsFile: this.dataJson
      };

      axios
        .post(this.url + "/tools/recal-billing", data)
        .then(function(response) {
          if (response.data.status == "SUCCESS") {
            this.listBilling = response.data.listBilling;
            this.listRemainBilling = response.data.listRemainBilling;
            this.listBillingError = response.data.listBillingError;
            this.listTrackingError = response.data.listTrackingError;
          } else if(response.data.status == "ERROR_NO_DATA_TO_RECAL_BILLING") {
            this.listBilling = response.data.listBilling;
            this.listRemainBilling = response.data.listRemainBilling;
            this.listBillingError = response.data.listBillingError;
            this.listTrackingError = response.data.listTrackingError;
          } else {
            this.$dialogs.alert("ไม่สามารถ re-cal billing ได้ เนื่องจาก..." + response.data.status, options);
            this.$router.push("/");
          }
        })
        .catch(function(error) {
          /* eslint-disable */
          console.log(error);
          /* eslint-disable */
        })
        .finally(() => {
          //   that.$vs.loading.close();
        });
    },
    handleFileUpload(e) {
      var self = this;
      this.file = this.$refs.file.files[0];
      var fileInput = document.getElementById("file");
      var filePath = fileInput.value;
      var allowedExtensions = /(\.xls|\.xlsx|\.csv)$/i;

      const options = { okLabel: "ตกลง" };
      if (!allowedExtensions.exec(filePath)) {
        this.$dialogs.alert("กรุณาเลือกไฟล์ xls/xlsx/csv เท่านั้น", options);
        fileInput.value = "";
        return false;
      }
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: "binary"
        });
        workbook.SheetNames.forEach(function(sheetName) {
          var XL_row_object = XLSX.utils.sheet_to_row_object_array(
            workbook.Sheets[sheetName]
          );
          self.dataJson = XL_row_object;
        });
      };
      reader.readAsBinaryString(file);
    }
  }
};
</script>

<style lang="scss" scoped>
.btn-upload {
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
}
</style>