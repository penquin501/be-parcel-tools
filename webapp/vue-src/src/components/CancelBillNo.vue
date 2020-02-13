<template>
  <div class="container" style="
    margin-top: 60px;">
    <div class="search">
      <b style="font-size:18px;">กรุณาใส่เลขที่บิล : </b>
      <input maxlength="30" v-model="billingInput" autocomplete="false" />
      <button v-on:click="getData" type="button" >Search</button>
    </div>

     <div class="row">
       <div class="col-md-4"></div>
        <div class="col-md-4">
              <div class="center" >
      <div>
        <b style="font-size:16px;">Billing No : {{billingNo}}</b>
      </div>
      <div>
        <b style="font-size:16px;">จำนวน Tracking : {{countTracking}}</b>
      </div>
      <div>
        <b style="font-size:16px;" v-if="!status">
          สถานะ :
          <label style="color: red">{{txtStatus}}</label>
        </b>
        <b style="font-size:16px;" v-if="status">
          สถานะ :
          <label style="color: green">{{txtStatus}}</label>
        </b>
      </div>
    </div>
        </div>
         <div class="col-md-4"></div>
     </div>
    <div class="group-btn">
      <button v-on:click="confirmData" type="button" >บันทึก</button>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
import Vue from "vue";
import "v-slim-dialog/dist/v-slim-dialog.css";
import SlimDialog from "v-slim-dialog";

Vue.use(SlimDialog);

export default {
  data: function() {
    return {
      billingInput: "",
      billingNo: "",
      countTracking: "",
      billingStatus:"",
      status: false,
      txtStatus: "",
      previous_value:{}
    };
  },
  mounted(){
    if(!this.$session.get('session_username')){
      this.$router.push({ name: "Main"})
    }
  },
  methods: {
    getData() {
      const options = { okLabel: "ตกลง" };
      if (this.billingInput == "") {
        this.$dialogs.alert("กรุณาใส่เลขที่บิลให้ถูกต้อง", options);
      } else {
        axios
          .get(
            "https://tool.945parcel.com/check/info/billing?billing=" +
              this.billingInput
          )
          .then(response => {
            if (response.data) {
              console.log(response.data);
              this.txtStatus="";
              var data = response.data.billingInfo;
              this.billingNo = data.billingNo;
              this.billingStatus = data.billingStatus;
              this.countTracking = data.countTracking;
              this.status = response.data.statusParcel;

              if (this.status) {
                this.txtStatus = "สามารถยกเลิกเลขที่บิลนี้ได้";
              } else {
                this.txtStatus = "ไม่สามารถยกเลิกเลขที่บิลนี้ได้";
              }
              this.previous_value=this.billingStatus
              // console.log(this.billingNo);
            } else {
              this.$dialogs.alert("ไม่พบข้อมุล", options);
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    confirmData() {
      const options = { okLabel: "ตกลง" };
      if (!this.status) {
        this.$dialogs.alert("ไม่สามารถยกเลิกเลขที่บิลนี้ได้", options);
      } else {
        var dataConfirm={
            billing_no:this.billingNo,
            previous_value:this.previous_value,
            user:this.$session.get('session_username')
          };
        axios.post("https://tool.945parcel.com/save/cancel/billing" ,dataConfirm)
        .then(response => {
            if(response.data.status=='SUCCESS'){
              this.$dialogs.alert("ยกเลิกเรียบร้อยแล้ว", options);
              window.location.reload();
            }
          })
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
 .cancle{
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