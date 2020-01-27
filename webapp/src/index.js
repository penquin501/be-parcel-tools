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

app.get("/tools/parcel/size/list", function(req, res) {
  parcelServices.parcelSizeList().then(function(data) {
    res.json({
      status: "SUCCESS",
      parcelSizeList: data
    });
  });
});

app.post("/save/cancel/tracking", function(req, res) {
  let tracking = req.body.tracking;
  let billing_no = req.body.billing_no;
  let previous_value = req.body.previous_value;
  let current_value = "cancel";
  let module_name = "cancel_tracking";
  let user = req.body.user;

  parcelServices.updateStatusReceiver(tracking).then(function(data) {});
  mainServices.updateStatusCancelTracking(tracking).then(function(data) {});
  parcelServices.insertLog(billing_no,previous_value,current_value,module_name,user,tracking).then(function(data) {});

  res.json({ status: "SUCCESS" });
});

app.post("/save/cancel/billing", function(req, res) {
  console.log(req.body.billing_no);
  let billing_no = req.body.billing_no;
  let previous_value = req.body.previous_value;
  let current_value = "cancel";
  let module_name = "cancel_billing";
  let user = req.body.user;

  parcelServices.updateStatusBilling(billing_no).then(function(data) {});
  mainServices.updateStatusCancelBilling(billing_no).then(function(data) {});
  parcelServices.insertLog(billing_no,previous_value, current_value,module_name,user,billing_no).then(function(data) {});
  res.json({ status: "SUCCESS" });
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

app.post("/confirm/match/data/info", function(req, res) {
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
  parcelServices.insertLog(billing_no,previous_value,log_current_value,module_name,user,tracking).then(function(data) {});
  
  res.json({ status: "SUCCESS" });
});

app.listen(port, () => console.log(`listening on port ${port}!`));
