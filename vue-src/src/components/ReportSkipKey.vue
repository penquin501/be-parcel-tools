<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x: auto;">
      <div class="row">
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
        <div class="col-ms-3 col-sm-3 col-xs-3">
          <b style="font-size:18px;">ค้นหา Tracking :</b>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3">
          <div class="search">
            <input v-model="trackingSearch" autocomplete="false" style="margin-top: 0px;" />
          </div>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
      </div>

      <div class="row">
        <div class="col-ms-9 col-sm-9 col-xs-9"></div>
        <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align: right;">
          <label style="margin-top: 5px;">Refresh</label>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1" style="margin-bottom: 5px;">
          <button class="button-re" v-on:click="getListSkipTracking()">
            <i class="fa fa-refresh" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <table>
        <tr>
          <th style="text-align: center;">Tracking</th>
          <th style="text-align: center;">เหตุผล</th>
          <th style="text-align: center;">ค่า Priority</th>
          <th style="text-align: center;">Action</th>
        </tr>
        <tr v-bind:key="item.id" v-for="item in filteredResources">
          <td style="text-align: center;">{{ item.tracking}}</td>
          <div style="text-align: center;">
            <div v-if="item.priorityReason=='ERROR_IMAGE_BLUR'">
              <td>ภาพไม่ชัด</td>
            </div>
            <div v-if="item.priorityReason=='ERROR_MISSING_PHONE'">
              <td>ไม่มีเบอร์โทรศัพท์ผู้รับ</td>
            </div>
            <div v-if="item.priorityReason=='ERROR_ADDRESS_NOT_COMPLETE'">
              <td>ข้อมูลที่อยู่ไม่ครบ</td>
            </div>
            <div v-if="item.priorityReason=='ERROR_NO_RECEIVER_NAME'">
              <td>ไม่มีชื่อผู้รับ</td>
            </div>
          </div>

          <td style="text-align: center;">{{ item.priority }}</td>
          <td style="text-align: center;">
            <button v-on:click="getTracking(item.uid)" class="button-set">
              <i class="fa fa-keyboard-o" aria-hidden="true"></i>
            </button>&nbsp;
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data: function() {
    return {
      listSkipTracking: [],
      tracking: "",
      trackingSearch: ""
    };
  },
  mounted() {
    this.getListSkipTracking();
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
  },
  methods: {
    getTracking(uid) {
      window.open("https://key.my945capture.com/parcel-capture/fill/" + uid);
    },
    getListSkipTracking() {
      const options = { okLabel: "ตกลง" };
      axios.get("https://key.my945capture.com/v2/api/parcel-capture/tasks/list-priority-reason")
      .then(response => {
        if (response.data.status == "ok") {
          this.listSkipTracking = response.data.results;
        } else {
          this.$dialogs.alert("ไม่พบข้อมูล", options);
        }
      })
      .catch(function(error) {
        console.log(error);
      });
    }
  },
  computed: {
    filteredResources() {
      if (this.trackingSearch) {
        return this.listSkipTracking.filter(item => {
          var tracking = item.tracking;

          if (tracking == null) {
            tracking = "";
          }
          return !this.trackingSearch || tracking.includes(this.trackingSearch);
        });
      } else {
        return this.listSkipTracking;
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