<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
      <div class="row">
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
        <div class="col-ms-10 col-sm-10 col-xs-10" style="text-align:center;">
          <h2 style="margin-top: 10px;">รายการ booking flash {{ date | moment("LL") }}</h2>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
      </div>
      <div class="row">
        <div class="col-ms-9 col-sm-9 col-xs-9" style="text-align: center; margin-top: 15px; padding-left: 0px; padding-right: 0px;">
          <b style="font-size:18px;">ค้นหา :</b>
          <span class="search">
            <input v-model="search" autocomplete="false" style="margin-top: 0px;" />
          </span>
        </div>
        <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align: right; margin-top: 15px;">
          <label style="margin-top: 5px;">Refresh</label>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1" style="margin-bottom: 5px; margin-top: 15px;padding-left: 0px;padding-right: 0px;">
          <button class="button-re" v-on:click="getData()">
            <i class="fa fa-refresh" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div style="margin-top: 20px;"></div>
      <table class="table-branch">
        <tr>
          <th style="text-align:center;">tracking</th>
          <th style="text-align:center;">code</th>
          <th style="text-align:center;">message</th>
          <th style="text-align:center;">reason_code</th>
          <th style="text-align:center;">reason_th</th>
          <th style="text-align:center;">record_at</th>
        </tr>
        <tr v-for="(item, index) in filteredResources" v-bind:key="item.id">
          <td style="text-align: center;">
            <router-link
              :to="{ name: 'ReportFlash', params: { tracking: filteredResources[index].tracking, reasonCode: item.reason_code }}"
            >{{ item.tracking }}</router-link>
          </td>
          <td style="text-align: center;">{{ item.code }}</td>
          <td style="text-align: center;">{{ item.message }}</td>
          <td style="text-align: center;">{{ item.reason_code }}</td>
          <td style="text-align: center;">{{ item.reason_th }}</td>
          <td style="text-align: center; font-size:10px; color: red;">{{ item.record_at | moment("from", "now") }}</td>
        </tr>
      </table>
    </div>
    <div style="margin-top: 100px;"></div>
  </div>
</template>
<script>
const axios = require("axios");
import moment from "moment";
export default {
  data: function() {
    return {
      data: [],
      search: "",
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
    this.getData();
  },
  methods: {
    getData() {
      const options = { okLabel: "ตกลง" };

      axios
        .get(this.url + "/booking-flash-report")
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
    },
    nextPage() {
      this.$router.push({ name: "ReportFlash" });
    }
  },
  computed: {
    filteredResources() {
      if (this.search) {
        return this.data.filter(item => {
          var tracking = item.tracking;
          var code = item.code;
          var message = item.message;
          var reason_code = item.reason_code;
          var reason_th = item.reason_th;
          if (
            tracking == null ||
            code == null ||
            message == null ||
            reason_code == null ||
            reason_th == null
          ) {
            tracking = "";
            code = "";
            message = "";
            reason_code = "";
            reason_th = "";
          }
          return (
            !this.search ||
            tracking.includes(this.search) ||
            tracking.toLowerCase().indexOf(this.search.toLowerCase()) > -1
          );
        });
      } else {
        return this.data
          .slice(0)
          .sort((a, b) => (a.id < b.id ? this.sorting : -this.sorting));
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
