<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
      <table>
        <tbody style="text-align:center;">
          <tr v-for="(item, index) in listPhone" v-bind:key="item.id">
            <router-link :to="{ name: 'SetPriority', params: { phoneNumber: listPhone[index].phoneNumber }}">
              <td>{{listPhone[index].phoneNumber}}({{ listPhone[index].count }})</td>
            </router-link>
          </tr>
        </tbody>
        <!-- <tr>
          <th style="text-align: center;">เบอร์ผู้ส่ง</th>
          <th style="text-align: center;">จำนวนที่ค้าง</th>
          <th style="text-align: center;">Action</th>
        </tr>
        <tr>
          <td style="text-align: center;">0901150343</td>
          <td style="text-align: center;">3</td>
          <td style="text-align: center;">
            <router-link to="/setpriority" tag="button" class="button-set">SetPriority</router-link>&nbsp;
            <router-link to="/notkeytracking" tag="button" class="button-list">ListTrcking</router-link>
          </td>
        </tr>
        <tr>
          <td style="text-align: center;">0851002454</td>
          <td style="text-align: center;">2</td>
          <td style="text-align: center;">
            <router-link to="/setpriority" tag="button" class="button-set">SetPriority</router-link>&nbsp;
            <router-link to="/notkeytracking" tag="button" class="button-list">ListTrcking</router-link>
          </td>
        </tr>
        <tr>
          <td style="text-align: center;">0841254355</td>
          <td style="text-align: center;">1</td>
          <td style="text-align: center;">
            <router-link to="/setpriority" tag="button" class="button-set">SetPriority</router-link>&nbsp;
            <router-link to="/notkeytracking" tag="button" class="button-list">ListTrcking</router-link>
          </td>
        </tr> -->
      </table>
    </div>
  </div>
</template>

<script>
// const axios = require("axios");
export default {
  components: {},
  data: function() {
    return {
      listPhone: [],
      tracking: ""
    };
  },
  mounted() {
    this.getlistPhoneNumber();
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
  },
  methods: {
    getlistPhoneNumber() {
        var response = {
            "status": "ok",
            "result": [
                {
                    "phoneNumber": "0815919729",
                    "priority": 0,
                    "count": 30
                },
                {
                    "phoneNumber": "0870973580",
                    "priority": 0,
                    "count": 24
                },
                {
                    "phoneNumber": "0894195619",
                    "priority": 0,
                    "count": 2
                }
            ]
        };
        this.listPhone=response.result
      //   axios
      //     .get("https://tool.945parcel.com/tools/list/tracking")
      //     // .get("http://127.0.0.1:3200/tools/list/tracking")
      //     .then(response => {
      //       if (response.data.status == "SUCCESS") {
            //   this.listPhone = response.data.listTracking;
      //         console.log(this.listTracking);
      //       } else {
      //         alert("ไม่พบข้อมูล");
      //       }
      //     })
      //     .catch(function(error) {
      //       console.log(error);
      //     });
    }
  }
};
</script>

<style lang="scss">
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