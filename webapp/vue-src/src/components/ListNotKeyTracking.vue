<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
      <div class="row">
        <div class="col-ms-4 col-sm-4 col-xs-4"></div>
        <div class="col-ms-2 col-sm-2 col-xs-2" >
          <b style="font-size:18px;">เบอร์โทรศัพท์ผู้ส่ง :</b>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3">
          <div class="search" >
            <input
              maxlength="13"
              v-model="phoneNumberKey"
              autocomplete="false"
              style="margin-top: 0px;"
              :disabled="state.isSending"
            />
          </div>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
      </div>
      <div class="row">
        <div class="col-ms-4 col-sm-4 col-xs-4"></div>
        <div class="col-ms-2 col-sm-2 col-xs-2" >
          <b style="font-size:18px;">ค้นหา Tracking :</b>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3">
          <div class="search">
            <input
              onkeypress="if(this.value.length == 12) return false;"
              v-on:keypress="engOnly"
              v-model="trackingSeach"
              autocomplete="false"
              style="margin-top: 0px;"
             />
          </div>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
      </div>

<div style="overflow-x:auto; height:700px;">
      <table >
        <tr>
          <th style="text-align: center;">Tracking</th>
          <th style="text-align: center;">Action</th>
        </tr>
        <tr v-bind:key="item.id" v-for="item  in filteredResourcesTracking">
          <td style="text-align: center;">{{ item.tracking }}</td>
          <td style="text-align: center;">
            <button class="button-list" v-on:click="getTracking(item.tracking)">
              <i class="fa fa-keyboard-o" aria-hidden="true"></i>
            </button>
          </td>
        </tr>
      </table>
         </div>

    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  components: {
    // CompareData
  },
  data: function() {
    return {
      listTracking: [],
      phoneNumberKey: "",
      trackingSeach: "",
      state: {
        isSending: true
      }
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }

    var phoneNumber = this.$route.params.phoneNumber;
    console.log("phoneNumber =>",phoneNumber);
    this.phoneNumberKey = phoneNumber;
    this.getlistTracking();
  },
  methods: {
    getTracking(tracking) {
      window.open('https://app.my945capture.com/v2/api/parcel-capture/tasks/manual/pick/' + tracking);
    },
    getlistTracking() {
        axios
          .get("https://app.my945capture.com/v2/api/parcel-capture/tasks/tracking/by-phone/"+this.phoneNumberKey)
          .then(response => {
              if(response.data.status=='ok'){
                  this.listTracking = response.data.results;
              } else {
                  alert('ไม่พบข้อมูล');
              }
          })
          .catch(function(error) {
            console.log(error);
          });
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

  },
    computed: {
     filteredResourcesTracking() {
      if (this.trackingSeach) {
        return  this.listTracking.filter(item => {
          var trackingfind = item.tracking;
          if (trackingfind == null) {
            trackingfind = "";
          } 
          return (
            !this.trackingSeach ||
            trackingfind.toLowerCase().includes(this.trackingSeach.toLowerCase()) 
          );
        });
      } else {
        return this.listTracking;
      }
    },
    

    }
};
</script>

<style lang="scss" scope>
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
table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  border: 1px solid #ddd;
}
th,
td {
  text-align: left;
  padding: 8px;
}
tr:nth-child(even) {
  background-color: #f2f2f2;
}
 input {
    text-transform: uppercase;
}
</style>