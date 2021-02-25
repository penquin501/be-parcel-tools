<template>
  <div class="container" style="margin-top: 60px;">
    <div style="text-align: center; margin-top: 100px;">
      <b style="font-size:18px;">รายการข้อมูลสาขา</b>
    </div>

    <div class="row">
      <div class="col-ms-2 col-sm-2 col-xs-2">
        <button class="button-add" v-on:click="addBranch(0)">
          <i class="fa fa-plus" aria-hidden="true"></i>เพิ่มข้อมูลสาขา
        </button>
      </div>
      <div class="col-ms-7 col-sm-7 col-xs-7"></div>
      <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align:right;">
        <label style="margin-top: 5px;">Refresh</label>
      </div>
      <div class="col-ms-1 col-sm-1 col-xs-1" style="margin-bottom: 5px;">
        <button class="button-re" v-on:click="getBranch()">
          <i class="fa fa-refresh" aria-hidden="true"></i>
        </button>
      </div>
    </div>
    <table>
      <tr>
        <th style="text-align: center;">รหัสสาขา</th>
        <th style="text-align: center;">ตัวย่อ</th>
        <th style="text-align: center;">ชื่อสาขา</th>
        <th style="text-align: center;">สถานะ</th>
        <th style="text-align: center;">Action</th>
      </tr>
      <tr v-bind:key="item.id" v-for="item in dataBranch">
        <td style="text-align: center;">{{ item.branch_id }}</td>
        <td style="text-align: center;">{{ item.prefix_branch }}</td>
        <td style="text-align: center;">{{ item.branch_name }}</td>
        <td style="text-align: center;">{{ item.status }}</td>
        <td style="text-align: center;">
          <button v-on:click="addBranch(item.branch_id)" class="button-set">
            <i class="fa fa-pencil" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    </table>
    <div style="margin-top: 50px; text-align: center;"></div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data: function() {
    return {
      dataBranch: [],
      branchId: 0
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.getBranch();
  },
  methods: {
    getBranch() {
      const options = { okLabel: "ตกลง" };
      axios.get("/branch/branch-info")
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
    },
    addBranch(branch_id) {
      this.$router.push({ name: "AddBranch", params: { branchId: branch_id } });
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

.button-add {
  padding: 5px 20px;
  background-color: #fff;
  cursor: pointer;
  color: rgb(0, 0, 0);
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