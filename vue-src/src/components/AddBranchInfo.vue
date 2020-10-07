<template>
  <div class="container" style="margin-top: 60px;">
    <div style="text-align: center; margin-top: 100px;">
      <b
        style="font-size:18px;"
        v-if="branch_id==0? msg='เพิ่มข้อมูลสาขา': msg='แก้ไขข้อมูลสาขา'"
      >{{msg}}</b>
    </div>
    <div class="mycontent">
      <div class="left" style="border: 0px solid #000;"></div>
      <div class="center">
        <div>
          <b>รหัสสาขา:</b>
          <input
            v-model="data_branch_id"
            @keypress="isNumber($event)"
            onkeypress="if(this.value.length == 4) return false;"
            autocomplete="false"
          />
        </div>
        <div>
          <b>ตัวย่อ:</b>
          <input
            v-model="prefix_branch"
            v-on:keypress="engOnly"
            @input="prefix_branch = $event.target.value.toUpperCase()"
          />
        </div>
        <div>
          <b>ชื่อสาขา:</b>
          <input v-model="branch_name" />
        </div>
        <div>
          <b>สถานะ:</b>
          <select
            style="margin-left: 0px; margin-right: 0px;"
            class="select"
            v-model="branch_status"
          >
            <option value="0" disabled="disabled" selected="selected">----- เลือก สถานะ -----</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
        <div class="group-btn">
          <button class="cancel" v-on:click="clearBtn">ยกเลิก</button>
          <button v-on:click="confirm">บันทึก</button>
        </div>
      </div>
      <div class="right" style="border: 0px solid #000;"></div>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data: function() {
    return {
      branch_id: 0,
      action: "",
      selectValue: 0,
      data_branch_id: 0,
      branch_name: "",
      prefix_branch: "",
      branch_status: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.branch_id = this.$route.params.branchId;
    this.defaultBranch();
  },
  methods: {
    defaultBranch() {
      const options = { okLabel: "ตกลง" };
      if (this.branch_id !== 0) {
        axios
          .get("/branch/get-branch-info/" + this.branch_id)
          .then(response => {
            if (response.data) {
              this.dataBranch = response.data.data;

              this.data_branch_id = this.dataBranch[0].branch_id;
              this.branch_name = this.dataBranch[0].branch_name;
              this.prefix_branch = this.dataBranch[0].prefix_branch;
              this.branch_status = this.dataBranch[0].status;
              this.action = "edit";
            } else {
              this.$dialogs.alert("ไม่พบข้อมูล", options);
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      } else {
        this.data_branch_id = 0;
        this.branch_name = "";
        this.prefix_branch = "";
        this.branch_status = "active";
        this.action = "add";
      }
    },
    clearBtn() {
      this.data_branch_id = 0;
      this.branch_name = "";
      this.prefix_branch = "";
      this.branch_status = "active";
      // this.action = "add";
    },
    confirm() {
      const options = { okLabel: "ตกลง" };
      if (this.data_branch_id == "") {
        this.$dialogs.alert("กรุณาใส่รหัสสาขาให้ถูกต้อง", options);
      } else if (this.prefix_branch == "") {
        this.$dialogs.alert("กรุณาใส่ตัวย่อสาขาให้ถูกต้อง", options);
      } else if (this.branch_name == "") {
        this.$dialogs.alert("กรุณาใส่ชื่อสาขาให้ถูกต้อง", options);
      } else if (
        this.branch_status !== "active" &&
        this.branch_status !== "inactive"
      ) {
        this.$dialogs.alert("กรุณาเลือกสถานะสาขาให้ถูกต้อง", options);
      } else {
        var data = {
          branch_id: parseInt(this.data_branch_id),
          prefix_branch: this.prefix_branch.toUpperCase(),
          branch_name: this.branch_name,
          branch_status: this.branch_status
        };

        if (this.action == "add") {
          axios
            .post("/branch/add-branch", data)
            .then(response => {
              if (response.data.status == "success") {
                this.$dialogs.alert("เพิ่มข้อมูลสาขาเรียบร้อยแล้ว", options);
                this.$router.push("/");
              } else {
                this.$dialogs.alert("ไม่สามารถเพิ่มข้อมูลสาขาได้", options);
              }
            })
            .catch(function(error) {
              console.log(error);
            });
        } else if (this.action == "edit") {
          axios
            .post("/branch//edit-branch",data)
            .then(response => {
              if (response.data.status=="success") {
                this.$dialogs.alert("บันทึกข้อมูลสาขาเรียบร้อยแล้ว", options);
                this.$router.push("/");
              } else {
                this.$dialogs.alert("ไม่สามารถแก้ไขข้อมูลได้ เนื่องจาก..."+response.data.status, options);
              }
            })
            .catch(function(error) {
              console.log(error);
            });
        } else {
          this.$dialogs.alert("error_incorrect_action", options);
        }
      }
    },
    isNumber: function(evt) {
      // console.log("evt",evt)
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode >= 48 && charCode < 58) {
        return true;
      } else {
        evt.preventDefault();
      }
    },
    engOnly($event) {
      var englishAlphabetAndWhiteSpace = /[A-Za-z | 0-9 |.]/g;
      // let keyCode = $event.keyCode ? $event.keyCode : $event.which;

      var key = String.fromCharCode(event.which);
      if (
        event.keyCode == 8 ||
        event.keyCode == 37 ||
        event.keyCode == 39 ||
        englishAlphabetAndWhiteSpace.test(key)
      ) {
        return true;
      }
      $event.preventDefault();
    }
  }
};
</script>

<style lang="scss" >
.group-btn {
  text-align: center;
  button {
    padding: 5px 20px;
    background-color: #fff;
    border: 2px solid rgb(0, 136, 148);
    cursor: pointer;
    color: rgb(0, 136, 148);
    font-weight: bold;
    margin: 20px 10px;
    outline: none;
    transition: 0.5s;
    &:hover {
      background-color: rgb(0, 136, 148);
      color: #fff;
    }
  }
}
.select {
  width: 300px;
  border: none;
  border-bottom: 2px solid #000;
  background: none;
  // margin: 0 15px;
  outline: none;
  font-size: 16px;
  font-weight: bold;
}
.mycontent {
  .left {
    border: 1px solid #000;
  }
  .center,
  .right {
    border: 1px solid #000;
    padding: 10px 30px;
  }
  padding: 10px 30px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 10px;

  input {
    background: none;
    border: none;
    border-bottom: 1px solid #000;
    width: 100%;
    margin: 0 0 10px 0;
    padding: 5px 10px;
    outline: none;
  }
  input:disabled {
    color: #9e9e9e;
  }
  input:enabled {
    background: #dfdfdf;
    font-size: 14px;
  }
  textarea {
    background: none;
    border: none;
    border-bottom: 1px solid #000;
    width: 100%;
    outline: none;
    height: 70px;
    margin: 0 0 10px 0;
    padding: 5px 10px;
  }
}
</style>