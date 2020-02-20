const express = require("express");
const request = require("request");
const path = require("path");
const app = express();
const moment = require("moment");
const port = process.env.PORT || 3200;
moment.locale("th");
app.use(express.json());
app.use(express.static("public"));

const mainServices = require("./services/mainService.js");
const parcelServices = require("./services/parcelService.js");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  next();
});

// app.get("/", function (req, res) {
//   res.json({ 'hello': 'World' });
// });

app.get("/", function(req, res) {
  res.sendFile(path.resolve("public/index.html"));
});

app.get("/check/info/tracking", function(req, res) {
  let tracking = req.query.tracking;
  parcelServices.getTrackingImgUrl(tracking).then(function(dataImg) {
    parcelServices.getBillingItemTracking(tracking).then(function(data) {
      if (data.length == 0 || data == false) {
        res.json({ status: "ERR_NO_DATA_PARCEL" });
      } else {
        mainServices.checkStatusParcelRef(tracking).then(function(data2) {
          res.json({
            status: "SUCCESS",
            imgCapture: dataImg,
            billingInfo: data,
            statusParcel: data2
          });
          // }
        });
      }
    });
  });
});

app.get("/check/info/billing", function(req, res) {
  let billing = req.query.billing;
  console.log(billing);
  parcelServices.getBillingInfo(billing).then(function(data) {
    mainServices.checkStatusBilling(billing).then(function(data2) {
      res.json({
        status: "SUCCESS",
        billingInfo: data,
        statusParcel: data2
      });
    });
  });
});

app.post("/save/cancel/tracking", function(req, res) {
  console.log("save_cancel_tracking",req.body.tracking);
  let tracking = req.body.tracking;
  let billing_no = req.body.billing_no;
  let previous_status = req.body.previous_value;
  // let current_value = "cancel";
  let module_name = "cancel_tracking";
  let user = req.body.user;

  parcelServices.selectBillingInfo(billing_no).then(function(previous_total) {

    parcelServices.updateStatusReceiver(tracking).then(function(data) {
      parcelServices.selectParcelSize(billing_no).then(function(dataListPrice) {

        let current_total=0;
        for(i=0;i<dataListPrice.length;i++){
          current_total+=dataListPrice[i].size_price;
        }

        parcelServices.updateBillingInfo(current_total,billing_no).then(function(data) {})

        var previous_value=previous_status+"/"+previous_total[0].total
        var current_value="cancel/"+current_total

        mainServices.updateStatusCancelTracking(tracking).then(function(data) {});
        parcelServices.insertLog(billing_no,previous_value,current_value,module_name,user,tracking).then(function(data) {});

        res.json({ status: "SUCCESS" });
      })
    });
  })
});

app.post("/save/cancel/billing", function(req, res) {
  let billing_no = req.body.billing_no;
  let previous_status = req.body.previous_value;
  // let current_value = "cancel";
  let module_name = "cancel_billing";
  let user = req.body.user;

  parcelServices.selectBillingInfo(billing_no).then(function(previous_total) {

    parcelServices.updateStatusBilling(billing_no).then(function(data) {})

        let current_total=0;
        parcelServices.updateBillingInfo(current_total,billing_no).then(function(data) {})

        var previous_value=previous_status+"/"+previous_total[0].total
        var current_value="cancel/"+current_total

        mainServices.updateStatusCancelBilling(billing_no).then(function(data) {});
        parcelServices.insertLog(billing_no,previous_value, current_value,module_name,user,billing_no).then(function(data) {});
        res.json({ status: "SUCCESS" });
    
  })
});

app.post("/update/receiver/info", function(req, res) {
  let tracking = req.body.tracking;
  let billing_no = req.body.billing_no;
  let previous_value = req.body.previous_value;

  let current_value = req.body.current_value;
  let receiver_name = current_value.first_name + " " + current_value.last_name;
  let phone = current_value.phone;
  let address = current_value.address;

  let log_current_value = receiver_name + "/" + phone + "/" + address;

  let module_name = "change_receiver_info";
  let user = req.body.user;

  parcelServices.updateReceiverInfo(tracking, receiver_name, phone, address).then(function(data) {});
  mainServices.updateBillingReceiverInfo(tracking, receiver_name, phone, address).then(function(data) {});
  parcelServices.insertLog(billing_no,previous_value,log_current_value,module_name,user,tracking).then(function(data) {});
  res.json({ status: "SUCCESS" });
});

