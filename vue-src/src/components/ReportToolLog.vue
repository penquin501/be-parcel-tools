<template>
  <div style="margin-top: 60px">
    <div class="container" style="overflow-x: auto">
      <div class="row">
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
        <div class="col-ms-10 col-sm-10 col-xs-10" style="text-align: center">
          <h2 style="margin-top: 10px">รายการเครื่องมือที่ใช้ {{ date | moment("LL") }}</h2>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
      </div>
      <div class="row">
        <div
          class="col-ms-4 col-sm-4 col-xs-4"
          style="text-align: center; margin-top: 5px; padding-left: 0px; padding-right: 0px;"
        >
          <div>
            <input type="date" id="datePick" v-model="datePick" name="datePick" />
            <span>
              <button class="button-re" v-on:click="getReportBranch()">
                <i class="fa fa-search" aria-hidden="true"></i>
              </button>
            </span>
          </div>
        </div>
        <div
          class="col-ms-6 col-sm-6 col-xs-6"
          style="text-align: center; margin-top: 5px; padding-left: 0px; padding-right: 0px;"
        ></div>
        <div
          class="col-ms-2 col-sm-2 col-xs-2"
          style="text-align: center; margin-top: 5px; padding-left: 0px; padding-right: 0px;"
        >
          <label style="margin-top: 5px; margin-right: 13px">Refresh</label>
          <button class="button-re" v-on:click="getReportBranch()">
            <i class="fa fa-refresh" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div class="row">
        <div style="height: 50px; margin-top: 20px; margin-left: 20px; text-align: center;">
          <label>
            <b>เลือก Tools :</b>
          </label>
        </div>
        <div class="controls" style="overflow-x: auto; width: 90%; margin: 10px auto">
          <div class="radio-inline">
            <label>
              <input
                type="checkbox"
                style="margin-right: 0px; margin-left: 0px; width: 30px"
                @click="checkAll()"
                v-model="isCheckAll"
              />ทั้งหมด
            </label>
          </div>
          <div class="radio-inline" v-for="item in listModule" v-bind:key="item.id">
            <label>
              <input
                type="checkbox"
                style="margin-right: 0px; margin-left: 0px; width: 30px"
                v-bind:value="item"
                v-model="listCheckbox"
                @change="updateCheckall()"
              />
              {{ item }}
            </label>
          </div>
        </div>
      </div>
      <div class="row">
        <table class="table-branch">
          <tr>
            <th style="text-align: center; width: 5%">เวลา</th>
            <th style="text-align: center; width: 5%">สาขา</th>
            <th style="text-align: center; width: 15%">เลขที่บิล</th>
            <th style="text-align: center; width: 5%">tracking</th>
            <th style="text-align: center; width: 5%">ค่าปัจจุบัน</th>
            <th style="text-align: center; width: 15%">เหตุผล</th>
            <th style="text-align: center; width: 15%">รายละเอียดเพิ่มเติม</th>
            <th style="text-align: center; width: 5%">เครื่องมือที่ใช้</th>
          </tr>
          <tr v-for="item in data" v-bind:key="item.id">
            <td style="text-align: center">{{ item.time_to_system | moment("HH:mm:ss") }}</td>
            <td style="text-align: center">{{ item.branch_name }}</td>
            <td style="text-align: center">{{ item.billing_no }}</td>
            <td style="text-align: center">{{ item.ref }}</td>
            <td style="text-align: center">{{ item.current_value }}</td>
            <td style="text-align: center">{{ item.reason }}</td>
              <!-- <p v-if="item.reason == 'error_parcel_type'">ประเภทการจัดส่งไม่ตรงกัน</p>
              <p v-else-if="item.reason == 'error_zipcode'">รหัสไปรษณีย์ไม่ตรงกัน</p>
              <p v-else-if="item.reason == 'both'">ทั้ง2ฝั่งไม่ตรงกัน</p>
              <p v-else-if="item.reason == 'wrong_member'">ทำรายการผิด member</p>
              <p v-else-if="item.reason == 'data_not_reach'">ฝั่งserver ไม่ได้รับข้อมูล</p>
              <p v-else>{{ item.reason }}</p>-->
            <td style="text-align: center">{{ item.remark }}</td>
            <td style="text-align: center">{{ item.module_name }}</td>
          </tr>
        </table>
      </div>
      <div style="margin-top: 60px"></div>
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
      ql_checker: [],
      date: new Date(),
      datePick: moment().tz("Asia/Bangkok").format("YYYY-MM-DD"),
      sorting: -1,
      listCheckbox: [],
      isCheckAll: false,
      listModule: [],
      url: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.getReportBranch();
    this.checkAll();
  },
  methods: {
    getReportBranch() {
      const options = { okLabel: "ตกลง" };
      axios
        .get(this.url + "/log-daily-tool?date_check=" + this.datePick)
        .then(response => {
          if (response.data.length === 0) {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
            this.data = [];
            this.listModule = [];
          } else {
            var result = response.data;
            this.listModule = [];
            var moduleInfo = {};
            for (let item of result) {
              if (!(item.module_name in moduleInfo)) {
                moduleInfo[String(item.module_name)] = [];
              }
              moduleInfo[String(item.module_name)].push(item);
            }
            var arr = this.listModule;
            for (const [key] of Object.entries(moduleInfo)) {
              this.listModule.push(key);
            }
            var clean = arr.filter((arr, index, self) => index === self.findIndex(t => t === arr));
            this.listModule = clean;
            if (this.isCheckAll || (this.listCheckbox.length == this.listModule.length)) {
              this.data = result;
            } else {
              for (var i = 0; i < this.listCheckbox.length; i++) {
                for (var j = 0; j < result.length; j++) {
                  if (this.listCheckbox[i] == result[j].module_name) {
                    this.data.push(result[j]);
                  }
                }
              }
            }
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    checkAll: function() {
      this.isCheckAll = !this.isCheckAll;
    },
    updateCheckall: function() {
      if (this.listCheckbox.length == this.listModule.length) {
        this.isCheckAll = true;
      } else {
        this.isCheckAll = false;
      }
      this.data = [];
      this.getReportBranch();
    }
  },
  computed: {
    filteredResourcesBilling() {
      return this.data.slice(0).sort((a, b) => (a.id < b.id ? this.sorting : -this.sorting));
    }
  }
};
</script>
<style lang="scss">
.radio-inline {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 6px;
}
.controls {
  display: flex;
}
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
