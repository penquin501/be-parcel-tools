<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
      <div class="row">
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
        <div class="col-ms-3 col-sm-3 col-xs-3" style=" text-align: right;">
          <b style="font-size:18px;">ค้นหา :</b>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3">
          <div class="search">
            <input v-model="billingSearch" autocomplete="false" style="margin-top: 0px;" />
          </div>
        </div>
        <div class="col-ms-3 col-sm-3 col-xs-3"></div>
      </div>

      <table>
        <tr>
          <th style="text-align:center;">เลขที่พัสดุ</th>
          <th style="text-align:center;">ขนาด</th>
          <th style="text-align:center;">ราคาพัสดุ</th>
          <th style="text-align:center;">ประเภท(QL)</th>
          <th style="text-align:center;">รหัสไปรษณีย์(QL)</th>
          <th style="text-align:center;">มูลค่า COD</th>
          <th style="text-align:center;">ประเภท(KI)</th>
          <th style="text-align:center;">ชื่อผู้ส่ง</th>
          <th style="text-align:center;">เบอร์ผู้ส่ง</th>
          <th style="text-align:center;">ที่อยู่ผู้ส่ง</th>
          <th style="text-align:center;">ชื่อผู้รับ</th>
          <th style="text-align:center;">เบอร์ผู้รับ</th>
          <th style="text-align:center;">ที่อยู่ผู้รับ</th>
          <th style="text-align:center;">ตำบล</th>
          <th style="text-align:center;">อำเภอ</th>
          <th style="text-align:center;">จังหวัด</th>
          <th style="text-align:center;">รหัสไปรษณีย์(KI)</th>
          <th style="text-align:center;">สถานะ</th>
          <th style="text-align:center;">วัน/เวลา ส่งข้อมูล</th>
          <th style="text-align:center;">booking status</th>
          <th style="text-align:center;">วัน/เวลา booking</th>
          <th style="text-align:center;">ที่มา</th>
        </tr>
        <tr v-bind:key="item.id" v-for="item in dataBilling">
          <td style="text-align: center;">{{ item.tracking }}</td>
          <td style="text-align: center;">{{ item.size_name }}</td>
          <td style="text-align: center;">{{ item.size_price }}</td>
          <td style="text-align: center;">{{ item.bi_parcel_type }}</td>
          <td style="text-align: center;">{{ item.bi_zipcode }}</td>
          <td style="text-align: center;">{{ item.cod_value }}</td>
          <td style="text-align: center;">{{ item.br_parcel_type }}</td>
          <td style="text-align: center;">{{ item.sender_name }}</td>
          <td style="text-align: center;">{{ item.sender_phone }}</td>
          <td style="text-align: center;">{{ item.sender_address }}</td>
          <td style="text-align: center;">{{ item.receiver_name }}</td>
          <td style="text-align: center;">{{ item.phone }}</td>
          <td style="text-align: center;">{{ item.receiver_address }}</td>
          <td style="text-align: center;">{{ item.district_name }}</td>
          <td style="text-align: center;">{{ item.amphur_name }}</td>
          <td style="text-align: center;">{{ item.province_name }}</td>
          <td style="text-align: center;">{{ item.br_zipcode }}</td>
          <td style="text-align: center;">{{ item.status }}</td>
          <td style="text-align: center;">{{ item.sending_date }}</td>
          <td style="text-align: center;">{{ item.booking_status }}</td>
          <td style="text-align: center;">{{ item.booking_date }}</td>
          <td style="text-align: center;">{{ item.source }}</td>
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
      billing_no: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.billing_no = this.$route.params.billing_no;
    this.getData();
  },
  methods: {
    getData() {
      const options = { okLabel: "ตกลง" };
      axios
        .get("/list-tracking-bill?billing_no=" + this.billing_no)
        .then(response => {
          console.log(response);
          if (response.data.length === 0) {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
          } else {
            this.dataBilling = response.data;
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  },
  computed: {
    filteredResourcesBilling() {
      if (this.billingSearch) {
        return this.dataBilling.filter(item => {
            var branch_name = item.branch_name;
            var billing_no = item.billing_no;
            var sender_name = item.sender_name;
            var cTracking = item.cTracking;
            var status = item.status;
            if(branch_name == null || billing_no == null || sender_name == null || cTracking == null || status == null){
                branch_name = "";
                billing_no = "";
                sender_name = "";
                cTracking = "";
                status = "";
            }
          return (
            !this.billingSearch ||
             branch_name.includes(this.billingSearch) ||
             billing_no.toLowerCase().indexOf(this.billingSearch.toLowerCase()) > -1 ||
             sender_name.includes(this.billingSearch)
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
.button-re {
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
