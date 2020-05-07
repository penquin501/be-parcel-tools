<template>
  <div class="container" style="margin-top: 60px;">
    <div style="text-align: center; margin-top: 100px;">
      <b style="font-size:18px;" v-if="branch_id==0? msg='เพิ่มข้อมูลสาขา': msg='แก้ไขข้อมูลสาขา'">{{msg}}</b>
    </div>
    <div class="mycontent">
      <div class="left" style="border: 0px solid #000;"></div>
      <div class="center">
        <div>
          <b>รหัสสาขา:</b>
          <input v-model="tracking" />
        </div>
        <div>
          <b>ตัวย่อ:</b>
          <input v-model="billing_no" />
        </div>
        <div>
          <b>ชื่อสาขา:</b>
          <input v-model="size_id" />
        </div>
        <div>
          <b>สถานะ:</b>
          <select
            style="margin-left: 0px; margin-right: 0px;"
            class="select"
            v-model="selectValue"
            v-on:change="selectTools"
          >
            <option value="0" disabled="disabled" selected="selected">----- เลือก สถานะ -----</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
        <div class="group-btn">
          <button class="cancel" v-on:click="clearBtn">ยกเลิก</button>
          <button v-on:click="confirmSelectTools">บันทึก</button>
        </div>
      </div>
      <div class="right" style="border: 0px solid #000;"></div>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      branch_id: 0,
      actionLb: "",
      selectValue: 0
    };
  },
  mounted() {
    if (!this.$session.get("session_username")) {
      this.$router.push({ name: "Main" });
    }
    this.branch_id = this.$session.get("branchId");
    // this.defaultFn(this.branch_id);
  },
  methods: {
    defaultFn(bId) {
      var action=""
      if (bId == 0) {
        action = "เพิ่ม";
        //select ข้อมูลมาก่อน
      } else {
        action = "แก้ไข";
      }
      this.actionLb=action;
    }
    //    editBranch() {
    //       // const options = { okLabel: "ตกลง" };
    //       axios.get("/branch/edit-branch").then(response => {
    //           if (response.data.length === 0) {
    //             // this.$dialogs.alert("ไม่พบข้อมูล", options);
    //             // this.dataBilling=[];
    //           } else {
    //             // this.cNotBook = response.data.cNotBook;
    //             // this.cBooked = response.data.cBooked;
    //             // this.total = response.data.total;
    //           }
    //         })
    //         .catch(function(error) {
    //           console.log(error);
    //         });
    //     },
    //     addBranch() {

    //       this.$router.push({name: 'AddBranch', params: { action: 'add' }});
    //     },
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