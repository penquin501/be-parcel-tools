<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x: auto;">
      <div class="row">
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
        <div class="col-ms-10 col-sm-10 col-xs-10" style="text-align: center;">
          <h2 style="margin-top: 10px;">รายการบิลประจำวัน {{ date | moment("LL") }}</h2>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
      </div>

      <div class="row">
        <div class="col-ms-4 col-sm-4 col-xs-4" style="text-align: center; margin-top: 5px; padding-left: 0px; padding-right: 0px;">
          <div>
            <input type="date" id="datePick" v-model="datePick" name="datePick"/>
            <span>
              <button class="button-re" v-on:click="getBilingNo()"><i class="fa fa-search" aria-hidden="true"></i></button>
            </span>
          </div>
        </div>
        <div class="col-ms-6 col-sm-6 col-xs-6" style=" text-align: center; margin-top: 15px; padding-left: 0px; padding-right: 0px;" >
          <b style="font-size:18px;">ค้นหา :</b>
          <span class="search">
            <input v-model="billingSearch" autocomplete="false" style="margin-top: 0px;" />
          </span>
        </div>
        <div class="col-ms-2 col-sm-2 col-xs-2"></div>
      </div>
      <div style="margin-top: 30px;"></div>
      <div>
        <div class="row">
          <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: left; margin-top: 5px;">จำนวนที่ยังไม่ได้ book dhl: {{ c_dhlNotBook }}</div>
          <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: left; margin-top: 5px;">จำนวนที่ book dhl แล้ว: {{ c_dhlBooked }}</div>
          <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: left; margin-top: 5px;">จำนวนทั้งหมด: {{ total }}</div>
        </div>
        <div class="row">
          <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: left; margin-top: 5px;">จำนวนที่ยังไม่ได้ book flash: {{ c_flashNotBook }}</div>
          <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: left; margin-top: 5px;">จำนวนที่ book flash แล้ว: {{ c_flashBooked }}</div>
          <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: left; margin-top: 5px;">จำนวนทั้งหมด: {{ total }}</div>
        </div>
        <div class="row">
          <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: left; margin-top: 5px;">จำนวนที่ยังไม่ได้ book ninja: {{ c_ninjaNotBook }}</div>
          <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: left; margin-top: 5px;">จำนวนที่ book ninja แล้ว: {{ c_ninjaBooked }}</div>
          <div class="col-ms-3 col-sm-3 col-xs-3" style="text-align: left; margin-top: 5px;">จำนวนทั้งหมด: {{ total }}</div>
          <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align: right;"><label style="margin-top: 5px;">Refresh</label></div>
          <div class="col-ms-1 col-sm-1 col-xs-1" style="margin-bottom: 5px;"><button class="button-re" v-on:click="getBilingNo()"><i class="fa fa-refresh" aria-hidden="true"></i></button></div>
        </div>
      </div>
      <div class="row">
        <table class="table-detail">
          <tr>
            <th style="text-align:center;">ชื่อสาขา</th>
            <th style="text-align:center;">เลขที่บิล</th>
            <th style="text-align:center;">ชื่อผู้ส่ง</th>
            <th style="text-align:center;">จำนวน flash</th>
            <th style="text-align:center;">จำนวน dhl</th>
            <th style="text-align:center;">จำนวน ninja</th>
            <th style="text-align:center;">สถานะ</th>
          </tr>
          <tr v-for="(item, index) in filteredResourcesBilling" v-bind:key="item.id">
            <td style="text-align: center;">{{ item.branch_name }}</td>
            <td style="text-align: center;">
              <router-link :to="{ name: 'ViewTracking', params: { billing_no: filteredResourcesBilling[index].billing_no }}">{{ item.billing_no }}</router-link>&nbsp;&nbsp;
              <span style="font-size:10px; color: red;">{{ item.billing_date | moment("from", "now") }}</span>
            </td>
            <td style="text-align: center;">{{ item.sender_name }}</td>
            <td style="text-align: center;">{{ (item.flash_cNotBook == null) ? 0 : item.flash_cNotBook }}/{{ item.total }}</td>
            <td style="text-align: center;">{{ (item.dhl_cNotBook == null) ? 0 : item.dhl_cNotBook }}/{{ item.total }}</td>
            <td style="text-align: center;">{{ (item.ninja_cNotBook == null) ? 0 : item.ninja_cNotBook }}/{{ item.total }}</td>
            <td style="text-align: center;">{{ item.status }}</td>
          </tr>
        </table>
      </div>
      <div style="margin-top: 10px; text-align: center;">
        <p>complete = สาขาทำรายการเข้าระบบ</p>
        <p>checking = ข้อมูลกำลังถูกส่งไปยัง บ. ขนส่ง</p>
        <p>booked = ข้อมูลถูกส่งไปยัง บ. ขนส่ง ทั้งหมดแล้ว</p>
        <p>pass = server หลัก กำลังบันทึกข้อมูล</p>
      </div>
    </div>
  </div>
