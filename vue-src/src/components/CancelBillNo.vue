<template>
  <div class="container" style="margin-top: 60px;">
    <div class="search">
      <b style="font-size:18px;">กรุณาใส่เลขที่บิล :</b>
      <input maxlength="30" v-model="billingInput" autocomplete="false" style="width: 214px;" />
      <button v-on:click="getData" type="button">Search</button>
    </div>

    <div class="row">
      <div class="col-md-2"></div>
      <div class="col-md-8">
        <div class="center">
          <table class="head-table" style="width: 100%;">
            <tbody>
              <tr>
                <td style="width: 15%;">เลขที่บิล:</td>
                <td style="width: 25%;">{{ billingInfo.billing_no }}</td>
                <td style="width: 15%;">วันที่:</td>
                <td style="width: 25%;">{{ billingInfo.billing_date | moment("LL HH:mm") }}</td>
              </tr>
              <tr>
                <td style="width: 15%;">สาขา:</td>
                <td style="width: 25%;">{{ billingInfo.branch_name }}</td>
                <td style="width: 15%;">ชื่อผู้ส่ง:</td>
                <td style="width: 25%;">{{ sender_name }}</td>
              </tr>
              <tr>
                <td style="width: 15%;">จำนวนรายการ:</td>
                <td style="width: 25%;">{{ countTracking }}</td>
                <td style="width: 15%;">ยอดรวมค่าส่ง:</td>
                <td style="width: 25%;">{{ sum }}</td>
              </tr>
              <tr>
                <td style="width: 15%;">สถานะ:</td>
                <td style="width: 25%;">{{ status_lb }}</td>
                <td style="width: 15%;"></td>
                <td style="width: 25%;"></td>
              </tr>
            </tbody>
          </table>
          <div style="height: 20px;"></div>
          <!-- <div> -->
          <table class="line-table" border="1">
            <tr>
              <th style="text-align:center; width: 10%;">Tracking</th>
              <th style="text-align:center; width: 10%;">ขนาดพัสดุ</th>
              <th style="text-align:center; width: 10%;">ราคาพัสดุ</th>
              <th style="text-align:center; width: 10%;">ประเภทพัสดุ</th>
              <th style="text-align:center; width: 10%;">ยอด COD</th>
              <th style="text-align:center; width: 30%;">ชื่อผู้รับ</th>
              <th style="text-align:center; width: 5%;">เบอร์ผู้รับ</th>
              <th style="text-align:center; width: 5%;">สถานะ</th>
              <th style="text-align:center; width: 5%;">เลือก</th>
              <!-- <th style="text-align:center; width: 5%">เลือก<input type="checkbox" @click="selectAll" v-model="allSelected"></th> -->
            </tr>
            <tr v-for="(item) in billingItem" v-bind:key="item.id">
              <td style="text-align: center;">{{ item.tracking }}</td>
              <td style="text-align: center;">{{ item.alias_size }}</td>
              <td style="text-align: center;">{{ item.size_price }}</td>
              <td style="text-align: center;">{{ item.parcel_type }}</td>
              <td style="text-align: center;">{{ item.cod_value }}</td>
              <td style="text-align: center;">{{ item.receiver_name }}</td>
              <td style="text-align: center;">{{ item.phone }}</td>
              <td style="text-align: center;">{{ item.status }}</td>
              <td v-if="item.status != 'cancel'" style="text-align: center;">
                <input
                  type="checkbox"
                  :value="item"
                  v-model="selectItem"
                  @click="select"
                  style="width: 20px;"
                />
              </td>
              <td v-else style="text-align: center;">
                <input
                  type="checkbox"
                  :value="item"
                  v-model="selectItem"
                  @click="select"
                  disabled
                  style="width: 20px;"
                />
              </td>
            </tr>
          </table>
          <!-- </div> -->
        </div>
      </div>
      <div class="col-md-2"></div>
    </div>
    <table style="width: 100%;">
      <tbody>
        <tr>
          <td style="width: 30%;" rowspan="2"></td>
          <td style="width: 15%;">เหตุผล:</td>
          <td style="width: 25%;">
            <select
              style="margin-left: 0px; margin-right: 0px;"
              class="select"
              v-model="reasonValue"
            >
              <option value disabled="disabled" selected="selected">----- เลือกเหตุผล -----</option>
              <option value="wrong_size">เลือก size พัสดุผิด</option>
              <option value="wrong_type">เลือกประเภทการจัดส่งผิด</option>
              <option value="wrong_codvalue">ยอด COD ผิด</option>
              <option value="wrong_member">ทำรายการผิด member</option>
              <option value="wrong_receiver_info">ข้อมูลผู้รับผิด</option>
            </select>
          </td>
          <td style="width: 25%;" rowspan="2"></td>
        </tr>
        <tr>
          <td style="width: 15%;">รายละเอียดเพิ่มเติม:</td>
          <td style="width: 25%;">
            <textarea style="width: 306px;" v-model="remark"></textarea>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="group-btn">
      <button v-on:click="confirmData" type="button">บันทึก</button>
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
      actionId: 0,
      billingInput: "",
      billingNo: {},
      countTracking: 0,
      sum: 0,
      billingItem: [],
      responseData: {},
      billingInfo: {},
      selectItem: [],

      sender_name: "",
      reasonValue: "",
      remark: "",
      billing_no: "",
      billingStatus: "",
      status_lb: "",
      allSelected: false,
      url: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
  },
  methods: {
    getData() {
      const options = { okLabel: "ตกลง" };
      if (this.billingInput == "") {
        this.$dialogs.alert("กรุณาใส่เลขที่บิลให้ถูกต้อง", options);
        this.resetData();
      } else {
        axios.get(this.url + "/check/info/billing?billing=" + this.billingInput)
          .then(response => {
            if (response.data.status == "SUCCESS") {
              this.responseData = response.data.data;
              this.billingInfo = this.responseData.billing;
              this.billingItem = this.responseData.billingItem;
              this.countTracking = this.responseData.billingItem.length;
              this.billing_no = this.billingInfo.billing_no;
              this.billingStatus = this.billingInfo.status;
              this.sum = this.billingInfo.total;
              this.sender_name = this.billingItem[0].sender_name;

              if (this.billingStatus == "complete") {
                this.status_lb = "สาขาทำรายการเข้าระบบ";
              } else if (this.billingStatus == "checking") {
                this.status_lb = "ข้อมูลกำลังถูกส่งไปยัง บ. ขนส่ง";
              } else if (this.billingStatus == "booked") {
                this.status_lb = "ข้อมูลถูกส่งไปยัง บ. ขนส่ง ทั้งหมดแล้ว";
              } else if (this.billingStatus == "cancel") {
                this.status_lb = "ข้อมูลถูกยกเลิกแล้ว";
              } else if (this.billingStatus == "pass") {
                this.status_lb = "server หลัก กำลังบันทึกข้อมูล";
              } else if (this.billingStatus == "SUCCESS") {
                this.status_lb = "ข้อมูลได้ส่งเข้า server หลักแล้ว";
              } else {
                this.status_lb = "";
              }
            } else {
              this.$dialogs.alert("ไม่พบข้อมูล", options);
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    resetData() {
      this.billingInput = "";
      this.billingNo = {};
      this.countTracking = 0;
      this.sum = 0;
      this.billingItem = [];
      this.previous_value = {};
      this.billingInfo = {};
      this.selectItem = [];

      this.sender_name = "";
      this.reasonValue = "";
      this.remark = "";
      this.billing_no = "";
      this.billingStatus = "";
      this.status_lb = "";
      this.allSelected = false;
    },
    confirmData() {
      const options = { okLabel: "ตกลง" };
      if (this.billing_no == "") {
        this.$dialogs.alert("กรุณาระบุเลขที่บิลเพื่อทำรายการ", options);
        this.resetData();
      } else if (this.billingStatus == "cancel") {
        this.$dialogs.alert("รายการนี้ได้ถูกยกเลิกไปแล้ว", options);
      } else if (this.billingStatus == "pass") {
        this.$dialogs.alert("รายการนี้กำลังถูกส่งข้อมูลไปยัง server หลัก กรุณารอ 2-3 นาที", options);
      } else if (this.selectItem.length <= 0) {
        this.$dialogs.alert("กรุณาเลือกรายการที่ต้องการยกเลิก", options);
      } else if (this.reasonValue == "") {
        this.$dialogs.alert("กรุณาระบุ เหตุผล", options);
      } else if (this.remark.trim() == "") {
        this.$dialogs.alert("กรุณากรอกรายละเอียดเพิ่มเติม ให้ถูกต้อง", options);
      } else if (this.remark.length < 25) {
        this.$dialogs.alert("กรุณากรอกรายละเอียดเพิ่มเติม ให้ชัดเจน", options);
      } else {
        let moduleName = this.selectItem.length == this.billingItem.length ? "cancel_billing" : "cancel_tracking";

        var dataConfirm = {
          billingNo: this.billing_no,
          billingInfo: this.responseData,
          billingStatus: this.billingStatus,
          selectItem: this.selectItem,
          currentMember: {
            memberCode: this.billingInfo.member_code,
            senderName: this.billingItem[0].sender_name,
            senderPhone: this.billingItem[0].sender_phone,
            senderAddress: this.billingItem[0].sender_address
          },
          reason: this.reasonValue,
          remark: this.remark,
          user: this.$session.get("session_username"),
          moduleName: moduleName
        };
        axios.post(this.url + "/tools/void-billing", dataConfirm)
          .then(response => {
            if (response.data.status == "SUCCESS") {
              let billingNo = response.data.billingNo;
              if (billingNo !== "") {
                // const optionsDialog = {title: 'รายการที่คุณเลือกได้ถูกยกเลิกแล้ว', cancelLabel: 'cancel', okLabel: "ตกลง"}
                const optionsDialog = {
                  title: "รายการที่คุณเลือกได้ถูกยกเลิกแล้ว",
                  okLabel: "ตกลง"
                };
                this.$dialogs
                  .alert("เลขที่บิลใหม่..." + billingNo, optionsDialog)
                  .then(res => {
                    // console.log(res) // {ok: true|false|undefined}
                    if (res) {
                      this.$router.push("/");
                    } else {
                      this.$router.push("/");
                    }
                  });
              } else {
                this.$dialogs.alert("ยกเลิกรายการทั้งหมดแล้ว", options);
                this.$router.push("/");
              }
            } else {
              this.$dialogs.alert(
                "ไม่สามารถยกเลิกรายการได้ เนื่องจาก..." + response.data.reason,
                options
              );
              this.$router.push("/");
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    selectAll() {
      this.selectItem = [];
      if (!this.allSelected) {
        for (let item in this.billingItem) {
          this.selectItem.push(this.billingItem[item]);
        }
      }
    },
    select: function() {
      this.allSelected = false;
    }
  }
};
</script>

<style lang="scss" >
.search,
.select-tool,
.group-btn {
  text-align: center;
  button {
    padding: 5px 20px;
    background-color: #fff;
    border: 2px solid rgb(0, 136, 148);
    cursor: pointer;
    color: rgb(0, 136, 148);
    font-weight: bold;
    margin: 20px 10px;
    outline: none;
    transition: 0.5s;
    &:hover {
      background-color: rgb(0, 136, 148);
      color: #fff;
    }
  }
}
.search {
  input {
    margin: 10px 5px 10px 5px;
    background: none;
    border: none;
    border-bottom: 1px solid #000;
    outline: none;
    width: 200px;
    text-align: center;
  }
  button {
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
}

.right div:nth-child(4) {
  margin-top: 20px;
}
.left {
  .item2 {
    padding: 10px 10px;
    .v-zoomer {
      padding: 5px;
      width: auto;
      height: 500px;
      border: 2px solid #dfdfdf;
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
  }
}
.head-table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  // border: 1px solid #ddd;
  tbody,
  th,
  td {
    text-align: left;
    padding: 8px;
  }
}
.line-table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  // border: 1px solid #ddd;
  th,
  td {
    text-align: left;
    padding: 8px;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
}
.select {
  width: 300px;
  border: none;
  border-bottom: 2px solid #000;
  background: none;
  margin: 0 15px;
  outline: none;
  font-size: 16px;
  font-weight: bold;
}
.cancle {
  padding: 5px 20px;
  background-color: #fff;
  border: 2px solid rgb(122, 122, 122) !important;
  cursor: pointer;
  color: rgb(122, 122, 122) !important;
  font-weight: bold;
  outline: none;
  transition: 0.5s;
  &:hover {
    background-color: rgb(122, 122, 122) !important;
    color: #fff !important;
  }
}
.save {
  padding: 5px 20px;
  background-color: #fff;
  border: 2px solid #32cd32 !important;
  cursor: pointer;
  color: #32cd32 !important;
  font-weight: bold;
  outline: none;
  transition: 0.5s;
  &:hover {
    background-color: #32cd32 !important;
    color: #fff !important;
  }
}
</style>