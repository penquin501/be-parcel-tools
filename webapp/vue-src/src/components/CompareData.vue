<template>
<div>

  <!-- <section v-if="menu == 1" class="table">  -->
    <div class="content">
      <div class="left">
        <div class="item2">
          <div>
          <b>Tracking:</b>
          <input :disabled="billingInfo" v-model="tracking" />
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
        <!-- <div>
          <b>Tracking:</b>
          <input :disabled="billingInfo" v-model="tracking" />
        </div> -->
        <div>
          <b>Parcel Type:</b><br/>
          <select class="selectType" v-model="bi_parcel_type">
            <option value="NORMAL">NORMAL</option>
            <option value="COD">COD</option>
          </select>
        </div>
        <div>
          <b>COD Value:</b>
          <input :disabled="codValueEdit" v-model="cod_value" />
        </div>
        <div>
          <b>Zipcode:</b>
          <input :disabled="billingInfo" v-model="bi_zipcode" />
        </div>
        <div>
          <b>Size:</b>
          <!-- <input :disabled="billingInfo" v-model="alias_size" /> -->
          <select class="selectSize" v-model="alias_size">

            <!-- <option :value="alias_size" :selected="alias_size" disabled>{{alias_size}}</option> -->
              <option :value="boxSize[index].alias_size.toUpperCase()" v-for="(item , index) in boxSize" :key="item.id"  >
                {{boxSize[index].alias_size.toUpperCase()}}
                </option>

          </select>
        </div>
        
        <div>
          <b>Size Price:</b>
          <input :disabled="billingInfo" v-model="size_price" />
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
    <div class="group-btn">
      <button v-on:click="confirmData">แก้ไขข้อมูล</button>
    </div>
  <!-- </section> -->
  </div>
</template>

<script>
const axios = require("axios");
export default {
    props:{
        selectedTracking:Object,
    },
    data: function() {
        return {
            imgUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTDGlsf5n4LgX_Bj23tTVsUeBQodMUP1CHhqk-My3EZIkIYvMDC",
            rotation: 0,
            menu: 1,
            tracking:"",
            billingInfo: [],
            billing_no: "",
            bi_parcel_type: "",
            alias_size: "",
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
            codValueEdit:false,
            receiverFNameEdit:false,
            receiverLNameEdit:false,
            receiverPhoneEdit:false,
            receiverAddressEdit:false,

            boxSize: [],
        };
    },
    mounted(){
        var tracking = this.$props.selectedTracking.tracking;
        this.getData(tracking);
        this.parcelSizeList();
    },
    methods:{
    getData(tracking) {
      axios
        .get(
          "https://tool.945parcel.com/check/info/tracking?tracking=" +
            tracking.toUpperCase()
        )
        .then(response => {
          // console.log(response.data);
          if (response.data.status == "SUCCESS") {
            this.billingInfo = response.data.billingInfo;
            this.billing_no = this.billingInfo[0].billing_no;
            this.tracking = this.billingInfo[0].tracking;
            this.bi_parcel_type = this.billingInfo[0].bi_parcel_type;
            this.alias_size = this.billingInfo[0].alias_size.toUpperCase();
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
    parcelSizeList(){
      axios
        .get(
          "http://127.0.0.1:3200/tools/parcel/size/list"
        )
        .then(response => {
          this.boxSize = response.data.parcelSizeList;
          // console.log(response.data.parcelSizeList);
           })
        .catch(function(error) {
          console.log(error);
        });
    },
    confirmData() {

          var phone=this.phone;
          if(this.receiver_first_name =="") {
            alert("กรุณากรอก ชื่อผู้รับ ให้ถูกต้อง");
          } else if(this.receiver_last_name ==""){
            alert("กรุณากรอก นามสกุลผู้รับ ให้ถูกต้อง");
          } else if(phone[0]+phone[1] != '06' && phone[0]+phone[1] != '08'&& phone[0]+phone[1] != '09'){
            alert("กรุณากรอก เบอร์โทรศัทพ์ผู้รับ เท่านั้น");
          } else if(phone.length<10){
            alert("กรุณากรอก เบอร์โทรศัพท์ ให้ถูกต้อง");
          } else {
            // var dataReceiver={
            //     tracking:this.tracking,
            //     billing_no:this.billing_no,
            //     previous_value:this.previous_value,
            //     current_value:{
            //       first_name:this.receiver_first_name,
            //       last_name:this.receiver_last_name,
            //       phone:this.phone,
            //       address:this.receiver_address
            //     },
            //     user:'1'
            //   };
                // axios.post("https://tool.945parcel.com/update/receiver/info" ,dataReceiver)
                // .then(response => {
                //   if(response.data.status=='SUCCESS'){
                //     alert(
                //       "แก้ไขข้อมูลผู้รับเรียบร้อยแล้ว"
                //     );
                //     window.location.reload();
                //   }
                // })
                // .catch(function(error) {
                //   console.log(error);
                // });
          }
      
    },
        rotateRight() {
        this.rotation += 90;
        },
        rotateLeft() {
        this.rotation -= 90;
        },
    },


}
</script>

<style lang="scss" scoped>
* {
  font-family: Arial, Helvetica, sans-serif;
}

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

    .btnOption{
      text-align: center;
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

.selectType,.selectSize {
  width: 100%;
  outline: none;
  font-size: 16px;
  font-weight: bold;
}
</style>