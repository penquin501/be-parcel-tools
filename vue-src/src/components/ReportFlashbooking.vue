<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
        <div class="row">
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
        <div class="col-ms-10 col-sm-10 col-xs-10" style="text-align:center;">
          <h2 style="margin-top: 10px;">รายการ flash booking {{ date | moment("LL") }}</h2>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
      </div>
        <div class="row">
          <div class="col-ms-4 col-sm-4 col-xs-4" style="text-align: center; margin-top: 5px; padding-left: 0px;padding-right: 0px;">
            <div>
              <input type="date" id="datePick" v-model="datePick" name="datePick">
              <span><button class="button-re"  v-on:click="getReportBranch()"><i class="fa fa-search" aria-hidden="true"></i></button> </span>
            </div>
            
          </div>
          <div class="col-ms-5 col-sm-5 col-xs-5" style=" text-align: center; margin-top: 5px;"></div>
          <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align: right; margin-top: 5px; padding-left: 0px;padding-right: 0px;">
          <label style="margin-top: 5px;">Refresh</label>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1" style="text-align: center; margin-top: 5px; padding-left: 0px;padding-right: 0px;">
          <button class="button-re"  v-on:click="getReportBranch()"><i class="fa fa-refresh" aria-hidden="true"></i></button>
        </div>
      <table class="table-branch">
        <tr>
          <th style="text-align:center;">tracking</th>
          <th style="text-align:center;">code</th>
          <th style="text-align:center;">message</th>
          <th style="text-align:center;">reason_code</th>
          <th style="text-align:center;">reason_th</th>
          <th style="text-align:center;">record_at</th>
        </tr>
        <tr>
            <td style="text-align: center;" v-on:click="nextPage()">TDZxxxxxxx</td>
            <td style="text-align: center;"></td>
            <td style="text-align: center;"></td>
            <td style="text-align: center;"></td>
            <td style="text-align: center;"></td>
            <td style="text-align: center;"></td>
        </tr>
      </table>
    </div>
    <div style="margin-top: 100px;"></div>
  </div>
  </div>
</template>
<script>
// const axios = require("axios");
import moment from 'moment';
export default {
  data: function() {
    return {
      data: [],
      date: new Date(),
      datePick: moment().tz("Asia/Bangkok").format("YYYY-MM-DD"),
      sorting: -1,
      url: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.getReportBranch();
  },
  methods: {
    getReportBranch() {
        this.data=[];
    },
    nextPage(){
        this.$router.push({ name: "ReportFlash"});
    }
  },
  computed: {
       filteredResourcesBilling() {
        return this.data.slice(0).sort((a, b) => a.id < b.id ? this.sorting : -this.sorting );
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

.table-branch {
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
