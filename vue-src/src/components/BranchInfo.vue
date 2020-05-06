<template>
    <div class="container" style="margin-top: 60px;">
        <div style="text-align: center; margin-top: 100px;">
            <b style="font-size:18px;">รายการข้อมูลสาขา</b>
        </div>

        <div class="row">
            <div class="col-ms-9 col-sm-9 col-xs-9"></div>
            <div class="col-ms-2 col-sm-2 col-xs-2" style="text-align:right;"><label style="margin-top: 5px;">Refresh</label></div>
            <div class="col-ms-1 col-sm-1 col-xs-1" style="margin-bottom: 5px;">
                <button class="button-re"  v-on:click="getlistPhoneNumber()"><i class="fa fa-refresh" aria-hidden="true"></i></button>
            </div>
        </div>
      <table>
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
            <button v-on:click="setlist(item.phoneNumber)" class="button-list"><i class="fa fa-bars" aria-hidden="true"></i></button>
          </td>
          </tr>
      </table>

  </div>
</template>

<script>
export default {

}
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

th, td {
  text-align: left;
  padding: 8px;
}

tr:nth-child(even){background-color: #f2f2f2}
</style>