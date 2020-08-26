<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
      <div class="row">
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
        <div class="col-ms-10 col-sm-10 col-xs-10" style="text-align:center;">
          <h2 style="margin-top: 10px;">การใช้ Tools ประจำวัน {{ date | moment("LL") }}</h2>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
      </div>

      <div class="row">
        <div class="col-ms-4 col-sm-4 col-xs-4" style="text-align: center; margin-top: 5px; padding-left: 0px;padding-right: 0px;">
            <div>
              <input type="date" id="datePick" v-model="datePick" name="datePick">
              <span><button class="button-re"  v-on:click="getListToolsLog()"><i class="fa fa-search" aria-hidden="true"></i></button> </span>
            </div>
            
          </div>
          <div class="col-ms-5 col-sm-5 col-xs-5" style=" text-align: center; margin-top: 15px;padding-left: 0px;padding-right: 0px;">
          <b style="font-size:18px;">ค้นหา :</b>
          <span class="search"><input v-model="billingSearch" autocomplete="false" style="margin-top: 0px;" /></span>
        </div>
        <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align: right; margin-top: 15px; padding-left: 0px;padding-right: 0px;">
            <label style="margin-top: 5px;">Refresh</label>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1" style="text-align: center; margin-top: 15px; padding-left: 0px;padding-right: 0px;">
          <button class="button-re"  v-on:click="getListToolsLog()"><i class="fa fa-refresh" aria-hidden="true"></i></button>
        </div>
      </div>
      <div style="margin-top: 30px;"></div>
        <div class="row">
      <table>
        <tr>       
          <th style="text-align:center;">Tools ที่ใช้</th>
          <th style="text-align:center;">เวลาทำรายการ</th>
          <th style="text-align:center;">ผู้ใช้</th>
          <th style="text-align:center;">สาขา</th>
          <th style="text-align:center;">เลขที่แจ้ง</th>
          <th style="text-align:center;">เหตุผล</th>
          <th style="text-align:center;">รายละเอียดเพิ่มเติม</th>
        </tr>
        <tr v-for="(item) in filteredResourcesBilling" v-bind:key="item.id">
          <td style="text-align: center;">{{ item.branch_name }}</td>
          <td style="text-align: center;">{{ item.branch_name }}</td>
          <td style="text-align: center;">{{ item.sender_name }}</td>
          <td style="text-align: center;">{{ item.total }}</td>
          <td style="text-align: center;">{{ item.status }}</td>
          <td style="text-align: center;">{{ item.sender_name }}</td>
          <td style="text-align: center;">{{ item.sender_name }}</td>
        </tr>
      </table>  
    </div>
    <div style="margin-top: 10px; text-align: center;"></div>
  </div>
  </div>
</template>
<script>
const axios = require("axios");
import moment from 'moment';
export default {
  data: function() {
    return {
      dataBilling: [],
      dataSum:[],
      billingSearch: "",
      date: new Date(),
      datePick: moment().tz("Asia/Bangkok").format("YYYY-MM-DD"),
      cNotBook:0,
      cBooked:0,
      total:0,
      sorting: -1
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.getListToolsLog();
  },
  methods: {
    getListToolsLog() {
      this.getSummary();
      const options = { okLabel: "ตกลง" };
      axios.get("http://localhost:3000/daily-report?date_check="+this.datePick)
      .then(response => {
          if (response.data.length === 0) {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
            this.dataBilling=[];
          } else {
            this.dataBilling = response.data.result;
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
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
          if (
            branch_name == null ||
            billing_no == null ||
            sender_name == null ||
            cTracking == null ||
            status == null
          ) {
            branch_name = "";
            billing_no = "";
            sender_name = "";
            cTracking = "";
            status = "";
          }
          return (!this.billingSearch || branch_name.includes(this.billingSearch) || billing_no.toLowerCase().indexOf(this.billingSearch.toLowerCase()) > -1 || sender_name.includes(this.billingSearch));
        });
      } else {
        return this.dataBilling.slice(0).sort((a, b) => a.branch_id < b.branch_id ? this.sorting : -this.sorting );
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

table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  border: 1px solid #ddd;
}

th,
td {
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
