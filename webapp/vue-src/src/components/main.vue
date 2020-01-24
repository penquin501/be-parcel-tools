<template>
  <div  style="
    margin-top: 60px;
">
    <div class="search">
      <b style="font-size:18px;"> กรุณาใส่เลข Tracking :</b>
      <input maxlength="13" v-model="trackingInput" autocomplete="false" />

      <button v-on:click="getData"  type="button" >Search</button>
      
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
          <b>Receiver Firstname:</b>
          <input :disabled="receiverFNameEdit" ref="receiverFNameEdit" v-model="receiver_first_name" />
        </div>
        <div>
          <b>Receiver Lastname:</b>
          <input :disabled="receiverLNameEdit" ref="receiverLNameEdit" v-model="receiver_last_name" />
        </div>

        <div>
          <b>Receiver Phone:</b>
          <input maxlength="10" :disabled="receiverPhoneEdit" ref="receiverPhoneEdit" v-model="phone" />
        </div>
        <div>
          <b>Receiver Address:</b>
          <input :disabled="receiverAddressEdit" ref="receiverAddressEdit" v-model="receiver_address" />
        </div>
        <div>
          <b>Location:</b>
          <input :disabled="billingInfo" v-model="location" />
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
      <b style="font-size:18px;">Tools ที่จะใช้ : </b>
      <select class="select" v-model="selectValue" v-on:change="selectTools" >
      <!-- <select class="select" v-model="selectValue"> -->
        <option value disabled selected> ----- เลือก Tools ----- </option>
        <option value="1">ยกเลิก Tracking</option>
        <option value="2">เปลี่ยนแปลงข้อมูลผู้รับ</option>
      </select>
    </div>
    <div class="group-btn">
      <button class=" cancel" v-on:click="clearBtn">ยกเลิก</button>
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
      previous_value: "",
      receiver_first_name:"",
      receiver_last_name:"",
      phone: "",
      receiver_address: "",
      location:"",
      br_zipcode: "",
      br_parcel_type: "",

      order_status: "",
      order_status_lb: "",
      send_booking: "",

      selectValue: "",
      imgUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC",
      rotation: 0,

      receiverFNameEdit:true,
      receiverLNameEdit:true,
      receiverPhoneEdit: true,
      receiverAddressEdit:true
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

            var receiver_name = this.billingInfo[0].receiver_name;
            var res = receiver_name.split(" ");
            this.receiver_first_name=res[0];
            this.receiver_last_name=res[1];

            this.phone = this.billingInfo[0].phone;
            this.receiver_address =this.billingInfo[0].receiver_address;

            this.previous_value=receiver_name+"/"+this.phone+"/"+this.receiver_address;

            this.location=this.billingInfo[0].district_name +
                          " " +
                          this.billingInfo[0].amphur_name +
                          " " +
                          this.billingInfo[0].province_name;
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
      if(this.tracking==""){
          alert(
            "กรุณาระบุ Tracking เพื่อทำรายการ"
          );
          this.selectValue = "";
        } else {
          if (this.selectValue == 1) {
            this.receiverFNameEdit= true;
            this.receiverLNameEdit= true;
            this.receiverPhoneEdit = true;
            this.receiverAddressEdit= true;
            this.getData();
          } else if (this.selectValue == 2) {
            this.receiverFNameEdit= false;
            this.receiverLNameEdit= false;
            this.receiverPhoneEdit = false;
            this.receiverAddressEdit= false;
          } else {
            this.receiverFNameEdit= true;
            this.receiverLNameEdit= true;
            this.receiverPhoneEdit = true;
            this.receiverAddressEdit= true;
          }
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
          axios.post("http://127.0.0.1:3200/save/cancel/tracking" ,data)
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
          var phone=this.phone;
          if(this.receiver_first_name =="") {
            alert("กรุณากรอก ชื่อผู้รับ ให้ถูกต้อง");
          } else if(this.receiver_last_name ==""){
            alert("กรุณากรอก นามสกุลผู้รับ ให้ถูกต้อง");
          } else if(phone[0]+phone[1] != '06' && phone[0]+phone[1] != '08'&& phone[0]+phone[1] != '09'){
            alert("กรุณากรอก เบอร์โทรศัทพ์ผู้รับ เท่านั้น");
          } else if(phone.length<10){
            alert("กรุณากรอก เบอร์โทรศัพท์ ให้ถูกต้อง");
          } else{
            var dataReceiver={
                tracking:this.tracking,
                billing_no:this.billing_no,
                previous_value:this.previous_value,
                current_value:{
                  first_name:this.receiver_first_name,
                  last_name:this.receiver_last_name,
                  phone:this.phone,
                  address:this.receiver_address
                },
                user:'1'
              };
                axios.post("https://tool.945parcel.com/update/receiver/info" ,dataReceiver)
                .then(response => {
                  if(response.data.status=='SUCCESS'){
                    alert(
                      "แก้ไขข้อมูลผู้รับเรียบร้อยแล้ว"
                    );
                    window.location.reload();
                  }
                })
                .catch(function(error) {
                  console.log(error);
                });
          }
          
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
.content {
  .left{
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

    .btnOption{
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
  margin: 0 15px;
  outline: none;
  font-size: 16px;
  font-weight: bold;
}
 .cancel{
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
      color: #fff !important;;
    }
}
.save{
     padding: 5px 20px;
    background-color: #fff;
    border: 2px solid 	#32CD32 !important;
    cursor: pointer;
    color: 	#32CD32 !important;
    font-weight: bold;
    outline: none;
    transition: 0.5s;
    &:hover {
      background-color: 	#32CD32 !important;
      color: #fff !important;;
    }
}

</style>