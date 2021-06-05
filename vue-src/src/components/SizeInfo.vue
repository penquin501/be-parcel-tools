<template>
  <div class="container" style="margin-top: 60px;">
    <b-overlay :show="show" rounded="lg">
      <div style="text-align: center; margin-top: 100px;">
        <b style="font-size: 18px;">รายการข้อมูล Size</b>
      </div>
      <template #overlay>
        <div class="text-center">
          <b-spinner style="width: 20rem; height: 20rem;" label="Large Spinner"></b-spinner>
          <p style="font-size: 18px;" id="cancel-label">Please wait...</p>
        </div>
      </template>
      <div class="row">
        <div class="col-ms-2 col-sm-2 col-xs-2">
          <button class="button-add" v-on:click="addSize(0)">
            <i class="fa fa-plus" aria-hidden="true"></i> เพิ่มข้อมูล Size
          </button>
        </div>
        <div class="col-ms-2 col-sm-2 col-xs-2">
          <button class="button-add" v-on:click="syncSize()">
            <i class="fa fa-exchange" aria-hidden="true"></i> Sync Size
          </button>
        </div>
        <div class="col-ms-5 col-sm-5 col-xs-5"></div>
        <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align: right;">
          <label style="margin-top: 5px;">Refresh</label>
        </div>
        <div class="col-ms-1 col-sm-1 col-xs-1" style="margin-bottom: 5px;">
          <button class="button-re" v-on:click="getSize()">
            <i class="fa fa-refresh" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-ms-12 col-sm-12 col-xs-12" style="text-align: center;">
          <label>Zone :</label>
          <div class="form-check form-check-inline" v-for="item in listZone" @change="selectedZone(item.zone)" v-bind:key="item.id" >
            <input style="margin-right: 0px; margin-left: 0px; width: 50px;" type="radio" :value="item.zone" v-model="selectZone" />{{ item.zone }}
          </div>
        </div>
      </div>

      <table>
        <tr>
          <th style="text-align: center;">ชื่อ size</th>
          <th style="text-align: center;">ชื่อย่อ</th>
          <th style="text-align: center;">พื้นที่</th>
          <th style="text-align: center;">Zone</th>
          <th style="text-align: center;">Action</th>
        </tr>
        <tr v-bind:key="item.id" v-for="item in dataSize">
          <td style="text-align: center;">{{ item.size_name }}</td>
          <td style="text-align: center;">{{ item.alias_size }}</td>
          <td style="text-align: center;">{{ item.location_zone }}</td>
          <td style="text-align: center;">{{ item.zone }}</td>

          <td style="text-align: center;">
            <button v-on:click="addSize(item.size_id)" class="button-set">
              <i class="fa fa-pencil" aria-hidden="true"></i>
            </button>
          </td>
        </tr>
      </table>

      <div style="margin-top: 50px; text-align: center;"></div>
    </b-overlay>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data: function() {
    return {
      dataSize: [],
      listZone: [],
      selectZone: 0,
      sizeId: 0,
      show: false,
      url: ""
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.getSize();
  },
  methods: {
    getSize() {
      const options = { okLabel: "ตกลง" };
      axios
        .get(this.url + "/size/size-info")
        .then(response => {
          if (response.data) {
            var dataSize = response.data.data;

            this.listZone = [];
            var zoneInfo = {};
            for (let item of dataSize) {
              if (!(item.zone in zoneInfo)) {
                zoneInfo[String(item.zone)] = [];
              }
              zoneInfo[String(item.zone)].push({ zone: item.zone });
            }
            for (const [key] of Object.entries(zoneInfo)) {
              this.listZone.push({ zone: key });
            }

            if (this.selectZone == 0) {
              this.dataSize = dataSize;
            } else {
              let listSizeZone = [];
              for (let item of dataSize) {
                if (item.zone == this.selectZone) {
                  listSizeZone.push(item);
                }
              }
              this.dataSize = listSizeZone;
            }
          } else {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    addSize(sizeId) {
      this.$router.push({ name: "AddSize", params: { sizeId: sizeId } });
    },
    selectedZone(zone) {
      this.selectZone = zone;
      this.getSize();
    },
    syncSize() {
      const options = { okLabel: "ตกลง" };
      this.show = !this.show;
      axios
        .get(this.url + "/size/sync-global-size")
        .then(response => {
          if (response.data.status !== undefined) {
            this.show = false;
            if(response.data.status == "SUCCESS" ){
              this.getSize();
            } else {
              this.$dialogs.alert("ไม่สามารถ sync size ได้ เนื่องจาก..." + response.data.status, options);
              this.$router.push("/");
            }
          } else {
            this.$dialogs.alert("ไม่พบข้อมูล", options);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
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
.button-add {
  padding: 5px 20px;
  background-color: #fff;
  cursor: pointer;
  color: rgb(0, 0, 0);
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