<template>
  <div style="margin-top: 60px;">
   <div class="container" style="overflow-x:auto;">
    <div class="row">
      <div class="col-ms-1 col-sm-1 col-xs-1"></div>
     <div class="col-ms-10 col-sm-10 col-xs-10" style="text-align:center;">
           <h2>รายการบิลประจำวัน {{ date }}</h2>
     </div>
     <div class="col-ms-1 col-sm-1 col-xs-1"></div>
     </div>
  
       <div class="row">
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
        <div class="col-ms-3 col-sm-3 col-xs-3" style=" text-align: right;" >
          <b style="font-size:18px;">ค้นหา :</b>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3">
          <div class="search">
            <input
              v-model="billingSeach"
              autocomplete="false"
              style="margin-top: 0px;"
             />
          </div>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
      </div>

    <table>
      <tr>
        <th style="text-align:center;">ชื่อสาขา</th>
        <th style="text-align:center;">เลขที่บิล</th>
        <th style="text-align:center;">ชื่อผู้ส่ง</th>
        <th style="text-align:center;">จำนวน</th>
      </tr>
      <tr v-bind:key="item.id" v-for="item in filteredResourcesBilling">
        <td style="text-align: center;">{{ item.branch_name }}</td>
        <td style="text-align: center;">{{ item.billing_no }}</td>
        <td style="text-align: center;">{{ item.sender_name }}</td>
        <td style="text-align: center;">{{ item.cTracking }}</td>
      </tr>
    </table>
  </div>
  </div>
</template>
<script>
const axios = require("axios");
export default {
  data: function() {
    return {
      dataBilling: [],
      billingSearch: "",
      date: "",
    };
  },
  mounted() {
    if(!this.$session.get('session_username')){
       this.$router.push({ name: "Main"})
    }
    this.getBilingNo();
    this.getDate();
  },
  methods: {
    getBilingNo() {
      const options = { okLabel: "ตกลง" };
      axios
        .get("/daily-report")
        .then(response => {
          this.dataBilling = response.data;
          if(response.data===null){
            this.$dialogs.alert("ไม่พบข้อมูล",options);
          } else {
            this.dataBilling = response.data;
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    getDate(){
        var monthNamesThai = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤษจิกายน","ธันวาคม"];
        var dayNames = ["วันอาทิตย์ที่","วันจันทร์ที่","วันอังคารที่","วันพุธที่","วันพฤหัสบดีที่","วันศุกร์ที่","วันเสาร์ที่"];
        var d = new Date();
        this.date = dayNames[d.getDay()]+"  "+d.getDate()+"  "+monthNamesThai[d.getMonth()]+"  "+d.getFullYear();
    },
  },
  computed: {
    filteredResourcesBilling() {
      if (this.billingSearch) {
        return this.dataBilling.filter(item => {
            var branch_name = item.branch_name;
            var billing_no = item.billing_no;
            var sender_name = item.sender_name;
            var cTracking = item.cTracking;
            if(branch_name == null || billing_no == null || sender_name == null || cTracking == null){
                branch_name = "";
                billing_no = "";
                sender_name = "";
                cTracking = ""
            }
          return (
            !this.billingSearch ||
             branch_name.includes(this.billingSeach) ||
             billing_no.toLowerCase().indexOf(this.billingSeach.toLowerCase()) > -1 ||
             sender_name.includes(this.billingSeach)
           );
        });
      } else {
        return this.dataBilling
      }
    }
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
