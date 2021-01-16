<template>
  <div style="margin-top: 60px;">
    <div class="search">
      <b style="font-size:18px;">กรุณาใส่เลข Tracking :</b>
      <input maxlength="13" v-model="trackingInput" autocomplete="false" />

      <button v-on:click="getData" type="button">Search</button>
    </div>
    <div class="mycontent">
      <div class="left">
        <div class="item2">
          <v-zoomer class="v-zoomer">
            <img
              :src="imgUrl"
              style="object-fit: contain; width: 100%; height: 100%; "
              :style="`transform: rotate(${rotation}deg);`"
            />
          </v-zoomer>
          <div class="btnOption">
            <!-- <button v-on:click="rotateLeft"><i class="fa fa-undo" style="font-size: 20px;"></i></button> -->
            <button v-on:click="rotateLeft">
              <img style="width: 20px" src="../assets/left.png" />
            </button>
            &nbsp;
            <!-- <button v-on:click="rotateRight"><i class="fa fa-repeat" style="font-size: 20px;"></i></button> -->
            <button v-on:click="rotateRight">
              <img style="width: 20px" src="../assets/right.png" />
            </button>
          </div>
        </div>
      </div>
      <div class="center">
        <div>
          <b>Tracking:</b>
          <input :disabled="billingInfo" v-model="tracking" />
        </div>
        <div>
          <b>เลขที่บิล:</b>
          <input :disabled="billingInfo" v-model="billing_no" />
        </div>
        <div>
          <b>ขนาดพัสดุ:</b>
          <input :disabled="billingInfo" v-model="size_id" />
        </div>

        <div>
          <b>ราคาพัสดุ:</b>
          <input :disabled="billingInfo" v-model="size_price" />
        </div>

        <div>
          <b>มูลค่า COD:</b>
          <input :disabled="billingInfo" v-model="cod_value" />
        </div>
        <div>
          <b>ประเภทการจัดส่ง:</b>
          <input :disabled="billingInfo" v-model="bi_parcel_type" />
        </div>
        <div>
          <b>รหัสไปรษณีย์:</b>
          <input :disabled="billingInfo" v-model="bi_zipcode" />
        </div>
        <div>
          <b>สถานะ:</b>
          <input :disabled="billingInfo" v-model="order_status_lb" />
        </div>
      </div>
      <div class="right">
        <div>
          <b>ชื่อผู้ส่ง:</b>
          <input :disabled="billingInfo" v-model="sender_name" />
        </div>
        <div>
          <b>เบอร์โทรศัพท์ผู้ส่ง:</b>
          <input :disabled="billingInfo" v-model="sender_phone" />
        </div>
        <div>
          <b>ที่อยู่ผู้ส่ง:</b>
          <textarea :disabled="billingInfo" v-model="sender_address" />
        </div>

        <div>
          <b>ชื่อผู้รับ:</b>
          <input
            :disabled="receiverFNameEdit"
            ref="receiverFNameEdit"
            v-model="receiver_first_name"
          />
        </div>
        <div>
          <b>นามสกุลผู้รับ:</b>
          <input :disabled="receiverLNameEdit" ref="receiverLNameEdit" v-model="receiver_last_name" />
        </div>

        <div>
          <b>เบอร์โทรศัพท์ผู้รับ:</b>
          <input maxlength="10" :disabled="receiverPhoneEdit" ref="receiverPhoneEdit" v-model="phone" />
        </div>
        <div>
          <b>ที่อยู่ผู้รับ:</b>
          <input :disabled="receiverAddressEdit" ref="receiverAddressEdit" v-model="receiver_address" />
        </div>
        <div>
          <b>พิกัด:</b>
          <input :disabled="billingInfo" v-model="location" />
        </div>
        <div>
          <b>รหัสไปรษณีย์:</b>
          <input :disabled="billingInfo" v-model="br_zipcode" />
        </div>

        <div>
          <b>ประเภทการจัดส่ง:</b>
          <input :disabled="billingInfo" v-model="br_parcel_type" />
        </div>
      </div>
    </div>
    <table style="width: 100%;">
      <tbody>
        <tr>
          <td style="width: 30%;" rowspan="3"></td>
          <td style="width: 15%;">Tools ที่ใช้:</td>
          <td style="width: 25%;">
            <select style="margin-left: 0px; margin-right: 0px;" class="select" v-model="selectValue" v-on:change="selectTools">
              <option value="0" disabled="disabled" selected="selected">----- เลือก Tools -----</option>
              <option value="1">ยกเลิก Tracking</option>
              <!-- <option value="2">เปลี่ยนแปลงข้อมูลผู้รับ</option> -->
            </select>
          </td>
          <td style="width: 25%;" rowspan="3"></td>
        </tr>
        <tr>
          <td style="width: 15%;">เหตุผล:</td>
          <td style="width: 25%;">
            <select style="margin-left: 0px; margin-right: 0px;" class="select" v-model="reasonValue">
              <option value disabled="disabled" selected="selected">----- เลือกเหตุผล -----</option>
              <option value="wrong_size">เลือก size พัสดุผิด</option>
              <option value="wrong_type">เลือกประเภทการจัดส่งผิด</option>
              <option value="wrong_codvalue">ยอด COD ผิด</option>
              <option value="wrong_member">ทำรายการผิด member</option>
              <option value="wrong_receiver_info">ข้อมูลผู้รับผิด</option>
            </select>
          </td>
        </tr>
        <tr>
          <td style="width: 15%;">รายละเอียดเพิ่มเติม:</td>
          <td style="width: 25%;">
            <textarea style="width: 306px;" v-model="remark"></textarea>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="group-btn">
      <button class="cancel" v-on:click="clearBtn">ยกเลิก</button>
      <button v-on:click="confirmSelectTools">บันทึก</button>
    </div>
  </div>
