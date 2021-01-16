<template>
  <div class="container" style="margin-top: 60px;">
    <div class="search">
      <div class="row" style="margin-bottom: 15px; margin-top: 15px;">
        <div class="col-ms-1 col-sm-1"></div>
        <div class="col-ms-4 col-sm-4" style="text-align: right;">
          <b style="font-size: 18px;">เบอร์โทรศัพท์ผู้ส่ง :</b>
        </div>
        <div class="col-ms-4 col-sm-4" style="text-align: left;">
          <input
            maxlength="10"
            v-model="phoneInput"
            @keypress="isNumber($event)"
            autocomplete="false"
            :disabled="state.isSending"
            style="margin-bottom: 0px; margin-top: 0px;"
          />
        </div>
        <div class="col-ms-4 col-sm-4"></div>
      </div>
    </div>
    <div class="search">
      <div class="row" style="margin-bottom: 15px; margin-top: 15px;">
        <div class="col-ms-1 col-sm-1"></div>
        <div class="col-ms-4 col-sm-4" style="text-align: right;">
          <b style="font-size:18px;">Priority :</b>
        </div>
        <div class="col-ms-4 col-sm-4" style="text-align: left;">
          <input
            maxlength="13"
            v-model="priorityInput"
            autocomplete="false"
            style="margin-bottom: 0px; margin-top: 0px;"
          />
        </div>
        <div class="col-ms-4 col-sm-4"></div>
      </div>
    </div>
    <div class="search">
      <div class="row">
        <div class="col-ms-4 col-sm-4"></div>
        <div class="col-ms-4 col-sm-4">
          <button type="button" v-on:click="setPriority()">บันทึก</button>
        </div>
        <div class="col-ms-4 col-sm-4"></div>
      </div>
    </div>
    <div class="row" style="margin-bottom: 15px; margin-top: 15px;">
      <div class="col-ms-1 col-sm-1"></div>
      <div class="col-ms-4 col-sm-4" style="text-align: right;">
        <b style="font-size:18px;">จำนวน Tracking ที่ค้างในระบบ :</b>
      </div>
      <div class="col-ms-2 col-sm-2" style="text-align: center; margin-top: 3px;">
        <b style="margin-bottom: 0px;">{{ n }}</b>
      </div>
      <div class="col-ms-6 col-sm-6"></div>
    </div>
    <div class="row">
      <div class="col-ms-1 col-sm-1"></div>
      <div class="col-ms-4 col-sm-4" style="text-align: right;">
        <b style="font-size:18px;">จำนวน Tracking ที่กำหนด Priority ใหม่ :</b>
      </div>
      <div class="col-ms-2 col-sm-2" style="text-align: center; margin-top: 3px;">
        <b style="margin-bottom: 0px;">{{ nModified }}</b>
      </div>
      <div class="col-ms-6 col-sm-6"></div>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data: function() {
    return {
      phoneInput: "",
      priorityInput: "",
      n: 0,
      nModified: 0,
      state: {
        isSending: true
      }
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.phoneInput = this.$session.get("phoneNumber");
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
      var data = {
        phoneNumber: this.phoneInput,
        priority: parseInt(this.priorityInput)
      };
      axios
        .post(
          "https://key.my945capture.com/v2/api/parcel-capture/tasks/set-priority",
          // "http://127.0.0.1:8081/v2/api/parcel-capture/tasks/set-priority",
          data
        )
        .then(response => {
          this.n = response.data.result.n;
          this.nModified = response.data.result.nModified;
        });
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