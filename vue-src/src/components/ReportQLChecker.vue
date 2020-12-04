<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
        <div class="row">
        <div class="col-ms-1 col-sm-1 col-xs-1"></div>
        <div class="col-ms-10 col-sm-10 col-xs-10" style="text-align:center;">
          <h2 style="margin-top: 10px;">Report QL Checker {{ date | moment("LL") }}</h2>
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
          <th style="text-align:center;">รหัสสาขา</th>
          <th style="text-align:center;">เวลา</th>
          <th style="text-align:center;">เลขที่บิล</th>
          <th style="text-align:center;">tracking</th>
          <th style="text-align:center;">ข้อมูลที่ผิด</th>
          <th style="text-align:center;">error_maker</th>
          <th style="text-align:center;">user_id/operation_key</th>
        </tr>
        <tr v-for="(item) in filteredResourcesBilling" v-bind:key="item.id">
            <td style="text-align: center;">{{ item.branch_id }}</td>
            <td style="text-align: center;">{{ item.record_date | moment("HH:mm:ss") }}</td>
            <td style="text-align: center;">{{ item.billing_no }}</td>
            <td style="text-align: center;">{{ item.tracking }}</td>
            <td style="text-align: center;width: 200px;">
                <p v-if="item.error_code == 'error_parcel_type'">
                    ประเภทการจัดส่งไม่ตรงกัน
                </p>
                <p v-if="item.error_code == 'error_zipcode'">
                    รหัสไปรษณีย์ไม่ตรงกัน
                </p>
                <p v-if="item.error_code == 'both'">
                    ทั้ง2ฝั่งไม่ตรงกัน
                </p>
                </td>
            <td style="text-align: center;">{{ item.error_maker }}</td>
            <td style="text-align: center;">{{ item.user_id }} / {{ item.operation_key }}</td>
        </tr>
      </table>
    </div>
    <div style="margin-top: 100px;"></div>
  </div>
  </div>
</template>
<script>
const axios = require("axios");
import moment from 'moment';
export default {
  data: function() {
    return {
      data: [
        {
            "id": 1,
            "branch_id": 39,
            "user_id": 123,
            "billing_no": "39-123-191212161847-892",
            "error_code": "error_zipcode",
            "error_maker": "key operator",
            "cs_name": "cs",
            "tracking": "TDZ20109034",
            "operation_key": "",
            "record_date": "2020-03-05T06:42:47.000Z"
        },
        {
            "id": 2,
            "branch_id": 41,
            "user_id": 359,
            "billing_no": "41-359-200129150404-845",
            "error_code": "error_parcel_type",
            "error_maker": "key operator",
            "cs_name": "cs",
            "tracking": "TDZ20066341",
            "operation_key": "66841131206",
            "record_date": "2020-03-05T06:56:46.000Z"
        },
        {
            "id": 3,
            "branch_id": 41,
            "user_id": 359,
            "billing_no": "41-359-200129152708-484",
            "error_code": "error_zipcode",
            "error_maker": "shop staff",
            "cs_name": "cs",
            "tracking": "TDZ20123264",
            "operation_key": "66614804331",
            "record_date": "2020-03-05T07:20:32.000Z"
        },
        {
            "id": 4,
            "branch_id": 185,
            "user_id": 1364,
            "billing_no": "185-1364-200206113550-377",
            "error_code": "error_zipcode",
            "error_maker": "key operator",
            "cs_name": "cs",
            "tracking": "TDZ20332250",
            "operation_key": "66957105575",
            "record_date": "2020-03-05T07:23:39.000Z"
        },
        {
            "id": 5,
            "branch_id": 185,
            "user_id": 1364,
            "billing_no": "185-1364-200206113550-377",
            "error_code": "error_zipcode",
            "error_maker": "key operator",
            "cs_name": "cs",
            "tracking": "TDZ20332248",
            "operation_key": "66957105575",
            "record_date": "2020-03-05T07:37:09.000Z"
        },
        {
            "id": 6,
            "branch_id": 185,
            "user_id": 1364,
            "billing_no": "185-1364-200206113550-377",
            "error_code": "error_zipcode",
            "error_maker": "shop staff",
            "cs_name": "cs",
            "tracking": "TDZ20332247",
            "operation_key": "66957105575",
            "record_date": "2020-03-05T07:41:59.000Z"
        },
        {
            "id": 7,
            "branch_id": 185,
            "user_id": 1364,
            "billing_no": "185-1364-200206113550-377",
            "error_code": "error_parcel_type",
            "error_maker": "key operator",
            "cs_name": "cs",
            "tracking": "TDZ20332245",
            "operation_key": "+66957105575",
            "record_date": "2020-03-05T07:42:47.000Z"
        },
        {
            "id": 8,
            "branch_id": 185,
            "user_id": 1364,
            "billing_no": "185-1364-200206113550-377",
            "error_code": "error_zipcode",
            "error_maker": "shop staff",
            "cs_name": "cs",
            "tracking": "TDZ20332249",
            "operation_key": "66957105575",
            "record_date": "2020-03-05T07:56:44.000Z"
        },
        {
            "id": 9,
            "branch_id": 185,
            "user_id": 1364,
            "billing_no": "185-1364-200206113550-377",
            "error_code": "error_zipcode",
            "error_maker": "shop staff",
            "cs_name": "cs",
            "tracking": "TDZ20332249",
            "operation_key": "66957105575",
            "record_date": "2020-03-05T10:02:31.000Z"
        }
    ],
      ql_checker: [],
      date: new Date(),
      datePick: moment().tz("Asia/Bangkok").format("YYYY-MM-DD"),
      sorting: -1
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    // this.getReportBranch();
  },
  methods: {
    getReportBranch() {
      const options = { okLabel: "ตกลง" };
      axios
        .get("https://tool.945parcel.com/log-daily-tool?date_check=2020-12-02")
        .then(response => {
          if (response.data.length === 0) {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
            this.data=[];
          } else {
            for(var i=0; i< response.data.length; i++) {
                if(response.data[i].module_name == "ql_checker"){
                        this.ql_checker.push(response.data[i]);
                }
            }
            console.log(this.ql_checker);
          }
            //   +this.datePick
        })
        .catch(function(error) {
          console.log(error);
        });
    },
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
