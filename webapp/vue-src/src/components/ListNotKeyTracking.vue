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
            <!-- <router-link :to="{ name: 'CompareData', params: { tracking: listTracking[index].tracking }}"  tag="button" class="button-list" ><i class="fa fa-keyboard-o" aria-hidden="true"></i></router-link> -->
          </td>
        </tr>
      </table>
         </div>

    </div>
  </div>
</template>

<script>
// const axios = require("axios");
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
    this.getlistTracking();
    var phoneNumber = this.$route.params.phoneNumber;
    console.log("phoneNumber =>",phoneNumber);
    this.phoneNumberKey = phoneNumber;
  },
  methods: {
    getTracking(tracking) {
      var aa = tracking;
      console.log("aa=>", aa);
    },
    getlistTracking() {
      //   axios
      //     .get("https://app.my945capture.com/v2/api/parcel-capture/tasks/tracking/by-phone/"+phoneNumber)
      //     .then(response => {
      //         if(response.data.status=='SUCCESS'){

      //         } else {
      //             alert('ไม่พบข้อมูล');
      //         }
      //     })
      //     .catch(function(error) {
      //       console.log(error);
      //     });
      var response = {
        status: "ok",
        results: [
          {
            tracking: "TDZ19063528",
            uid: "5e3bd6009da22900196f0a3d"
          },
          {
            tracking: "TDZ19063507",
            uid: "5e3bd6009da22900196f0a3e"
          },
          {
            tracking: "TDZ19063506",
            uid: "5e3bd6009da22900196f0a3f"
          },
          {
            tracking: "TDZ19063505",
            uid: "5e3bd6009da22900196f0a40"
          },
          {
            tracking: "TDZ19063526",
            uid: "5e3bd6009da22900196f0a41"
          },
          {
            tracking: "TDZ19063511",
            uid: "5e3bd6009da22900196f0a42"
          },
          {
            tracking: "TDZ19063525",
            uid: "5e3bd6009da22900196f0a43"
          },
          {
            tracking: "TDZ19063513",
            uid: "5e3bd6009da22900196f0a44"
          },
          {
            tracking: "TDZ19063520",
            uid: "5e3bd6009da22900196f0a45"
          },
          {
            tracking: "TDZ19063512",
            uid: "5e3bd6009da22900196f0a46"
          },
          {
            tracking: "TDZ19063509",
            uid: "5e3bd6009da22900196f0a47"
          },
          {
            tracking: "TDZ19063519",
            uid: "5e3bd6009da22900196f0a48"
          },
          {
            tracking: "TDZ19063521",
            uid: "5e3bd6009da22900196f0a49"
          },
          {
            tracking: "TDZ19063523",
            uid: "5e3bd6009da22900196f0a4a"
          },
          {
            tracking: "TDZ19063527",
            uid: "5e3bd6009da22900196f0a4b"
          },
          {
            tracking: "TDZ19063518",
            uid: "5e3bd6009da22900196f0a4c"
          },
          {
            tracking: "TDZ19063517",
            uid: "5e3bd6009da22900196f0a4d"
          },
          {
            tracking: "TDZ19063516",
            uid: "5e3bd6009da22900196f0a4e"
          },
          {
            tracking: "TDZ19063515",
            uid: "5e3bd6009da22900196f0a4f"
          },
          {
            tracking: "TDZ19063524",
            uid: "5e3bd6009da22900196f0a50"
          },
          {
            tracking: "TDZ19063508",
            uid: "5e3bd6009da22900196f0a51"
          },
          {
            tracking: "TDZ19063510",
            uid: "5e3bd6009da22900196f0a52"
          },
          {
            tracking: "TDZ19063522",
            uid: "5e3bd6009da22900196f0a53"
          },
          {
            tracking: "TDZ19063514",
            uid: "5e3bd6009da22900196f0a54"
          }
        ],
      };
      this.listTracking = response.results;
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