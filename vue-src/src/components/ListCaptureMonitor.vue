<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
      <div class="row">
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
        <div class="col-ms-10 col-sm-10 col-xs-10" style="text-align:center;">
          <h2 style="margin-top: 10px;">รายการแต่ละสาขา {{ date | moment("LL") }}</h2>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
      </div>
      <div class="row">
        <div class="col-ms-4 col-sm-4 col-xs-4" style="text-align: center; margin-top: 5px; padding-left: 0px; padding-right: 0px;">
          <div>
            <input type="date" id="datePick" v-model="datePick" name="datePick" />
            <span>
              <button class="button-re" v-on:click="getData()"><i class="fa fa-search" aria-hidden="true"></i></button>
            </span>
          </div>
        </div>
        <div class="col-ms-5 col-sm-5 col-xs-5" style=" text-align: center; margin-top: 15px;">
          <label style="font-size:16px;">กรุณาเลือกสาขา :</label>
          <select style="margin-left: 10px; margin-right: 0px;" class="select" v-model="branchInfo" >
            <option value="0">-----เลือก shop-----</option>
            <option v-for="item in dataBranch" v-bind:key="item.branch_id" :value="item" >{{ item.branch_name }}</option>
          </select>
        </div>
        <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align: right; margin-top: 5px; padding-left: 0px;padding-right: 0px;" >
          <label style="margin-top: 5px;">Refresh</label>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1" style="text-align: center; margin-top: 5px; padding-left: 0px; padding-right: 0px;" >
          <button class="button-re" v-on:click="getData()"><i class="fa fa-refresh" aria-hidden="true"></i></button>
        </div>
        <table class="table-branch" style="margin-top: 20px;">
          <tr>
            <th style="text-align: center; width: 10%;">รหัสสมาชิก</th>
            <th style="text-align: center; width: 25%;">ชื่อ-นามสกุล</th>
            <th style="text-align: center; width: 10%;">เบอร์โทรศัพท์</th>
            <th style="text-align: center; width: 10%;">จำนวนทั้งหมด</th>
            <th style="text-align: center; width: 5%;">จำนวน Capture</th>
            <th style="text-align: center; width: 5%;">จำนวน Auto Labeling</th>
            <th style="text-align: center; width: 5%;">จำนวน QuickLink</th>
            <th style="text-align: center; width: 5%;">จำนวน QuickQuick</th>
            <th style="text-align: center; width: 20%;">เวลา Capture เริ่ม-ล่าสุด</th>
            <th style="text-align: center; width: 10%;">หน้ากล่อง</th>
            <th style="text-align: center; width: 10%;">สถานะ</th>
          </tr>
          <tr v-for="item in data" v-bind:key="item.id">
            <td style="text-align: center;">{{ item.member_id }}</td>
            <td style="text-align: center;">{{ item.firstname }} {{ item.lastname }}</td>
            <td style="text-align: center;">{{ item.phoneNumber }}</td>
            <td style="text-align: center;">{{ item.totalCapture }}</td>
            <td style="text-align: center;">{{ item.countCapture }}</td>
            <td style="text-align: center;">{{ item.countAutolabel }}</td>
            <td style="text-align: center;">{{ item.countQl }}</td>
            <td style="text-align: center;">{{ item.countQQ }}</td>
            <td style="text-align: center;">{{ item.startCapture | moment("HH:mm:ss") }}-{{ item.lastCapture | moment("HH:mm:ss") }}</td>
            <td style="text-align: center;"><button class="button-address" v-on:click="getTracking(item)"><i class="fa fa-address-card-o" aria-hidden="true"></i></button></td>

            <td style="text-align: center; color: green;" v-if="parseInt(item.countQl) + parseInt(item.countQQ) == parseInt(item.totalCapture)"><i class="fa fa-circle" aria-hidden="true"></i></td>
            <td style="text-align: center; color: red;" v-else><i class="fa fa-circle" aria-hidden="true"></i></td>
          </tr>
        </table>
      </div>
      <div style="margin-top: 100px;"></div>
    </div>
  </div>
</template>
<script>
const axios = require("axios");
import moment from "moment";
export default {
  data: function() {
    return {
      data: [],
      date: new Date(),
      datePick: moment().tz("Asia/Bangkok").format("YYYY-MM-DD"),
      branchInfo: {
        id: 5,
        branch_id: 47,
        prefix_branch: "PC",
        branch_name: "kl2",
        status: "active"
      },
      dataBranch: [],
      displayPhone: "",
      url: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.getData();
    this.getBranch();
  },
  methods: {
    getData() {
      const options = { okLabel: "ตกลง" };
      axios
        .get(this.url + "/list-capture-monitor?date_check=" + moment(this.datePick).format("YYYY-MM-DD") + "&branch_id=" + this.branchInfo.branch_id)
        .then(response => {
          if (response.data.status !== "SUCCESS") {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
            this.data = [];
          } else {
            if (response.data.data.length === 0) {
              this.$dialogs.alert("ไม่พบข้อมูล", options);
              this.data = [];
            } else {
              this.data = response.data.data;
            }
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    getTracking(item) {
      let data = {
        memberId: item.member_id,
        phoneNumber: item.phoneNumber,
        memberName: item.firstname + " " + item.lastname,
        dateSelect: moment(this.datePick).format("YYYY-MM-DD")
      };
      this.$router.push({ name: "ListCapture", params: data });
    },
    getBranch() {
      const options = { okLabel: "ตกลง" };
      axios
        .get(this.url + "/branch/branch-info")
        .then(response => {
          if (response.data) {
            this.dataBranch = response.data.data;
          } else {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  },
  computed: {}
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
.button-address {
  padding: 5px 20px;
  background-color: #fff;
  border: 1px solid rgb(0, 136, 148);
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
.button-re {
  padding: 5px 20px;
  background-color: #fff;
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
.select {
  width: 300px;
  border: none;
  border-bottom: 2px solid #000;
  background: none;
  outline: none;
  font-size: 16px;
  font-weight: bold;
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
