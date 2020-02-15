<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
      <table>
        <tbody style="text-align:center;">
          <tr v-for="(item, index) in listTracking" v-bind:key="item.id">
            <router-link :to="{ name: 'CompareData', params: { tracking: listTracking[index].tracking }}">
              <td>{{listTracking[index].tracking}}</td>
            </router-link>
          </tr>
        </tbody>
        <!-- <tr >
      <th style="text-align: center;">Tracking</th>
      <th style="text-align: center;">Action</th>

    </tr>
    <tr>
      <td style="text-align: center;">TDZ1000000</td>
      <td style="text-align: center;">  
          <a  tag="button" class="button-set"  href="https://my945app.firebaseapp.com/parcel-capture">KEY IN</a>
       </td> 
    </tr>
    <tr >
      <td style="text-align: center;">TDZ1000000</td>
      <td style="text-align: center;">  
           <a  tag="button" class="button-set"  href="https://my945app.firebaseapp.com/parcel-capture">KEY IN</a>
       </td> 
      
    </tr>
    <tr>
      <td style="text-align: center;">TDZ1000000</td>
       <td style="text-align: center;">  
              <a  tag="button" class="button-set"  href="https://my945app.firebaseapp.com/parcel-capture">KEY IN</a>
       </td> 
        </tr>-->
      </table>
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
      phoneNumber: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.getlistTracking();
  },
  methods: {
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
        ]
      };
      this.listTracking = response.results;
    }
  }
};
</script>

<style lang="scss">
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
</style>