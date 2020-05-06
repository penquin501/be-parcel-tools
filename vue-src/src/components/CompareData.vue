<template>
  <div style="margin-top: 60px;">
    <!-- <section v-if="menu == 1" class="table">  -->
    <div class="mycontent">
      <div class="left">
        <div class="item2">
          <div>
            <b>Tracking:</b>
            <input style="width: 95%;" :disabled="billingInfo" v-model="tracking" />
          </div>
          <v-zoomer class="v-zoomer">
            <img
              :src="imgUrl"
              style="object-fit: contain; width: 100%; height: 100%; "
              :style="`transform: rotate(${rotation}deg);`"
            />
          </v-zoomer>
          <div class="btnOption">
            <button v-on:click="rotateLeft">
              <img style="width: 20px" src="../assets/left.png" />
            </button>
            &nbsp;
            <button v-on:click="rotateRight">
              <img style="width: 20px" src="../assets/right.png" />
            </button>
          </div>
        </div>
      </div>
      <div class="center">
        <div>
          <b>เลขที่บิล :</b>
          <input :disabled="billingInfo" v-model="billing_no" />
        </div>
        <div>
          <b>ประเภทการจัดส่ง:</b>
          <input :disabled="billingInfo" v-model="bi_parcel_type" />
          <br />
          <div style="display: grid ; grid-template-columns: .5fr 1fr .5fr 1fr">
            <input
              style="margin-top: 5%"
              v-model="radio_parcel_type"
              type="radio"
              v-on:change="selectType('COD')"
              value="COD"
            />COD
            <input
              style="margin-top: 5%"
              v-model="radio_parcel_type"
              type="radio"
              v-on:change="selectType('NORMAL')"
              value="NORMAL"
            />NORMAL
          </div>
        </div>
        <div>
          <b>มูลค่า COD:</b>
          <input
            :disabled="codValueEdit"
            ref="codValueEdit"
            v-model="cod_value"
            maxlength="5"
            v-on:keypress="onlyNumber"
          />
        </div>
        <div>
          <b>รหัสไปรษณีย์:</b>
          <input :disabled="billingInfo" v-model="bi_zipcode" />
        </div>
        <div>
          <b>ขนาดพัสดุ:</b>
          <input :disabled="billingInfo" v-model="alias_size" />
        </div>

        <div>
          <b>ราคาพัสดุ:</b>
          <input :disabled="billingInfo" v-model="size_price" />
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
            v-on:keypress="inputCheckName"
            maxlength="100"
          />
        </div>
        <div>
          <b>นามสกุลผู้รับ:</b>
          <input
            :disabled="receiverLNameEdit"
            ref="receiverLNameEdit"
            v-model="receiver_last_name"
            v-on:keypress="inputCheckName"
            maxlength="100"
          />
        </div>

        <div>
          <b>เบอร์โทรศัทพ์ผู้รับ:</b>
          <input
            maxlength="10"
            v-on:keypress="onlyNumber"
            :disabled="receiverPhoneEdit"
            ref="receiverPhoneEdit"
            v-model="phone"
          />
        </div>
        <div>
          <b>ที่อยู่ผู้รับ:</b>
          <input
            :disabled="receiverAddressEdit"
            ref="receiverAddressEdit"
            v-model="receiver_address"
          />
        </div>
        <div>
          <b>รหัสไปรษณีย์:</b>
          <input
            v-model="displayAddress"
            class="input"
            placeholder="รหัสไปรษย์"
            v-on:focus="btnOpenZipcode"
            v-on:keyup="getNewZipcode"
            ref="receriverZipcodeEdit"
          />
          <div class="dropdownZipcode" v-if="this.openZipcode == true">
            <ol v-for="(item, index) in listZipcode" :key="item.id" v-on:click="selectItem(item)">
              <li>{{listZipcode[index].zipcode}} {{listZipcode[index].DISTRICT_NAME}} {{listZipcode[index].AMPHUR_NAME}} {{listZipcode[index].PROVINCE_NAME}}</li>
            </ol>
          </div>
        </div>

        <div>
          <b>ประเภทการจัดส่ง:</b>
          <input :disabled="billingInfo" v-model="br_parcel_type" />
        </div>
      </div>
    </div>
    <div class="group-btn">
      <button v-on:click="confirmData">แก้ไขข้อมูล</button>
    </div>
    <!-- </section> -->
  </div>
