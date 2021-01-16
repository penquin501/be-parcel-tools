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
                <td style="width: 25%;" v-for="(item) in listStatus" v-bind:key="item.id"><input type="radio" :value="item.value" v-model="selectedStatus" />{{ item.name }}</td>
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
      <label style="font-size:16px;">กรุณาเลือกสาขา:</label>
      <select style="margin-left: 0px; margin-right: 0px;" class="select" v-model="selectedMerId">
        <option value="0">-----เลือก shop-----</option>
        <option
          v-for="item in shopInfo"
          v-bind:key="item.takeorderby"
          :value="item"
        >{{ item.merchantname }}</option>
      </select>
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
      shopInfo: [],
      merId: "",
      selectedMerId: "0",
      selectedStatus: "",
      listStatus: [
        { code: "01", name: "active", value: "active" },
        { code: "02", name: "inactive", value: "inactive" }
      ],
      url945: "https://api-key-tool.945holding.com"
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
        axios.get(this.url945 + "/check/member-info?memberId=" + this.memberInput.trim())
          .then(response => {
            if (response.data.status == "SUCCESS") {
              var memberInfo = response.data.memberInfo;
              if (memberInfo.length !== 0) {
                this.memberInfo = response.data.memberInfo[0];
                this.selectedStatus = this.memberInfo.status;
                this.changeDoubleSix2Zero();
                this.getShopData();
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
    getShopData() {
      const options = { okLabel: "ตกลง" };
      axios
        .get(this.url945 + "/select/parcel-shop-info")
        .then(response => {
          if (response.data.status == "SUCCESS") {
            var shopInfo = response.data.parcelShopInfo;
            if (shopInfo.length !== 0) {
              this.shopInfo = shopInfo;
              this.shopInfo.forEach(element => {
                if (element.takeorderby == this.memberInfo.merid) {
                  this.selectedMerId = element;
                }
              });
            } else {
              this.$dialogs.alert("ไม่พบข้อมูล shop ในระบบ", options);
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
    },
    confirmData() {
      const options = { okLabel: "ตกลง" };

      if (!this.memberInfo.member_id) {
        this.memberInfo == "";
        this.$dialogs.alert("กรุณาระบุ member Id เพื่อทำรายการ", options);
      } else if (this.selectedMerId == "0") {
        this.$dialogs.alert(
          "กรุณาเลือก shop ที่ต้องการเปลี่ยนให้ถูกต้อง",
          options
        );
      } else if (
        this.memberInfo.merid == this.selectedMerId.takeorderby &&
        this.selectedStatus == "active"
      ) {
        this.$dialogs.alert(
          "กรุณาเปลี่ยน shop เนื่องจาก สมาชิกอยู่ที่ shop นี้แล้ว",
          options
        );
      } else {
        var moduleName = "move_member";
        var dataConfirm = {
          previousValue: this.memberInfo,
          currentValue: {
            memberId: this.memberInfo.member_id,
            merId: this.selectedMerId.takeorderby,
            status: this.selectedStatus
          },
          user: this.$session.get("session_username"),
          moduleName: moduleName
        };
        // console.log(JSON.stringify(dataConfirm));
        axios
          .post("/tools/move-member-info", dataConfirm)
          .then(response => {
            if (response.data.status == "SUCCESS") {
              this.$dialogs.alert("ย้ายเลขสมาชิก : " + response.data.memberInfo.member_id + " ไปยัง " + response.data.memberInfo.merchantname + " เรียบร้อยแล้ว", options);
              this.$router.push("/");
            } else {
              this.$dialogs.alert("ไม่สามารถย้ายเลขสมาชิกได้ เนื่องจาก..." + response.data.reason, options);
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