app.get("/tools/list/tracking", function(req, res) {
  parcelServices.getListTrackingNotMatch().then(function(data) {
    if (data.length == 0 || data == false) {
      res.json({ status: "ERR_NO_TRACKING" });
    } else {
      res.json({
        status: "SUCCESS",
        listTracking: data
      });
    }
  });
});

// app.get("/tools/parcel/size/list", function(req, res) {
//   parcelServices.parcelSizeList().then(function(data) {
//     res.json({
//       status: "SUCCESS",
//       parcelSizeList: data
//     });
//   });
// });

app.get("/select/tracking/check", function(req, res) {
  let branch_id = req.query.branch_id;
  parcelServices.selectTrackingToCheck(branch_id).then(function(data) {
    res.json({
      status: "SUCCESS",
      tracking: data
    });
  });
});

app.post("/confirm/match/data/info", function(req, res) {
  let tracking = req.body.tracking;
  let billing_no = req.body.billing_no;
  let previous_value = req.body.previous_value;

  let current_value = req.body.current_value;

  let receiver_name = current_value.first_name + " " + current_value.last_name;
  let phone = current_value.phone;
  let address = current_value.address;
  let district_code = current_value.district_code;
  let parcel_type = current_value.parcel_type;
  let cod_value = current_value.cod_value;
  let size_id = current_value.size_id;
  let size_price = current_value.size_price;
  let br_zipcode = current_value.br_zipcode;

  let log_previous_value = previous_value.bi_parcel_type + "/" + previous_value.br_parcel_type + "/" + previous_value.bi_zipcode+"/"+previous_value.br_zipcode;
  let log_current_value = parcel_type + "/" + br_zipcode;
  let module_name = "ql_checker";
  // let user = req.body.user;
  let cs_name=req.body.user;

  parcelServices.addressInfo(district_code).then(function(data) {
    let addressInfo=data[0]
    let district_id=addressInfo.DISTRICT_ID;
    let district_name=addressInfo.DISTRICT_NAME;
    let amphur_id=addressInfo.AMPHUR_ID;
    let amphur_name=addressInfo.AMPHUR_NAME;
    let province_id=addressInfo.PROVINCE_ID;
    let province_name=addressInfo.PROVINCE_NAME;
    let zipcode=addressInfo.zipcode;

    let billing_no_str=billing_no.split('-');
    let branch_id=billing_no_str[0];
    let user_id=billing_no_str[1];

    let error_code;
    let error_maker;
    /* error_maker = shop staff,key operator, system */
    
    if(previous_value.bi_parcel_type!==previous_value.br_parcel_type){
      /* error_zipcode = zipcode ไม่ตรงกัน */
      error_code="error_parcel_type";

      if(parcel_type!==previous_value.bi_parcel_type){
        error_maker="shop staff";
      } else if(parcel_type!==previous_value.br_parcel_type){
        error_maker="key operator";
      } else {
        error_maker="system";
      }
    } else if(previous_value.bi_zipcode!==previous_value.br_zipcode){
      /* error_parcel_type = type ไม่ตรงกัน */
      error_code="error_zipcode";

      if(zipcode!==previous_value.bi_zipcode){
        error_maker="shop staff";
      } else if(parcel_type!==previous_value.br_zipcode){
        error_maker="key operator";
      } else {
        error_maker="system";
      }
    } else {
      error_code="both";
      error_maker="system";
    }

    console.log(error_code,error_maker);
    parcelServices.findOperator(tracking).then(function(data) {

      let operation_key=data[0].operator_id;

        parcelServices.updateCheckerInfo(tracking, size_id,size_price,cod_value,receiver_name, phone, address, parcel_type, district_id,district_name, amphur_id,amphur_name,province_id,province_name,zipcode).then(function(data) {});
        parcelServices.saveLogQlChecker(branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key).then(function(data) {});
        parcelServices.insertLog(billing_no,log_previous_value,log_current_value,module_name,user,tracking).then(function(data) {});
    })
    res.json({ status: "SUCCESS" });
  });
  
  
  
});

app.listen(port, () => console.log(`listening on port ${port}!`));
