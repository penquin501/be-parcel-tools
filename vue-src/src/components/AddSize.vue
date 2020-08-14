<template>
  <div class="container" style="margin-top: 60px;">
    <div style="text-align: center; margin-top: 100px;">
      <b
        style="font-size:18px;"
        v-if="sizeId==0? msg='เพิ่มข้อมูล Size': msg='แก้ไขข้อมูล Size'"
      >{{msg}}</b>
    </div>
    <div class="mycontent">
      <div class="left" style="border: 0px solid #000;"></div>
      <div class="center">
        <div>
          <b>ขนาด:</b>
          <input
            v-model="alias_size"
            autocomplete="false"
            :disabled="refAliasSize"
            ref="refAliasSize"
          />
        </div>
        <div>
          <b>zone:</b>
          <!-- <input
            v-model="location_zone"
            v-on:keypress="engOnly"
            :disabled="refLocationZone"
            ref="refLocationZone"
          />-->
          <div style="display: grid ; grid-template-columns: .5fr 1fr .5fr 1fr">
            <input
              style="margin-top: 5%"
              v-model="location_zone"
              type="radio"
              :disabled="refLocationZone"
              v-on:change="selectType('BKK')"
              value="BKK"
            />BKK
            <input
              style="margin-top: 5%"
              v-model="location_zone"
              type="radio"
              :disabled="refLocationZone"
              v-on:change="selectType('UPC')"
              value="UPC"
            />UPC
          </div>
        </div>
        <div>
          <b>ราคาขาย:</b>
          <input v-model="parcel_price" />
        </div>
        <div>
          <b>ราคาทุน:</b>
          <input v-model="parcel_cost" />
        </div>
        <div>
          <b>sold to account id:</b>
          <input v-model="sold_to_account_id" />
        </div>
        <div>
          <b>pickup account id:</b>
          <input v-model="pickup_account_id" />
        </div>
        <div>
          <b>customer account id:</b>
          <input v-model="customer_account_id" />
        </div>
        <div>
          <b>global product id (NORMAL):</b>
          <input v-model="global_product_id_normal" />
        </div>
        <div>
          <b>global product id (COD):</b>
          <input v-model="global_product_id_cod" />
        </div>
        <!-- <div>
          <b>สถานะ:</b>
          <select
            style="margin-left: 0px; margin-right: 0px;"
            class="select"
            v-model="branch_status"
          >
            <option value="0" disabled="disabled" selected="selected">----- เลือก สถานะ -----</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>-->
        <div class="group-btn">
          <button class="cancel" v-on:click="clearBtn">ยกเลิก</button>
          <button v-on:click="confirm">บันทึก</button>
        </div>
      </div>
      <div class="right" style="border: 0px solid #000;"></div>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data: function() {
    return {
      sizeId: 0,
      action: "",
      selectValue: 0,

      data_size_id: 0,
      size_name: "",
      location_zone: "",
      parcel_price: 0,
      parcel_cost: 0,
      alias_size: "",
      sold_to_account_id: "",
      pickup_account_id: "",
      customer_account_id: "",

      global_product_id_normal: "",
      global_product_id_cod: "",
      global_alias_name: "",
      global_product_name: "",
      global_area: "",
      global_type: "",

      refLocationZone: true,
      refAliasSize: true
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.sizeId = this.$route.params.sizeId;
    this.defaultSize();
  },
  methods: {
    defaultSize() {
      const options = { okLabel: "ตกลง" };
      if (this.sizeId !== 0) {
        axios
          .get("/size/get-size-info/" + this.sizeId)
          .then(response => {
            if (response.data) {
              this.dataSize = response.data.data;

              this.data_size_id = this.dataSize.size_info[0].size_id;
              this.size_name = this.dataSize.size_info[0].size_name;
              this.location_zone = this.dataSize.size_info[0].location_zone.toUpperCase();
              this.parcel_price = this.dataSize.size_info[0].parcel_price;
              this.parcel_cost = this.dataSize.size_info[0].parcel_cost;
              this.alias_size = this.dataSize.size_info[0].alias_size;
              this.sold_to_account_id = this.dataSize.size_info[0].sold_to_account_id;
              this.pickup_account_id = this.dataSize.size_info[0].pickup_account_id;
              this.customer_account_id = this.dataSize.size_info[0].customer_account_id;

              var global_size = this.dataSize.global_size;
              global_size.forEach(value => {
                if (value.type == "NORMAL") {
                  this.global_product_id_normal = value.product_id;
                }
                if (value.type == "COD") {
                  this.global_product_id_cod = value.product_id;
                }
              });

              this.action = "edit";
            } else {
              this.$dialogs.alert("ไม่พบข้อมูล", options);
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      } else {
        this.data_size_id = 0;
        this.size_name = "";
        this.location_zone = "";
        this.parcel_price = 0;
        this.parcel_cost = 0;
        this.alias_size = "";
        this.sold_to_account_id = "";
        this.pickup_account_id = "";
        this.customer_account_id = "";

        this.global_product_id_normal = "";
        this.global_product_id_cod = "";

        this.refLocationZone = false;
        this.refAliasSize = false;
        this.action = "add";
      }
    },
    clearBtn() {
      this.defaultSize();
    },
    selectType(parcel_type) {
      this.location_zone = parcel_type;
    },
    confirm() {
      const options = { okLabel: "ตกลง" };
      if (this.alias_size == "") {
        this.$dialogs.alert("กรุณาใส่ขนาดให้ถูกต้อง", options);
      } else if (this.location_zone == "") {
        this.$dialogs.alert("กรุณาระบุพื้นที่ให้ถูกต้อง", options);
      } else if (this.parcel_price == "" && parseInt(this.parcel_price) == 0) {
        this.$dialogs.alert("กรุณาระบุราคาขายให้ถูกต้อง", options);
      } else if (this.parcel_cost == "" && parseInt(this.parcel_cost) == 0) {
        this.$dialogs.alert("กรุณาระบุราคาทุนให้ถูกต้อง", options);
      } else if (this.sold_to_account_id == "") {
        this.$dialogs.alert("กรุณาใส่รหัส sold to account id ให้ถูกต้อง", options);
      } else if (this.pickup_account_id == "") {
        this.$dialogs.alert("กรุณาใส่รหัส pickup account id ให้ถูกต้อง", options);
      } else if (this.customer_account_id == "") {
        this.$dialogs.alert("กรุณารหัส customer account idให้ถูกต้อง", options);
      } else if (this.global_product_id_normal == "") {
        this.$dialogs.alert("กรุณาใส่ global product id สำหรับ Normal ให้ถูกต้อง", options);
      } else if (this.global_product_id_cod == "") {
        this.$dialogs.alert("กรุณาใส่ global product id สำหรับ COD ให้ถูกต้อง", options);
      } else {
        var data = {
          data_size_id: this.sizeId,
          location_zone: this.location_zone,
          parcel_price: parseInt(this.parcel_price),
          parcel_cost: parseInt(this.parcel_cost),
          alias_size: this.alias_size,
          sold_to_account_id: this.sold_to_account_id,
          pickup_account_id: this.pickup_account_id,
          customer_account_id: this.customer_account_id,

          global_product_id_normal: this.global_product_id_normal,
          global_product_id_cod: this.global_product_id_cod
        };
        
        if (this.action == "add") {
          axios
            .post("/size/add-size", data)
            .then(response => {
              if (response.data.status == "success") {
                this.$dialogs.alert("เพิ่มข้อมูล Size เรียบร้อยแล้ว", options);
                this.$router.push("/");
              } else {
                this.$dialogs.alert("ไม่สามารถเพิ่มข้อมูล Size ได้ เนื่องจาก..."+response.data.status, options);
              }
            })
            .catch(function(error) {
              console.log(error);
            });
        } else if (this.action == "edit") {
          axios
            .post("/size/edit-size", data)
            .then(response => {
              if (response.data.status == "success") {
                this.$dialogs.alert("บันทึกข้อมูล Size เรียบร้อยแล้ว", options);
                this.$router.push("/");
              } else {
                this.$dialogs.alert("ไม่สามารถแก้ไขข้อมูลได้ เนื่องจาก..." + response.data.status,options);
              }
            })
            .catch(function(error) {
              console.log(error);
            });
        } else {
          this.$dialogs.alert("error_incorrect_action", options);
        }
      }
    },
    isNumber: function(evt) {
      // console.log("evt",evt)
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode >= 48 && charCode < 58) {
        return true;
      } else {
        evt.preventDefault();
      }
    },
    engOnly($event) {
      var englishAlphabetAndWhiteSpace = /[A-Za-z | 0-9 |.]/g;
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
    }
  }
};
</script>

<style lang="scss" >
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
.select {
  width: 300px;
  border: none;
  border-bottom: 2px solid #000;
  background: none;
  // margin: 0 15px;
  outline: none;
  font-size: 16px;
  font-weight: bold;
}
.mycontent {
  .left {
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
</style>