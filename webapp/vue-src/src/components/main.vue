<template>
  <div>
    <div class="search">
      <label>กรุณาใส่เลข Tracking:</label>
      <input maxlength="13" v-model="trackingInput" autocomplete="false" />
      <button v-on:click="getData">Search</button>
    </div>
    <div class="content">
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
            <button v-on:click="rotateLeft">
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
          <b>Size:</b>
          <input :disabled="billingInfo" v-model="size_id" />
        </div>

        <div>
          <b>Size Price:</b>
          <input :disabled="billingInfo" v-model="size_price" />
        </div>

        <div>
          <b>COD Value:</b>
          <input :disabled="billingInfo" v-model="cod_value" />
        </div>
        <div>
          <b>Parcel Type:</b>
          <input :disabled="billingInfo" v-model="bi_parcel_type" />
        </div>
        <div>
          <b>Zipcode:</b>
          <input :disabled="billingInfo" v-model="bi_zipcode" />
        </div>
        <div>
          <b>สถานะ:</b>
          <input :disabled="billingInfo" v-model="order_status_lb" />
        </div>
      </div>
      <div class="right">
        <div>
          <b>Sender Name:</b>
          <input :disabled="billingInfo" v-model="sender_name" />
        </div>
        <div>
          <b>Sender Phone:</b>
          <input :disabled="billingInfo" v-model="sender_phone" />
        </div>
        <div>
          <b>Sender Address:</b>
          <textarea :disabled="billingInfo" v-model="sender_address" />
        </div>

        <div>
          <b>Receiver Name:</b>
          <input :disabled="billingInfo" v-model="receiver_name" />
        </div>

        <div>
          <b>Receiver Phone:</b>
          <input :disabled="receiverPhoneEdit" ref="receiverPhoneEdit" v-model="phone" />
        </div>
        <div>
          <b>Receiver Address:</b>
          <textarea :disabled="billingInfo" v-model="receiver_address" />
        </div>
        <div>
          <b>Zipcode:</b>
          <input :disabled="billingInfo" v-model="br_zipcode" />
        </div>

        <div>
          <b>Parcel Type:</b>
          <input :disabled="billingInfo" v-model="br_parcel_type" />
        </div>
      </div>
    </div>

    <div class="select-tool">
      <label>Tools ที่จะใช้:</label>
      <select class="select" v-model="selectValue" v-on:change="selectTools" >
      <!-- <select class="select" v-model="selectValue"> -->
        <option value disabled selected>-----เลือก Tools-----</option>
        <option value="1">ยกเลิก Tracking</option>
        <option value="2">เปลี่ยนแปลงเบอร์โทรศัพท์ผู้รับ</option>
        <!-- <option>3</option>
        <option>13</option>
        <option>14</option>-->
      </select>
    </div>
    <div class="group-btn">
      <button v-on:click="clearBtn">ยกเลิก</button>
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
      // trackingInput: "TDZ20211025",
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
      receiver_name: "",
      phone: "",
      receiver_address: "",
      br_zipcode: "",
      br_parcel_type: "",

      order_status: "",
      order_status_lb: "",
      send_booking: "",

      selectValue: "",
      imgUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC",
      rotation: 0,

      receiverPhoneEdit: true
    };
  },
  methods: {
    getData() {
      var meanStatus;
      axios
        .get(
          "https://tool.945parcel.com/check/info/tracking?tracking=" +
            this.trackingInput.toUpperCase()
        )
        .then(response => {
          // console.log(response.data);
          if (response.data.status == "SUCCESS") {
            this.billingInfo = response.data.billingInfo;
            this.billing_no = this.billingInfo[0].billing_no;
            this.tracking = this.billingInfo[0].tracking;
            this.bi_parcel_type = this.billingInfo[0].bi_parcel_type;
            this.size_id = this.billingInfo[0].alias_size.toUpperCase();
            this.size_price = this.billingInfo[0].size_price;
            this.cod_value = this.billingInfo[0].cod_value;
            this.bi_zipcode = this.billingInfo[0].bi_zipcode;
            this.sender_name = this.billingInfo[0].sender_name;
            this.sender_phone = this.billingInfo[0].sender_phone;
            this.sender_address = this.billingInfo[0].sender_address;
            this.receiver_name = this.billingInfo[0].receiver_name;
            this.phone = this.billingInfo[0].phone;
            this.receiver_address =
              this.billingInfo[0].receiver_address +
              " " +
              this.billingInfo[0].district_name +
              " " +
              this.billingInfo[0].amphur_name +
              " " +
              this.billingInfo[0].province_name;
            // this.district_name=this.billingInfo[0].district_name;
            // this.amphur_name=this.billingInfo[0].amphur_name;
            // this.province_name=this.billingInfo[0].province_name;
            this.br_zipcode = this.billingInfo[0].br_zipcode;
            this.br_parcel_type = this.billingInfo[0].br_parcel_type;

            this.dataParcel = response.data.statusParcel;
            if (this.dataParcel == false) {
              this.order_status = "";
              this.send_booking = "";
              this.order_status_lb = "";
            } else {
              this.order_status = this.dataParcel[0].orderstatus;
              this.send_booking = this.dataParcel[0].send_booking;

              if (this.order_status == "101") {
                meanStatus = "ยกเลิก";
              } else if(this.order_status == "102"){
                meanStatus = "ส่งแบบ เรียกเก็บเงินปลายทาง (COD)";
              } else if(this.order_status == "103"){
                meanStatus = "ส่งแบบ ธรรมดา (NORMAL)";
              } else if (this.order_status == "104") {
                meanStatus = "ถูกจัดส่ง";
              } else if (this.order_status == "105") {
                meanStatus = "ถึงปลายทาง";
              } else if (this.order_status == "106") {
                meanStatus = "ตีกลับ";
              } else {
                meanStatus = "ยังไม่ได้ส่งข้อมูลไปที่หน้าฟ้า";
              }
              this.order_status_lb = this.order_status+" - " + meanStatus;
            }
            this.imgCapture = response.data.imgCapture;

            if (this.imgCapture == false) {
              this.imgUrl =
                "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC";
            } else {
              this.imgUrl = this.imgCapture[0].image_url;
            }
          } else {
            alert("ไม่พบข้อมุล");
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    selectTools(){
      if (this.selectValue == 1) {
        this.receiverPhoneEdit = true;
      } else if (this.selectValue == 2) {
        this.receiverPhoneEdit = false;
      }
    },
    confirmSelectTools() {
      if(this.selectValue==""){
        alert(
          "กรุณาเลือก Tools เพื่อทำรายการ"
        );
      } else if(this.tracking==""){
        alert(
          "กรุณาระบุ Tracking เพื่อทำรายการ"
        );
      } else if (this.order_status == "101") {
        alert(
          "ไม่สามารถทำรายการ Tracking นี้ได้ เนื่องจาก Tracking นี้ ถูกยกเลิกไปแล้ว"
        );
      } else if (this.order_status == "104") {
        alert(
          "ไม่สามารถทำรายการ Tracking นี้ได้ เนื่องจาก Tracking นี้ ถูกจัดส่งไปแล้ว"
        );
      } else if (this.order_status == "105") {
        alert(
          "ไม่สามารถทำรายการ Tracking นี้ได้ เนื่องจาก Tracking นี้ ถึงปลายทางแล้ว"
        );
      } else if (this.order_status == "106") {
        alert(
          "ไม่สามารถทำรายการ Tracking นี้ได้ เนื่องจาก Tracking นี้ ถูกตีกลับ"
        );
      } else if (this.send_booking != null) {
        alert(
          "ไม่สามารถทำรายการ Tracking นี้ได้ เนื่องจาก Tracking นี้ ถูกส่งข้อมูลให้บ. ขนส่งไปแล้ว"
        );
      } else {
        if (this.selectValue == 1) {
          var data={
            tracking:this.tracking,
            billing_no:this.billing_no,
            previous_value:this.order_status,
            user:'1'
          }
          axios.post("https://tool.945parcel.com/save/cancel/tracking" ,data)
          .then(response => {
            if(response.data.status=='SUCCESS'){
              alert(
                "ยกเลิกเรียบร้อยแล้ว"
              );
              window.location.reload();
            }
          })
          .catch(function(error) {
            console.log(error);
          });
        } else if (this.selectValue == 2) {
          // this.receiverPhoneEdit = false;
          alert("เปลี่ยนแปลงเบอร์โทรศัพท์ของผู้รับ"+this.phone);
        } else {
          alert("hello2");
          window.location.reload();
        }

        // this.disableTracking = false;
      }
    },
    rotateRight() {
      this.rotation += 90;
    },
    rotateLeft() {
      this.rotation -= 90;
    },
    clearBtn(){
      window.location.reload();
    },
  }
};
</script>
<style lang="scss" scoped>
* {
  font-family: Arial, Helvetica, sans-serif;
}
.search,
.select-tool,
.group-btn {
  text-align: center;
  button {
    padding: 5px 20px;
    background-color: #fff;
    border: 2px solid #181a92;
    cursor: pointer;
    color: #181a92;
    font-weight: bold;
    margin: 20px 10px;
    outline: none;
    transition: 0.5s;
    &:hover {
      background-color: #181a92;
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
    border: 2px solid #181a92;
    cursor: pointer;
    color: #181a92;
    font-weight: bold;
    outline: none;
    transition: 0.5s;
    &:hover {
      background-color: #181a92;
      color: #fff;
    }
  }
}
.content {
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
    // color: blue;
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
    // border: 2px solid #181a92;
    background: #dfdfdf;
    // color: #000;
    // height: 30px;
    // font-size: 100%;
    // outline: #3747ac;
    // border: 1px solid #3747ac;
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
    border: 1px solid #000;
    padding: 10px 10px;
    .v-zoomer {
      padding: 5px;
      width: auto;
      height: 500px;
      border: 2px solid #dfdfdf;
      background: #fff;
    }

    button {
      background-color: #3747ac;
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
  margin: 0 15px;
  outline: none;
  font-size: 16px;
  font-weight: bold;
}
</style>