</template>
<script>
const axios = require("axios");

export default {
  data: function() {
    return {
      billingInfo: [],
      trackingInput: "",
      billing_no: "",
      tracking: "",
      bi_parcel_type: "",
      size_id: "",
      size_price: "",
      cod_value: "",
      bi_zipcode: "",
      sender_name: "",
      sender_phone: "",
      sender_address: "",
      previous_value: "",
      receiver_first_name: "",
      receiver_last_name: "",
      phone: "",
      receiver_address: "",
      location: "",
      br_zipcode: "",
      br_parcel_type: "",
      status: "",
      booking_status: 0,

      order_status: "",
      order_status_lb: "",
      send_booking: "",

      selectValue: "0",
      reasonValue: "",
      remark: "",
      imgUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC",
      rotation: 0,

      receiverFNameEdit: true,
      receiverLNameEdit: true,
      receiverPhoneEdit: true,
      receiverAddressEdit: true
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
  },
  methods: {
    getData() {
      this.emptyBox();
      const options = { okLabel: "ตกลง" };
      axios.get("/check/info/tracking?tracking=" + this.trackingInput.toUpperCase())
        .then(response => {
          if (response.data.status == "SUCCESS") {
            this.billingInfo = response.data.billingInfo;
            this.billing_no = this.billingInfo[0].billing_no ? this.billingInfo[0].billing_no : "";
            this.tracking = this.billingInfo[0].tracking;
            this.bi_parcel_type = this.billingInfo[0].bi_parcel_type;
            this.size_id = this.billingInfo[0].alias_size ? this.billingInfo[0].alias_size.toUpperCase() : "";
            this.size_price = this.billingInfo[0].size_price;
            this.cod_value = this.billingInfo[0].cod_value;
            this.bi_zipcode = this.billingInfo[0].bi_zipcode;
            this.sender_name = this.billingInfo[0].sender_name;
            this.sender_phone = this.billingInfo[0].sender_phone;
            this.sender_address = this.billingInfo[0].sender_address;

            var receiver_name = this.billingInfo[0].receiver_name;
            var res = receiver_name ? receiver_name.split(" ") : null;
            this.receiver_first_name = res !== null ? res[0] : "";
            this.receiver_last_name = res !== null ? res[1] : "";

            this.phone = this.billingInfo[0].phone;
            this.receiver_address = this.billingInfo[0].receiver_address;

            this.previous_value = this.billingInfo;

            this.location = this.billingInfo[0].district_name + " " + this.billingInfo[0].amphur_name + " " + this.billingInfo[0].province_name;
            this.br_zipcode = this.billingInfo[0].br_zipcode;
            this.br_parcel_type = this.billingInfo[0].br_parcel_type;

            this.status = this.billingInfo[0].status;
            if (this.status == "booked") {
              this.order_status_lb = "ข้อมูลได้ถูกส่งให้กับ บ. ขนส่งแล้ว";
            } else if (this.status == "SUCCESS") {
              this.order_status_lb = "ข้อมูลได้ส่งเข้า server หลักแล้ว";
            } else if (this.status == "ready") {
              this.order_status_lb = "ข้อมูลกำลังถูกส่งไปยัง บ. ขนส่ง";
            } else if (this.status == "cancel") {
              this.order_status_lb = "ข้อมูลถูกยกเลิกแล้ว";
            } else if (this.status == "success") {
              this.order_status_lb = "ข้อมูลกำลังถูกส่งข้อมูลไปที่ server หลัก";
            } else {
              this.order_status_lb = "";
            }

            this.imgCapture = response.data.imgCapture;

            if (this.imgCapture == false) {
              this.imgUrl =
                "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC";
            } else {
              this.imgUrl = this.imgCapture[0].image_url;
            }
          } else {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
            this.emptyBox();
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    emptyBox() {
      this.selectValue = "0";
      this.reasonValue = "";
      this.remark = "";
      this.billing_no = "";
      this.tracking = "";
      this.bi_parcel_type = "";
      this.size_id = "";
      this.size_price = "";
      this.cod_value = "";
      this.bi_zipcode = "";
      this.sender_name = "";
      this.sender_phone = "";
      this.sender_address = "";
      this.receiver_first_name = "";
      this.receiver_last_name = "";
      this.phone = "";
      this.receiver_address = "";
      this.previous_value = "";
      this.location = "";
      this.br_zipcode = "";
      this.br_parcel_type = "";
      this.status = "";
      this.order_status_lb = "";
      this.imgUrl =
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC";
    },
    selectTools() {
      const options = { okLabel: "ตกลง" };
      if (this.tracking == "") {
        this.emptyBox();
        this.$dialogs.alert("กรุณาระบุ Tracking เพื่อทำรายการ", options);
      } else {
        if (this.selectValue == 1) {
          this.receiverFNameEdit = true;
          this.receiverLNameEdit = true;
          this.receiverPhoneEdit = true;
          this.receiverAddressEdit = true;
        } else if (this.selectValue == 2) {
          this.receiverFNameEdit = false;
          this.receiverLNameEdit = false;
          this.receiverPhoneEdit = false;
          this.receiverAddressEdit = false;
        } else {
          this.receiverFNameEdit = true;
          this.receiverLNameEdit = true;
          this.receiverPhoneEdit = true;
          this.receiverAddressEdit = true;
        }
      }
    },
    confirmSelectTools() {
      const options = { okLabel: "ตกลง" };
      if (this.selectValue == "0") {
        this.$dialogs.alert("กรุณาเลือก Tools เพื่อทำรายการ", options);
      } else if (this.tracking == "") {
        this.emptyBox();
        this.$dialogs.alert("กรุณาระบุ Tracking เพื่อทำรายการ", options);
      } else if (this.billing_no == "") {
        this.$dialogs.alert("ไม่สามารถยกเลิกได้ เนื่องจากทางร้านยังไม่ได้ทำรายการ", options);
      } else if (this.reasonValue == "") {
        this.$dialogs.alert("กรุณาระบุ เหตุผล", options);
      } else if (this.remark.trim() == "") {
        this.$dialogs.alert("กรุณากรอกรายละเอียดเพิ่มเติม ให้ถูกต้อง", options);
      } else if (this.remark.length < 25) {
        this.$dialogs.alert("กรุณากรอกรายละเอียดเพิ่มเติม ให้ชัดเจน", options);
      } else if (this.status == "cancel") {
        this.$dialogs.alert("รายการนี้ได้ถูกยกเลิกไปแล้ว", options);
      } else if (this.status == "success") {
        this.$dialogs.alert("รายการนี้กำลังถูกส่งข้อมูลไปยัง server หลัก กรุณารอ 2-3 นาที", options);
      } else {
        if (this.selectValue == 1) {
          var data = {
            tracking: this.tracking,
            billing_no: this.billing_no,
            previous_value: this.previous_value,
            reason: this.reasonValue,
            remark: this.remark,
            user: this.$session.get("session_username")
          };
          axios
            .post("/save/cancel/tracking", data)
            .then(response => {
              if (response.data.status == "SUCCESS") {
                this.$dialogs.alert("ยกเลิกเรียบร้อยแล้ว", options);
                this.$router.push("/");
              } else {
                this.$dialogs.alert(
                  "ไม่สามารถ ยกเลิกรายการนี้ได้เนื่องจาก " +
                    response.data.reason,
                  options
                );
                this.$router.push("/");
              }
            })
            .catch(function(error) {
              console.log(error);
            });
        } else if (this.selectValue == 2) {
          var phone = this.phone;
          if (this.receiver_first_name == "") {
            this.$dialogs.alert("กรุณากรอก ชื่อผู้รับ ให้ถูกต้อง", options);
          } else if (this.receiver_last_name == "") {
            this.$dialogs.alert("กรุณากรอก นามสกุลผู้รับ ให้ถูกต้อง", options);
          } else if (
            phone[0] + phone[1] != "06" &&
            phone[0] + phone[1] != "08" &&
            phone[0] + phone[1] != "09"
          ) {
            this.$dialogs.alert(
              "กรุณากรอก เบอร์โทรศัทพ์ผู้รับ เท่านั้น",
              options
            );
          } else if (phone.length < 10) {
            this.$dialogs.alert("กรุณากรอก เบอร์โทรศัพท์ ให้ถูกต้อง", options);
          } else {
            var dataReceiver = {
              tracking: this.tracking,
              billing_no: this.billing_no,
              previous_value: this.previous_value,
              current_value: {
                first_name: this.receiver_first_name,
                last_name: this.receiver_last_name,
                phone: this.phone,
                address: this.receiver_address
              },
              user: this.$session.get("session_username")
            };

            axios
              .post("/update/receiver/info", dataReceiver)
              .then(response => {
                if (response.data.status == "SUCCESS") {
                  this.$dialogs.alert(
                    "แก้ไขข้อมูลผู้รับเรียบร้อยแล้ว",
                    options
                  );
                  this.$router.push("/");
                }
              })
              .catch(function(error) {
                console.log(error);
              });
          }
        }
      }
    },
    rotateRight() {
      this.rotation += 90;
    },
    rotateLeft() {
      this.rotation -= 90;
    },
    clearBtn() {
      window.location.reload();
    }
  }
};
</script>
<style lang="scss" >
.search,
.select-tool,
.select-reason,
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
.cancel {
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