<template>
  <div class="container" style="margin-top: 60px;">
    <div class="search">
      <b style="font-size:18px;">กรุณากรอกเลขสมาชิก :</b>
      <input maxlength="30" v-model="memberInput" autocomplete="false" style="width: 214px;" />
      <button v-on:click="getData" type="button">Search</button>
    </div>
    <div class="row">
      <div class="col-md-2"></div>
      <div class="col-md-8">
        <div class="center">
          <table class="head-table" style="width: 100%;">
            <tbody>
              <tr>
                <td style="width: 15%;">เลขสมาชิก:</td>
                <td style="width: 25%;">{{ memberInfo.member_id }}</td>
                <td style="width: 15%;">ชื่อ-นามสกุล:</td>
                <td style="width: 25%;">{{ memberInfo.firstname }} {{ memberInfo.lastname }}</td>
              </tr>
              <tr>
                <td style="width: 15%;">ชื่อย่อ:</td>
                <td style="width: 25%;">{{ memberInfo.aliasname }}</td>
                <td style="width: 20%;">เลขที่บัตรประชาชน:</td>
                <td style="width: 25%;">{{ memberInfo.citizenid }}</td>
              </tr>
              <tr>
                <td style="width: 15%;">สาขา:</td>
                <td style="width: 25%;">{{ memberInfo.merchantname }}</td>
                <td style="width: 15%;">เบอร์โทรศัพท์:</td>
                <td style="width: 25%;">{{ displayPhone }}</td>
              </tr>
              <tr>
                <td style="width: 15%;">สถานะ:</td>
                <td style="width: 25%;" v-for="(item) in listStatus" v-bind:key="item.id">
                  <input type="radio" :value="item.value" v-model="selectedStatus" />
                  {{ item.name }}
                </td>
                <td style="width: 15%;"></td>
                <td style="width: 25%;"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="height: 20px;"></div>
      </div>
    </div>
    <div class="search" style="text-align:center; width: 100%;">
      <label style="font-size:16px;">กรุณาใส่เบอร์โทรศัพท์:</label>
      <input
        maxlength="10"
        v-model="phoneInput"
        autocomplete="false"
        style="width: 214px;"
        v-on:keypress="onlyNumber"
      />
      <button v-on:click="checkMemberData" type="button"><i class="fa fa-search" aria-hidden="true"></i></button>

      <p style="font-size:16px; color: green;" v-if="availablePhone==true">{{reasonDisplay}}</p>
      <p style="font-size:16px; color: red;" v-else>{{reasonDisplay}}</p>
      <button v-on:click="confirmData" type="button">บันทึก</button>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data: function() {
    return {
      memberInput: "",
      memberInfo: {},
      displayPhone: "",
      phoneInput: "",
      merId: "",
      selectedStatus: "",
      availablePhone: true,
      reasonDisplay: "",
      listStatus: [
        { code: "01", name: "active", value: "active" },
        { code: "02", name: "inactive", value: "inactive" }
      ],
      url945: "https://api-key-tool.945holding.com",
      url945Dev: "https://admin-pc-tool.945.report"
    };
  },
  mounted: function() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
  },
  methods: {
    getData() {
      const options = { okLabel: "ตกลง" };
      this.memberInfo = "";
      if (this.memberInput == "") {
        this.$dialogs.alert("กรุณาใส่เลขสมาชิกให้ถูกต้อง", options);
      } else {
        axios
          .get(
            this.url945Dev +
              "/check/member-info?memberId=" +
              this.memberInput.trim()
          )
          .then(response => {
            if (response.data.status == "SUCCESS") {
              var memberInfo = response.data.memberInfo;
              if (memberInfo.length !== 0) {
                this.memberInfo = response.data.memberInfo[0];
                this.selectedStatus = this.memberInfo.status;
                this.changeDoubleSix2Zero();
              } else {
                this.$dialogs.alert("ไม่พบข้อมูล สมาชิกนี้ในระบบ", options);
              }
            } else {
              this.$dialogs.alert(
                "ไม่พบข้อมูล เนื่องจาก..." + response.data.reason,
                options
              );
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    onlyNumber($event) {
      let keyCode = $event.keyCode ? $event.keyCode : $event.which;
      if (keyCode < 48 || keyCode > 57) {
        // 46 is dot
        $event.preventDefault();
      }
    },
    checkMemberData() {
      const options = { okLabel: "ตกลง" };
      this.reasonDisplay = "";
      if (!this.memberInfo.member_id) {
        this.$dialogs.alert("กรุณาใส่เลขสมาชิกให้ถูกต้อง", options);
      } else if (this.phoneInput.length !== 10) {
        this.$dialogs.alert("กรุณาใส่เบอร์โทรศัพท์ให้ถูกต้อง", options);
      } else if (
        this.phoneInput[0] + this.phoneInput[1] !== "06" &&
        this.phoneInput[0] + this.phoneInput[1] !== "08" &&
        this.phoneInput[0] + this.phoneInput[1] !== "09"
      ) {
        this.$dialogs.alert("กรุณาใส่เบอร์โทรศัพท์มือถือเท่านั้น", options);
      } else if (this.displayPhone == this.phoneInput) {
        this.$dialogs.alert("กรุณาใส่เบอร์โทรศัพท์ใหม่ เนื่องจากเป็นเบอร์ที่ลงทะเบียนปัจจุบัน",options);
      } else {
        this.changeZero2DoubleSix();
        axios
          .get(
            this.url945Dev +
              "/parcel/check-member/phoneregis?phoneregis=" +
              this.phoneRegis
          )
          .then(response => {
            if (response.data.status == "EXISTED_MEMBER") {
              this.availablePhone = false;
              this.reasonDisplay = "กรุณาใส่เบอร์โทรศัพท์ใหม่ เนื่องจากเบอร์นี้ได้ลงทะเบียนไว้แล้ว";
            } else if (response.data.status == "SUCCESS") {
              this.availablePhone = true;
              this.reasonDisplay = "สามารถใช้เบอร์โทรศัพท์นี้ได้";
            } else {
              this.$dialogs.alert("ไม่พบข้อมูล เนื่องจาก..." + response.data.status,options);
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    confirmData() {
      const options = { okLabel: "ตกลง" };

      if (!this.memberInfo.member_id) {
        this.memberInfo == "";
        this.$dialogs.alert("กรุณาระบุ Tracking เพื่อทำรายการ", options);
      } else if (this.phoneInput.length !== 10) {
        this.$dialogs.alert("กรุณาใส่เบอร์โทรศัพท์ให้ถูกต้อง", options);
      } else if (
        this.phoneInput[0] + this.phoneInput[1] !== "06" &&
        this.phoneInput[0] + this.phoneInput[1] !== "08" &&
        this.phoneInput[0] + this.phoneInput[1] !== "09"
      ) {
        this.$dialogs.alert("กรุณาใส่เบอร์โทรศัพท์มือถือเท่านั้น", options);
      } else if (this.displayPhone == this.phoneInput) {
        this.$dialogs.alert("กรุณาใส่เบอร์โทรศัพท์ใหม่ เนื่องจากเป็นเบอร์ที่ลงทะเบียนปัจจุบัน",options);
      } else if (this.availablePhone == false) {
        this.$dialogs.alert("กรุณาใส่เบอร์โทรศัพท์ใหม่ เนื่องจากเบอร์นี้ได้ลงทะเบียนแล้ว", options);
      } else {
        var moduleName = "change_phone_regis";
        var dataConfirm = {
          previousValue: this.memberInfo,
          currentValue: {
            memberId: this.memberInfo.member_id,
            phoneRegis: this.phoneRegis
          },
          user: this.$session.get("session_username"),
          moduleName: moduleName
        };

        axios
          .post("/tools/change-phoneregis", dataConfirm)
          .then(response => {
            if (response.data.status == "SUCCESS") {
              this.$dialogs.alert("เปลี่ยนเบอร์โทรศัพท์สมาชิกเรียบร้อยแล้ว",options);
              this.$router.push("/");
            } else {
              this.$dialogs.alert(
                "เปลี่ยนเบอร์โทรศัพท์สมาชิกได้ เนื่องจาก..." + response.data.reason,
                options
              );
              this.$router.push("/");
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    changeDoubleSix2Zero() {
      var phone = this.memberInfo.phoneregis;
      this.displayPhone = "0";
      for (let i = 2; i < phone.length; i++) {
        this.displayPhone += phone[i];
      }
    },
    changeZero2DoubleSix() {
      var phone = this.phoneInput;
      this.phoneRegis = "66";
      for (let i = 1; i < phone.length; i++) {
        this.phoneRegis += phone[i];
      }
    }
  }
};
</script>

<style lang="scss" >
.search,
.select-tool,
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
.search {
  input {
    margin: 10px 5px 10px 5px;
    background: none;
    border: none;
    border-bottom: 1px solid #000;
    outline: none;
    width: 200px;
    text-align: center;
  }
  button {
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
  }
}

.right div:nth-child(4) {
  margin-top: 20px;
}
.left {
  .item2 {
    padding: 10px 10px;
    .v-zoomer {
      padding: 5px;
      width: auto;
      height: 500px;
      border: 2px solid #dfdfdf;
      background: #fff;
    }

    .btnOption {
      text-align: center;
    }
    button {
      background-color: rgb(0, 136, 148);
      border: none;
      padding: 10px;
      color: #fff;
      margin: 5px 5px 0 5px;
    }
  }
}
.head-table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  // border: 1px solid #ddd;
  tbody,
  th,
  td {
    text-align: left;
    padding: 8px;
  }

  // tr:nth-child(even) {
  //   background-color: #f2f2f2;
  // }
}
.table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  // border: 1px solid #ddd;
  th,
  td {
    text-align: left;
    padding: 8px;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
}
.select {
  width: 300px;
  border: none;
  border-bottom: 2px solid #000;
  background: none;
  margin: 0 15px;
  outline: none;
  font-size: 16px;
  font-weight: bold;
}
.cancle {
  padding: 5px 20px;
  background-color: #fff;
  border: 2px solid rgb(122, 122, 122) !important;
  cursor: pointer;
  color: rgb(122, 122, 122) !important;
  font-weight: bold;
  outline: none;
  transition: 0.5s;
  &:hover {
    background-color: rgb(122, 122, 122) !important;
    color: #fff !important;
  }
}
.save {
  padding: 5px 20px;
  background-color: #fff;
  border: 2px solid #32cd32 !important;
  cursor: pointer;
  color: #32cd32 !important;
  font-weight: bold;
  outline: none;
  transition: 0.5s;
  &:hover {
    background-color: #32cd32 !important;
    color: #fff !important;
  }
}
</style>