</template>

<script>
const axios = require("axios");

export default {

  data: function() {
    return {
      imgUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC",
      rotation: 0,
      menu: 1,
      tracking: "",
      billingInfo: [],
      billing_no: "",
      bi_parcel_type: "",
      alias_size: "",
      size_id: "",
      size_price: "",
      cod_value: "",
      bi_zipcode: "",
      sender_name: "",
      sender_phone: "",
      sender_address: "",
      previous_value: {},
      receiver_first_name: "",
      receiver_last_name: "",
      phone: "",
      receiver_address: "",
      location: "",
      br_zipcode: "",
      br_parcel_type: "",
      displayAddress: "",
      district_code: "",

      order_status: "",
      order_status_lb: "",
      send_booking: "",

      selectValue: "",
      codValueEdit: false,
      receiverFNameEdit: false,
      receiverLNameEdit: false,
      receiverPhoneEdit: false,
      receiverAddressEdit: false,
      receriverZipcodeEdit: false,

      boxSize: [],
      listZipcode: [],

      zipcode: "",
      openZipcode: false,
      dataZipcode: [],
      trackingIn: "",

      radio_parcel_type: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    var branch_id = this.$route.params.branch_id;
    this.selectTrackingToCheck(branch_id);
  },
  methods: {
    selectTrackingToCheck(branch_id) {
      const options = { okLabel: "ตกลง" };
      var resTracking;
      if (branch_id == "") {
        this.$dialogs.alert(
          "กรุณาเลือกสาขาที่ต้องการตรวจสอบให้ถูกต้อง",
          options
        );
      } else {
        axios
          .get(
            "/select/tracking/check?branch_id=" + branch_id
          )
          .then(response => {
            if (
              response.data.status == "SUCCESS" &&
              response.data.tracking !== false
            ) {
              resTracking = response.data.tracking[0].tracking;
              this.getData(resTracking);
            }
          });
      }
    },
    getData(trackingIn) {
      this.trackingIn = trackingIn;

      axios
        .get(
          "/check/info/tracking?tracking=" + this.trackingIn.toUpperCase()
        )
        .then(response => {
          if (response.data.status == "SUCCESS") {
            // console.log(response.data.billingInfo);
            this.billingInfo = response.data.billingInfo;
            this.billing_no = this.billingInfo[0].billing_no;
            this.tracking = this.billingInfo[0].tracking;
            this.bi_parcel_type = this.billingInfo[0].bi_parcel_type;
            this.district_code = this.billingInfo[0].DISTRICT_CODE;
            this.size_id = this.billingInfo[0].size_id;
            this.alias_size = this.billingInfo[0].alias_size.toUpperCase();
            this.size_price = this.billingInfo[0].size_price;
            this.cod_value = this.billingInfo[0].cod_value;
            this.bi_zipcode = this.billingInfo[0].bi_zipcode;
            this.sender_name = this.billingInfo[0].sender_name;
            this.sender_phone = this.billingInfo[0].sender_phone;
            this.sender_address = this.billingInfo[0].sender_address;

            var receiver_name = this.billingInfo[0].receiver_name;
            var res = receiver_name.split(" ");
            this.receiver_first_name = res[0];
            this.receiver_last_name = res[1];

            this.phone = this.billingInfo[0].phone;
            this.receiver_address = this.billingInfo[0].receiver_address;

            this.location =
              this.billingInfo[0].district_name +
              " " +
              this.billingInfo[0].amphur_name +
              " " +
              this.billingInfo[0].province_name;

            this.br_zipcode = this.billingInfo[0].br_zipcode;

            this.displayAddress = this.br_zipcode + " " + this.location;
            this.parcelAddressList(this.br_zipcode);

            this.br_parcel_type = this.billingInfo[0].br_parcel_type;

            this.imgCapture = response.data.imgCapture;

            if (this.imgCapture == false) {
              this.imgUrl =
                "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC";
            } else {
              this.imgUrl = this.imgCapture[0].image_url;
            }

            this.previous_value = response.data.billingInfo[0];
          } else {
            alert("ไม่พบข้อมุล");
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    onlyNumber($event) {
      let keyCode = $event.keyCode ? $event.keyCode : $event.which;
      if (keyCode < 48 || keyCode > 57) {
        // 46 is dot
        $event.preventDefault();
      }
    },
    inputCheckName($event) {
      var englishAlphabetAndWhiteSpace = /[a-zA-Z0-9กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุูเแโใไๅๆ็่้๊๋์]/;
      var key = String.fromCharCode(event.which);
      var ew = event.which;
      if (ew == 32) return true;
      if (48 <= ew && ew <= 57) return true;
      if (65 <= ew && ew <= 90) return true;
      if (97 <= ew && ew <= 122) return true;
      if (englishAlphabetAndWhiteSpace.test(key)) return true;
      $event.preventDefault();
    },
    parcelAddressList(zipcode) {
      axios
        .get(
          "https://pos.945.report/billingPos/checkZipcode/?zipcode=" + zipcode
        )
        .then(resultsZipCode => {
          this.listZipcode = resultsZipCode.data;
        })
        .catch(error => {
          console.log(error);
        });
    },

    getNewZipcode() {
      if (this.displayAddress.length > 2 && this.displayAddress.length < 6) {
        axios
          .get(
            "https://pos.945.report/billingPos/checkZipcode/?zipcode=" +
              this.displayAddress
          )
          .then(resultsZipCode => {
            this.listZipcode = resultsZipCode.data;
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    selectType(parcel_type) {
      this.bi_parcel_type = parcel_type;
      this.br_parcel_type = parcel_type;
    },
    selectSize() {
      var dataSize = {
        zipcode: this.br_zipcode,
        size_name: this.alias_size
      };
      axios
        .post("https://pos.945.report/genBillNo/parcelPrice", dataSize)
        .then(response => {
          let parcelSizeSelect = response.data;
          if (response.data != undefined) {
            this.size_price = parcelSizeSelect[0].parcel_price;
            this.size_id = parcelSizeSelect[0].size_id;
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    confirmData() {
      const options = { okLabel: "ตกลง" };
      if (this.bi_parcel_type == "COD" && this.cod_value >= 10000) {
        this.$dialogs.alert(
          "กรุณาแน่ใจว่า ค่าเก็บเงินปลายทางเกิน 10000 หรือไม่",
          options
        );
      }
      var phone = this.phone;
      var receiver_last_name;
      if (this.receiver_first_name == "") {
        this.$dialogs.alert("กรุณากรอก ชื่อผู้รับ ให้ถูกต้อง", options);
      } else if (
        phone[0] + phone[1] != "06" &&
        phone[0] + phone[1] != "08" &&
        phone[0] + phone[1] != "09"
      ) {
        this.$dialogs.alert("กรุณากรอก เบอร์โทรศัทพ์ผู้รับ เท่านั้น", options);
      } else if (phone.length < 10) {
        this.$dialogs.alert("กรุณากรอก เบอร์โทรศัพท์ ให้ถูกต้อง", options);
      } else if (this.br_zipcode == "") {
        this.$dialogs.alert("กรุณากรอก รหัสไปรษณีย์ผู้รับให้ถูกต้อง", options);
      } else if (this.br_zipcode != this.bi_zipcode) {
        this.$dialogs.alert(
          "กรุณากรอก รหัสไปรษณีย์ผู้รับ ให้ตรงกับหน้ากล่องผู้รับ",
          options
        );
      } else if (this.bi_parcel_type != this.br_parcel_type) {
        this.$dialogs.alert(
          "กรุณากรอก ประเภทการจัดส่ง ให้ตรงกับหน้ากล่องผู้รับ",
          options
        );
      } else if (
        this.bi_parcel_type == "COD" &&
        (this.cod_value == "" || this.cod_value == 0)
      ) {
        this.$dialogs.alert("กรุณากรอก ค่าเก็บเงินปลายทาง ให้ถูกต้อง", options);
      } else if (this.bi_parcel_type == "NORMAL" && this.cod_value > 0) {
        this.$dialogs.alert("กรุณากรอก ค่าเก็บเงินปลายทาง ให้ถูกต้อง", options);
      } else {
        if (
          this.receiver_last_name == "" ||
          this.receiver_last_name == undefined
        ) {
          receiver_last_name = "";
        } else {
          receiver_last_name = this.receiver_last_name;
        }

        var dataConfirm = {
          tracking: this.tracking,
          billing_no: this.billing_no,
          previous_value: this.previous_value,
          current_value: {
            parcel_type: this.bi_parcel_type,
            cod_value: this.cod_value,
            size_id: this.size_id,
            size_price: this.size_price,

            first_name: this.receiver_first_name,
            last_name: receiver_last_name,
            phone: this.phone,
            address: this.receiver_address,
            district_code: this.district_code,
            br_zipcode: this.br_zipcode
          },
          user: this.$session.get("session_username")
        };

        axios
          .post("/confirm/match/data/info", dataConfirm)
          .then(response => {
            if (response.data.status == "SUCCESS") {
              this.$dialogs.alert("แก้ไขข้อมูลผู้รับเรียบร้อยแล้ว", options);
              this.$router.push("/listtracking");
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    rotateRight() {
      this.rotation += 90;
    },
    rotateLeft() {
      this.rotation -= 90;
    },

    btnOpenZipcode() {
      this.displayAddress = "";
      this.openZipcode = true;
    },
    selectItem(item) {
      this.displayAddress =
        item.zipcode +
        " " +
        item.DISTRICT_NAME +
        "  " +
        item.AMPHUR_NAME +
        "  " +
        item.PROVINCE_NAME;
      this.openZipcode = false;
      this.bi_zipcode = item.zipcode;
      this.br_zipcode = item.zipcode;
      this.district_code = item.DISTRICT_CODE;
      this.selectSize();
    }
  }
};
</script>

<style lang="scss" scoped>
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
  textarea:enabled {
    color: #9e9e9e;
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
      border-radius: 5px;
      padding: 10px;
      color: #fff;
      margin: 5px 5px 0 5px;
    }
  }
}

.selectType,
.selectSize,
.selectZipcode {
  width: 100%;
  outline: none;
  font-size: 16px;
  font-weight: bold;
}

.dropdownZipcode {
  border: 1px solid #000;
  font-size: 12px;
  padding: 0;
  margin-top: -0.9%;
  width: 26%;
  background-color: #fff;
  position: absolute;
  z-index: 100;
  ol {
    padding: 0;
    margin: 5px 0;
    li {
      padding: 5px 15px;
      list-style: none;
      cursor: pointer;
      &:hover {
        background-color: #eee;
      }
    }
  }
}
.warn {
  padding: 5px 20px;
  background-color: #fff;
  border: 2px solid #ff8c00 !important;
  cursor: pointer;
  color: #ff8c00 !important;
  font-weight: bold;
  outline: none;
  transition: 0.5s;
  &:hover {
    background-color: #ff8c00 !important;
    color: #fff !important;
  }
}
</style>