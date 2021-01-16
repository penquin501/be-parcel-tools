<template>
  <div class="container" style="margin-top: 60px;">
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
          <input :disabled="codeValueEdit" v-model="cod_value" />
        </div>
        <div>
          <b>ขนาดพัสดุ:</b>
          <input :disabled="billingInfo" v-model="alias_size" />
        </div>
        <div>
          <b>ราคาพัสดุ:</b>
          <input :disabled="billingInfo" v-model="size_price" />
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
          <input
            maxlength="10"
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
            :disabled="receriverZipcodeEdit"
            v-model="displayAddress"
            class="input"
            placeholder="รหัสไปรษณีย์"
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
    <table style="width: 100%;">
      <tbody>
        <tr>
          <td style="width: 30%;" rowspan="4"></td>
          <td style="width: 15%;">ระบุสาเหตุ:</td>
          <div class="radio-inline">
            <td
              v-for="(item) in listSelectedType"
              v-on:change="selectCause(item.value)"
              v-bind:key="item.id"
            >
              <label>
                <input type="radio" :value="item.value" v-model="causeType" />
                {{ item.name }}
              </label>
            </td>
          </div>

          <td style="width: 25%;" rowspan="4"></td>
        </tr>
        <tr>
          <td style="width: 15%;">ระบุเลขจัดส่งใหม่:</td>
          <td style="width: 25%;" class="newTracking">
            <input
              maxlength="13"
              v-model="newTrackingInput"
              v-on:keypress="engOnly"
              autocomplete="false"
              disabled
            />
          </td>
        </tr>
        <!-- <tr>
            <td style="width: 15%;">Tools ที่ใช้:</td>
            <td style="width: 25%;">
                <select style="margin-left: 0px; margin-right: 0px;" class="select" v-model="selectValue" v-on:change="selectTools">
                    <option value="0" disabled="disabled" selected="selected">----- เลือก Tools -----</option>
                    <option value="1">ยกเลิก Tracking</option>
                    <option value="2">เปลี่ยนแปลงข้อมูลผู้รับ</option>
                </select>
            </td>
        </tr>-->
        <tr>
          <td style="width: 15%;">เหตุผล:</td>
          <td style="width: 25%;">
            <select
              style="margin-left: 0px; margin-right: 0px;"
              class="select"
              v-model="reasonValue"
            >
              <option value disabled="disabled" selected="selected">----- เลือกเหตุผล -----</option>
              <option value="change_cod_to_normal">เปลี่ยนประเภท COD เป็น NORMAL</option>
              <option value="change_normal_to_cod">เปลี่ยนประเภท NORMAL เป็น COD</option>
              <option value="change_codvalue">เปลี่ยนมูลค่า COD</option>
              <option value="change_address">เปลี่ยนที่อยู่</option>
              <option value="close_status_early_due">ปิดสถานะก่อนกำหนด</option>
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
      <button class="cancel" v-on:click="emptyBox">ยกเลิก</button>
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
      branch_id: "",
      tracking: "",
      bi_parcel_type: "",
      size_id: "",
      alias_size: "",
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
      displayAddress: "",
      district_code: "",

      order_status: "",
      order_status_lb: "",
      send_booking: "",
      causeType: 0,
      reasonValue: "",
      remark: "",
      imgUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC",
      rotation: 0,

      receiverFNameEdit: true,
      receiverLNameEdit: true,
      receiverPhoneEdit: true,
      receiverAddressEdit: true,
      receriverZipcodeEdit: true,
      codeValueEdit: true,

      boxSize: [],
      listZipcode: [],

      zipcode: "",
      openZipcode: false,
      dataZipcode: [],
      trackingIn: "",
      keyAddress: {},
      resultDuplicatedTracking: "",

      radio_parcel_type: "",
      newTrackingInput: "",
      listSelectedType: [
        { code: "01", name: "945 เป็นฝ่ายผิด", value: 1 },
        { code: "02", name: "ลูกค้า/shop เป็นฝ่ายผิด", value: 2 }
      ],
      url: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
  },
  methods: {
    getData() {
      const options = { okLabel: "ตกลง" };
      if (this.trackingInput == "") {
        this.$dialogs.alert("กรุณาใส่เลข Tracking ให้ถูกต้อง", options);
      } else {
        axios
          .get(
            this.url +
              "/check/info/tracking?tracking=" +
              this.trackingInput.toUpperCase()
          )
          .then(response => {
            if (response.data.status == "SUCCESS") {
              var responseData = response.data.billingInfo;
              this.billingInfo = responseData[0];

              this.billing_no = this.billingInfo.billing_no;
              this.branch_id = this.billingInfo.branch_id;
              this.tracking = this.billingInfo.tracking;
              this.bi_parcel_type = this.billingInfo.bi_parcel_type.toUpperCase();
              this.district_code = this.billingInfo.DISTRICT_CODE;
              this.size_id = this.billingInfo.size_id;
              this.alias_size = this.billingInfo.alias_size.toUpperCase();
              this.size_price = this.billingInfo.size_price;
              this.cod_value = this.billingInfo.cod_value;
              this.bi_zipcode = this.billingInfo.bi_zipcode;
              this.sender_name = this.billingInfo.sender_name;
              this.sender_phone = this.billingInfo.sender_phone;
              this.sender_address = this.billingInfo.sender_address;
              var receiver_name = this.billingInfo.receiver_name;
              var res = receiver_name.split(" ");
              this.receiver_first_name = res[0];
              this.receiver_last_name = res[1];
              this.phone = this.billingInfo.phone;
              this.receiver_address = this.billingInfo.receiver_address;

              this.location =
                this.billingInfo.district_name +
                " " +
                this.billingInfo.amphur_name +
                " " +
                this.billingInfo.province_name;
              this.br_zipcode = this.billingInfo.br_zipcode;
              this.displayAddress = this.br_zipcode + " " + this.location;
              this.parcelAddressList(this.br_zipcode);

              this.br_parcel_type = this.billingInfo.br_parcel_type;

              this.status = this.billingInfo.status;
              if (this.status == "booked") {
                this.order_status_lb = "ข้อมูลได้ถูกส่งให้กับ บ. ขนส่งแล้ว";
              } else if (this.status == "SUCCESS") {
                this.order_status_lb = "ข้อมูลได้ส่งเข้า server หลักแล้ว";
              } else if (this.status == "ready") {
                this.order_status_lb = "ข้อมูลกำลังถูกส่งไปยัง บ. ขนส่ง";
              } else if (this.status == "cancel") {
                this.order_status_lb = "ข้อมูลถูกยกเลิกแล้ว";
              } else if (this.status == "success") {
                this.order_status_lb =
                  "ข้อมูลกำลังถูกส่งข้อมูลไปที่ server หลัก";
              } else if (this.status == "relabel") {
                this.order_status_lb = "ข้อมูลถูกย้ายไปที่ tracking ใหม่แล้ว";
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
              this.getNewTracking();

              this.codeValueEdit = false;
              this.receiverFNameEdit = false;
              this.receiverLNameEdit = false;
              this.receiverPhoneEdit = false;
              this.receiverAddressEdit = false;
              this.receriverZipcodeEdit = false;
            } else {
              this.$dialogs.alert("ไม่พบข้อมูล", options);
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    parcelAddressList(zipcode) {
      axios
        .get(
          "https://pos.945.report/billingPos/checkZipcode/?zipcode=" + zipcode
        )
        .then(resultsZipCode => {
          this.listZipcode = resultsZipCode.data;
          this.listZipcode.forEach(item => {
            if (item.DISTRICT_CODE == this.billingInfo.DISTRICT_CODE) {
              this.keyAddress = item;
            }
          });
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
    btnOpenZipcode() {
      this.displayAddress = "";
      this.openZipcode = true;
    },
    engOnly($event) {
      var englishAlphabetAndWhiteSpace = /[A-Za-z | 0-9]/g;
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
    },
    selectItem(item) {
      this.keyAddress = item;
      this.displayAddress = item.zipcode + " " + item.DISTRICT_NAME + "  " + item.AMPHUR_NAME + "  " + item.PROVINCE_NAME;
      this.openZipcode = false;
      this.bi_zipcode = item.zipcode;
      this.br_zipcode = item.zipcode;
      this.district_code = item.DISTRICT_CODE;
      this.selectSize();
    },
    selectSize() {
      var dataSize = {
        zipcode: this.br_zipcode,
        size_name: this.alias_size,
        // zone: (this.branch_id !== 50 && this.branch_id !== 70)?2:1
        zone: 2
      };
      axios.post(this.url + "/parcelPrice", dataSize)
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
    emptyBox() {
      this.trackingInput = "";
      this.imgUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC";

      this.billing_no = "";
      this.tracking = "";
      this.bi_parcel_type = "";
      this.size_id = "";
      this.alias_size = "";
      this.size_price = "";
      this.cod_value = "";
      this.bi_zipcode = "";
      this.status = "";
      this.order_status_lb = "";

      this.sender_name = "";
      this.sender_phone = "";
      this.sender_address = "";
      this.receiver_first_name = "";
      this.receiver_last_name = "";
      this.phone = "";
      this.receiver_address = "";
      this.previous_value = "";
      this.location = "";
      this.displayAddress = "";
      this.br_zipcode = "";
      this.br_parcel_type = "";

      this.causeType = 0;
      this.newTrackingInput = "";
      this.reasonValue = "";
      this.remark = "";

      this.receiverFNameEdit = true;
      this.receiverLNameEdit = true;
      this.receiverPhoneEdit = true;
      this.receiverAddressEdit = true;
      this.receriverZipcodeEdit = true;
      this.codeValueEdit = true;
    },
    selectType(parcel_type) {
      if (parcel_type == "NORMAL") {
        this.cod_value = 0;
      }
      this.bi_parcel_type = parcel_type;
      this.br_parcel_type = parcel_type;
    },
    selectCause(causeType) {
      this.causeType = causeType;
    },
    getNewTracking() {
      axios.get(this.url + "/get-new-tracking").then(response => {
        this.newTrackingInput = response.data.toUpperCase();
      });
    },
    confirmSelectTools() {
      const options = { okLabel: "ตกลง" };

      var regTracking = /^[T|t][D|d][Z|z]+[0-9]{8}[A-Z]?$/i;
      var phone = this.phone;
      this.resultDuplicatedTracking = "";

      if (this.tracking == "") {
        this.emptyBox();
        this.$dialogs.alert("กรุณาระบุ Tracking เพื่อทำรายการ", options);
      } else if (this.billing_no == "") {
        this.$dialogs.alert("ไม่สามารถยกเลิกได้ เนื่องจากทางร้านยังไม่ได้ทำรายการ", options);
      } else if (
        this.receiver_first_name == "" ||
        this.receiver_first_name == undefined
      ) {
        this.$dialogs.alert("กรุณาใส่ชื่อผู้รับให้ถูกต้อง", options);
      } else if (
        this.receiver_last_name == "" ||
        this.receiver_last_name == undefined
      ) {
        this.$dialogs.alert("กรุณาใส่นามสกุลผู้รับให้ถูกต้อง", options);
      } else if (this.reasonValue == "") {
        this.$dialogs.alert("กรุณาระบุ เหตุผล", options);
      } else if (this.remark.trim() == "") {
        this.$dialogs.alert("กรุณากรอกรายละเอียดเพิ่มเติม ให้ถูกต้อง", options);
      } else if (this.remark.length < 25) {
        this.$dialogs.alert("กรุณากรอกรายละเอียดเพิ่มเติม ให้ชัดเจน", options);
      } else if (this.causeType == 0) {
        this.$dialogs.alert("กรุณาระบุสาเหตุ ให้ถูกต้อง", options);
      } else if (this.newTrackingInput == "") {
        this.$dialogs.alert("กรุณาใส่เลขที่จัดส่งใหม่ให้ถูกต้อง", options);
      } else if (this.tracking == this.newTrackingInput) {
        this.$dialogs.alert("กรุณาใส่เลขที่จัดส่งใหม่ให้ถูกต้อง", options);
      } else if (this.newTrackingInput.match(regTracking) === null) {
        this.$dialogs.alert("กรุณาใส่เลขที่จัดส่งใหม่ให้ถูกต้อง", options);
      } else if (this.status == "cancel") {
        this.$dialogs.alert("รายการนี้ได้ถูกยกเลิกไปแล้ว", options);
      } else if (this.status == "relabel") {
        this.$dialogs.alert("ไม่สามารถเปลี่ยนเลขนี้ได้ เนื่องจากเลขนี้ได้ถูกเปลี่ยนเลขไปแล้ว", options);
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
        this.$dialogs.alert("กรุณากรอก รหัสไปรษณีย์ผู้รับ ให้ตรงกับหน้ากล่องผู้รับ", options);
      } else if (this.bi_parcel_type != this.br_parcel_type) {
        this.$dialogs.alert("กรุณากรอก ประเภทการจัดส่ง ให้ตรงกับหน้ากล่องผู้รับ", options);
      } else if (this.bi_parcel_type == "COD" && (this.cod_value == "" || this.cod_value == 0)) {
        this.$dialogs.alert("กรุณากรอก ค่าเก็บเงินปลายทาง ให้ถูกต้อง", options);
      } else if (this.bi_parcel_type == "NORMAL" && this.cod_value !== 0) {
        this.$dialogs.alert("กรุณากรอก ค่าเก็บเงินปลายทาง ให้ถูกต้อง", options);
      } else {
        axios.get(this.url + "/check-available-tracking?tracking=" + this.newTrackingInput.toUpperCase())
          .then(response => {
            this.resultDuplicatedTracking = response.data;

            if (!this.resultDuplicatedTracking) {
              this.getNewTracking();
            } else {
              var moduleName = "relabeling_tracking";

              var dataConfirm = {
                billingNo: this.billing_no,
                billingInfo: this.billingInfo,
                billingStatus: this.status,
                currentValue: {
                  billingItem: {
                    tracking: this.newTrackingInput.toUpperCase(),
                    parcelType: this.bi_parcel_type.toUpperCase(),
                    codValue: this.cod_value,
                    sizeId: this.size_id,
                    sizePrice: this.causeType == 1 ? 0 : this.size_price
                  },
                  receiverInfo: {
                    receiverName: this.receiver_first_name + " " + this.receiver_last_name,
                    phone: this.phone,
                    receiverAddress: this.receiver_address,
                    keyAddress: this.keyAddress
                  }
                },
                causeType: this.causeType,
                reason: this.reasonValue,
                remark: this.remark,
                user: this.$session.get("session_username"),
                moduleName: moduleName
              };

              axios.post(this.url + "/tools/relabel-tracking", dataConfirm)
                .then(response => {
                  if (response.data.status == "SUCCESS") {
                    let billingNo = response.data.billingNo;
                    const optionsDialog = {
                      title: "รายการที่คุณเลือกได้ relabel แล้ว",
                      okLabel: "ตกลง" 
                    };
                    this.$dialogs.alert("เลขที่บิลใหม่..." + billingNo, optionsDialog).then(res => {
                        // console.log(res) // {ok: true|false|undefined}
                        if (res) {
                          this.$router.push("/");
                        } else {
                          this.$router.push("/");
                        }
                      });
                  } else {
                    this.$dialogs.alert("ไม่สามารถ relabel tracking ได้ เนื่องจาก..." + response.data.reason, options);
                    this.$router.push("/");
                  }
                })
                .catch(function(error) {
                  console.log(error);
                });
            }
          });
      }
    },
    rotateRight() {
      this.rotation += 90;
    },
    rotateLeft() {
      this.rotation -= 90;
    }
  }
};
</script>

<style lang="scss" scoped>
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
.radio-inline {
  flex: 1 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.newTracking {
  input {
    margin: 10px 5px 10px 5px;
    background: none;
    border: none;
    border-bottom: 1px solid #000;
    outline: none;
    width: 200px;
    text-align: center;
    text-transform: uppercase;
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