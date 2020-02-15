<template>
  <div class="container" style="margin-top: 60px;">
    <div class="search">
      <b style="font-size:18px;">กรุณากรอกเบอร์โทรศัพท์ผู้ส่ง :</b>
      <input maxlength="10" v-model="phoneInput" @keypress="isNumber($event)" autocomplete="false" />
    </div>
    <div class="search">
      <b style="font-size:18px;">priority :</b>
      <input maxlength="13" v-model="priorityInput" autocomplete="false" />
    </div>
    <div class="search">
      <button type="button">บันทึก</button>
    </div>
    <div>
      <p>จำนวน Tracking ที่ค้างในระบบ : {{ n }}</p>
      <p>จำนวน Tracking ที่กำหนด Priority ใหม่ : {{ nModified }} </p>
    </div>
  </div>
  
</template>

<script>
// const axios = require("axios");
export default {
  data: function() {
    return {
      phoneInput: "",
      priorityInput: "",
      n:0,
      nModified:0
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    var phoneNumber = this.$route.params.phoneNumber;
    this.phoneInput = phoneNumber;
    this.setPriority();
  },
  methods: {
    isNumber: function(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    setPriority() {
    //   var data = {
    //     phoneNumber: this.phoneInput,
    //     priority: this.priorityInput
    //   };
    //   axios
    //     .post(
    //       "https://app.my945capture.com/v2/api/parcel-capture/tasks/set-priority",
    //       data
    //     )
    //     .then(response => {});
      var response = {
        status: "ok",
        result: {
          n: 1,
          nModified: 12,
          ok: 1
        }
      };
      this.n= response.result.n;
      this.nModified= response.result.nModified;
    }
  }
};
</script>

<style lang="scss">
.search {
  text-align: center;
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
</style>