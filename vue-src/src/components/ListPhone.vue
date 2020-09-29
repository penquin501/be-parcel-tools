<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">

       <div class="row">
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
        <div class="col-ms-3 col-sm-3 col-xs-3" >
          <b style="font-size:18px;">ค้นหาเบอร์โทรศัพท์ผู้ส่ง :</b>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3">
          <div class="search">
            <input
              @keypress="isNumber($event)"
              onkeypress="if(this.value.length == 10) return false;"
              v-model="phoneSeach"
              autocomplete="false"
              style="margin-top: 0px;"
             />
          </div>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
      </div>

      <div class="row">
         <div class="col-ms-9 col-sm-9 col-xs-9"></div>
          <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align:right;">
          <label style="margin-top: 5px;">Refresh</label>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1" style="margin-bottom: 5px;">
          
          <button class="button-re"  v-on:click="getlistPhoneNumber()"><i class="fa fa-refresh" aria-hidden="true"></i></button>

        </div>
      </div>
      <table class="list_phone">
        <tr>
          <th style="text-align: center;">เบอร์โทรศัพท์ผู้ส่ง</th>
          <th style="text-align: center;">จำนวนที่ค้าง</th>
          <th style="text-align: center;">ค่า Priority</th>
          <th style="text-align: center;">Action</th>
        </tr>   
          <tr v-bind:key="item.id" v-for="item  in filteredResourcesPhone">
            <td style="text-align: center;">{{item.phoneNumber}}</td>
            <td style="text-align: center;">{{ item.count }}</td>
            <td style="text-align: center;">{{ item.priority }}</td>
            <td style="text-align: center;">
            <button v-on:click="setPhone(item.phoneNumber)"  class="button-set"><i class="fa fa-bell" aria-hidden="true"></i></button>&nbsp;
            <button v-on:click="setlist(item.phoneNumber,item.priority)" class="button-list"><i class="fa fa-bars" aria-hidden="true"></i></button>
            <!-- <router-link :to="{ name: 'ListNotkeyTracking', params: { phoneNumber: item.phoneNumber }}"   tag="button" class="button-list" ><i class="fa fa-bars" aria-hidden="true"></i></router-link> -->
          </td>
          </tr>
      </table>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  components: {},
  data: function() {
    return {
      listPhone: [],
      tracking: "",
      phoneSeach:"",
      // phoneNumber: "",
    };
  },
  mounted() {
    this.getlistPhoneNumber();
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
  },
  methods: {
    setPhone(phone){
     this.$session.set("phoneNumber",phone);
     this.$router.push({ name: 'SetPriority'});
    },
    setlist(phone,priority){
     this.$session.set("phoneNumber",phone);
     this.$session.set("priority",priority);
     this.$router.push({ name: 'ListNotkeyTracking'});
    },
    getlistPhoneNumber() {
      const options = { okLabel: "ตกลง" };
        axios
          .get("https://key.my945capture.com/v2/api/parcel-capture/tasks/list/phone/number")
          // .get("http://127.0.0.1:8081/v2/api/parcel-capture/tasks/list/phone/number")
          .then(response => {
            if (response.data.status=='ok') {
              this.listPhone=response.data.result
              // console.log(this.listPhone);
            } else {
              this.$dialogs.alert("ไม่พบข้อมูล", options);
            }
          })
          .catch(function(error) {
            console.log(error);
          });
    },
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
  },
 computed: {
     filteredResourcesPhone() {
      if (this.phoneSeach) {
        return  this.listPhone.filter(item => {
          var phoneNumber = item.phoneNumber;
          if (phoneNumber == null) {
            phoneNumber = "";
          } 
          return (
            !this.phoneSeach ||
            phoneNumber.toLowerCase().includes(this.phoneSeach.toLowerCase()) 
          );
        });
      } else {
        return this.listPhone;
      }
    },
    

    }
};
</script>

<style lang="scss">
 input {
    margin: 10px 5px 10px 5px;
    background: none;
    border: none;
    border-bottom: 1px solid #000;
    outline: none;
    width: 200px;
    text-align: center;
  }
.button-set {
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
  &:focus {
    outline: 5px auto rgb(0, 136, 148);
  }
}
.button-list {
  padding: 5px 20px;
  background-color: #fff;
  border: 2px solid rgb(169, 170, 170);
  cursor: pointer;
  color: rgb(169, 170, 170);
  font-weight: bold;
  outline: none;
  transition: 0.5s;
  &:hover {
    background-color: rgb(169, 170, 170);
    color: #fff;
  }
  &:focus {
    outline: 5px auto rgb(169, 170, 170);
  }
}
.button-re{
  padding: 5px 20px;
  background-color: #fff;
  // border: 2px solid rgb(169, 170, 170);
  // border-radius: 70px;
  cursor: pointer;
  color: rgb(169, 170, 170);
  font-weight: bold;
  outline: none;
  transition: 0.5s;
  &:hover {
    background-color: rgb(169, 170, 170);
    color: #fff;
  }
  &:focus {
    outline: 5px auto rgb(169, 170, 170);
  }

}

.list_phone{
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  border: 1px solid #ddd; 
th, td {
  text-align: left;
  padding: 8px;
}
tr:nth-child(even){background-color: #f2f2f2}
}

</style>