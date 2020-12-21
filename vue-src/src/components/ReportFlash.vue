<template>
  <div style="margin-top: 60px;">
    <div class="container" style="overflow-x:auto;">
        <div class="row" style="margin-top: 68px;grid-gap: 10px;">
        <div class="col-2"></div>
        <div class="col-ms-4 col-sm-4 col-xs-4" style="text-align:center;border: 1px solid #000;padding: 10px 30px;">
            <img style="object-fit: contain;width: 100%;height: 100%;transform: rotate(0deg);" src="https://thaigifts.or.th/wp-content/uploads/2017/03/no-image.jpg" />
        </div>
        <div class="col-ms-4 col-sm-4 col-xs-4 mycontent" style="display: grid ;border: 1px solid #000;padding: 10px 30px;">
        <b>Tracking</b>
        <input style="text-align:left;"  @keyup="tracking = $event.target.value" id="tracking" class="form-control">
        <b>ชื่อ</b>
        <input  style="text-align:left;" @keyup="name = $event.target.value" id="name" class="form-control">
        <b>โทรศัพท์</b>
        <input  style="text-align:left;" @keyup="phone = $event.target.value" id="phone" class="form-control">
        <b>ตำบล</b>
        <input  style="text-align:left;" @keyup="district = $event.target.value" id="district" class="form-control">
        <b>อำเภอ</b>
        <input  style="text-align:left;" @keyup="amphoe = $event.target.value" id="amphoe" class="form-control">
        <b>จังหวัด</b>
        <input  style="text-align:left;" @keyup="province = $event.target.value" id="province" class="form-control">
        <b>รหัสไปรษณีย์</b>
        <input  style="text-align:left;" @keyup="zipcode = $event.target.value" id="zipcode" class="form-control">
        <b>ที่อยู่</b>
        <input  style="text-align:left;"  @keyup="address = $event.target.value" id="address" class="form-control">
        <div class="py-2 text-center">
        <button class="btn btn-primary" type="button"  @click="submit">บันทึก</button>
        </div>
        </div>
      </div> 
    </div>
    <div style="margin-top: 100px;"></div>
  </div>
</template>
<script>
export default {
      data: function() {
    return {
      date: new Date(),
      tracking:'',
      name: '',
      phone: '',
      district: '',
      amphoe: '',
      province: '',
      zipcode: '',
      address: ''
    };
  },
  mounted() {
  },
  methods: {
    submit () {
      console.log(this.tracking),
      console.log(this.name),
      console.log(this.phone),
      console.log(this.district),
      console.log(this.amphoe),
      console.log(this.province),
      console.log(this.zipcode),
      console.log(this.address);
      this.$router.push({ name: "ReportFlashbooking"});
    }
  },
};
</script>
<style lang="scss">
  .mycontent {
  input {
    background: none;
    border: none;
    border-bottom: 1px solid #000;
    width: 100%;
    margin: 0 0 10px 0;
    padding: 5px 10px;
    outline: none;
  }
}
</style>