</template>
<script>
const axios = require("axios");
import moment from "moment";
export default {
  data: function() {
    return {
      dataBilling: [],
      dataSum: [],
      billingSearch: "",
      date: new Date(),
      datePick: moment().tz("Asia/Bangkok").format("YYYY-MM-DD"),
      c_dhlNotBook: 0,
      c_dhlBooked: 0,
      c_flashNotBook: 0,
      c_flashBooked: 0,
      c_ninjaBooked: 0,
      c_ninjaNotBook: 0,
      total: 0,
      sorting: -1,
      url: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.getBilingNo();
  },
  methods: {
    getBilingNo() {
      this.getSummary();
      const options = { okLabel: "ตกลง" };
      axios.get(this.url + "/daily-report?date_check=" + this.datePick)
      .then(response => {
        if (response.data.length === 0) {
          this.$dialogs.alert("ไม่พบข้อมูล", options);
          this.dataBilling = [];
        } else {
          this.dataBilling = response.data.result;
        }
      })
      .catch(function(error) {
        console.log(error);
      });
    },
    getSummary() {
      const options = { okLabel: "ตกลง" };
      axios.get(this.url + "/summary-booking?date_check=" + this.datePick)
      .then(response => {
        if (response.data.length == 0) {
          this.$dialogs.alert("ไม่พบข้อมูล", options);
          this.c_dhlNotBook = 0;
          this.c_dhlBooked = 0;
          this.c_flashNotBook = 0;
          this.c_flashBooked = 0;
          this.c_ninjaNotBook = 0;
          this.c_ninjaBooked = 0;
          this.cNotBook = 0;
          this.cBooked = 0;
          this.total = 0;
        } else {
          this.c_dhlNotBook = response.data.c_dhlNotBook;
          this.c_dhlBooked = response.data.c_dhlBooked;
          this.c_flashBooked = response.data.c_flashBooked;
          this.c_flashNotBook = response.data.c_flashNotBook;
          this.c_ninjaBooked = response.data.c_ninjaBooked;
          this.c_ninjaNotBook = response.data.c_ninjaNotBook;
          this.total = response.data.total;
        }
      })
      .catch(function(error) {
        console.log(error);
      });
    }
  },
  computed: {
    filteredResourcesBilling() {
      if (this.billingSearch) {
        return this.dataBilling.filter(item => {
          var branch_name = item.branch_name;
          var billing_no = item.billing_no;
          var sender_name = item.sender_name;
          var cTracking = item.cTracking;
          var status = item.status;
          if (branch_name == null || billing_no == null || sender_name == null || cTracking == null || status == null) {
            branch_name = "";
            billing_no = "";
            sender_name = "";
            cTracking = "";
            status = "";
          }
          return (!this.billingSearch || branch_name.includes(this.billingSearch) || billing_no.toLowerCase().indexOf(this.billingSearch.toLowerCase()) > -1 || sender_name.includes(this.billingSearch));
        });
      } else {
        return this.dataBilling.slice(0).sort((a, b) => a.branch_id < b.branch_id ? this.sorting : -this.sorting);
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
