require('dotenv').config()
const express = require("express");
const request = require("request");
const path = require("path");
var xl = require("excel4node");
var mailer = require("nodemailer");
const app = express();
const moment = require("moment");
const m = require("moment-timezone");
const port = process.env.PORT || 3000;
moment.locale("th");
app.use(express.json());
app.use(express.static("public"));

// const mainServices = require("./services/mainService.js");
const parcelServices = require("./services/parcelService.js");

if (process.env.NODE_ENV === 'production') {
  console.log('In production mode');
} else {
  console.log('In development mode');
}
app.use(express.static("public"));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");  
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  next();
});

app.post("/test-dhl-response", function(req, res) {
  var input_data= req.body
  var tracking=input_data.manifestRequest.bd.shipmentItems[0].shipmentID;

  var statusCode="";
  var message="";

  parcelServices.saveTracking(tracking).then(function(data) {
    if(data===true){
      statusCode="200";
      message="SUCCESS";
    } else {
      statusCode="400";
      message="FAILED";
    }

      var result_res={
      "manifestResponse": {
        "hdr": {
          "messageType": "SHIPMENT",
          "messageDateTime": new Date(),
          "messageVersion": "1.0",
          "messageLanguage": "en"
        },
        "bd": {
          "shipmentItems": [{
            "shipmentID": tracking,
            "deliveryConfirmationNo": null,
            "responseStatus": {
              "code": statusCode+"==> test",
              "message": message+"==> test",
              "messageDetails": [{
                "messageDetail": "Please provide a Shipment ID which has not been used within the last 97 days"
              }]
            }
          }],
          "responseStatus": {
            "code": statusCode,
            "message": message,
            "messageDetails": [{
              "messageDetail": "No shipments are processed due to run time/system errors;  Check shipment level response for more details"
            }]
          }
        }
      }
    };
  res.send(result_res);

  })
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
        res.json({
          status: "SUCCESS",
          imgCapture: dataImg,
          billingInfo: data
        });
        // mainServices.checkStatusParcelRef(tracking).then(function(data2) {});
      }
    });
  });
});

app.get("/check/info/billing", function(req, res) {
  let billing = req.query.billing;

  parcelServices.getBillingInfo(billing).then(function(data) {
    res.json({
      status: "SUCCESS",
      billingInfo: data
    });
    // mainServices.checkStatusBilling(billing).then(function(data2) {});
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

        var previous_value=previous_status+"/"+previous_total[0].total;
        var current_value="cancel/"+current_total;

        // mainServices.updateStatusCancelTracking(tracking).then(function(data) {});
        parcelServices.insertLog(billing_no,previous_value,current_value,module_name,user,tracking).then(function(data) {});

        res.json({ status: "SUCCESS" });
      })
    });
  })

  // request(
  //   {
  //     url: "https://www.945api.com/parcel/list/bill/data/api",
  //     method: "POST",
  //     body: data,
  //     json: true
  //   },
  //   (err, res2, body) => {});

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

        // mainServices.updateStatusCancelBilling(billing_no).then(function(data) {});
        parcelServices.insertLog(billing_no,previous_value, current_value,module_name,user,billing_no).then(function(data) {});
        res.json({ status: "SUCCESS" });
    
  })

  // request(
  //   {
  //     url: "https://www.945api.com/parcel/list/bill/data/api",
  //     method: "POST",
  //     body: data,
  //     json: true
  //   },
  //   (err, res2, body) => {});

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
  // mainServices.updateBillingReceiverInfo(tracking, receiver_name, phone, address).then(function(data) {});
  parcelServices.insertLog(billing_no,previous_value,log_current_value,module_name,user,tracking).then(function(data) {});
  res.json({ status: "SUCCESS" });

  // request(
  //   {
  //     url: "https://www.945api.com/parcel/list/bill/data/api",
  //     method: "POST",
  //     body: data,
  //     json: true
  //   },
  //   (err, res2, body) => {});

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
      let operation_key="";
      if(data.length<=0){
        operation_key="";
      } else {
        operation_key=data[0].operator_id;
      }
      parcelServices.selectPreviousTotal(billing_no).then(function(previous_total) {

        parcelServices.updateCheckerInfo(billing_no,tracking, size_id,size_price,cod_value,receiver_name, phone, address, parcel_type, district_id,district_name, amphur_id,amphur_name,province_id,province_name,zipcode).then(function(current_total) {
          if(current_total!==false){
            parcelServices.updateBilling(billing_no,current_total).then(function(data) {});
            parcelServices.saveLogQlChecker(branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key).then(function(data) {});
  
            log_previous_value+="/total="+previous_total[0].total;
            log_current_value+="/total="+current_total;
            parcelServices.insertLog(billing_no,log_previous_value,log_current_value,module_name,cs_name,tracking).then(function(data) {});
  
            res.json({ status: "SUCCESS" });
          }
          
        });
        
      })
        
    })
    
  });
});


app.get("/daily-report", (req, res) => {

  parcelServices.dailyReport().then(function(data) {
    if(data==false){
      res.json([]);
    } else{
      res.json(data);
    }
    
  });
});

app.get("/list-tracking-bill", (req, res) => {
  let billing_no = req.query.billing_no;

  parcelServices.dailyListTracking(billing_no).then(function(data) {
    if(data==false){
      res.json([]);
    } else{
      res.json(data);
    }
    
  });
});

var smtp = {
  pool: true,
  host: "smtp.gmail.com", //set to your host name or ip
  port: 587, //25, 465, 587 depend on your
  secure: false, // use SSL
  auth: {
    user: "booking@945holding.com", //user account
    pass: "0df8a533a82d162726f3754cfe38a6f1" //user password
  }
};

var smtpTransport = mailer.createTransport(smtp);

app.get("/dhl-excel", function(req, res) {
  var date_now=new Date();
  var current_date = m(date_now).tz("Asia/Bangkok").format("YYYY-MM-DD", true);
  var current_date_excel = m(date_now).tz("Asia/Bangkok").format("YYMMDDHHmmss", true);
  var random_number = Math.floor(Math.random() * (999 - 111)) + 111;
  var number_parcel = 0;

  var filename =
    "My945_Parcel_TDZ_" + current_date_excel + "_" + random_number + ".xlsx";
  var wb = new xl.Workbook();
  var ws = wb.addWorksheet("945holding_" + current_date);

  const bgStyle = wb.createStyle({
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor: "#0D701C",
      fgColor: "#0D701C"
    }
  });

  ws.cell(1, 1).string("Customer Confirmation Number").style(bgStyle);
  ws.cell(1, 2).string("Recipient").style(bgStyle);
  ws.cell(1, 3).string("AddressLine1").style(bgStyle);
  ws.cell(1, 4).string("AddressLine2").style(bgStyle);
  ws.cell(1, 5).string("District").style(bgStyle);
  ws.cell(1, 6).string("State").style(bgStyle);
  ws.cell(1, 7).string("Zip").style(bgStyle);
  ws.cell(1, 8).string("Phone").style(bgStyle);
  ws.cell(1, 9).string("COD Amount").style(bgStyle);
  ws.cell(1, 10).string("Insurance Amount").style(bgStyle);
  ws.cell(1, 11).string("Invoice(ref.)").style(bgStyle);

  parcelServices.getBookingLog().then(function(data) {
    if(data===null){
      res.end("no data");
    } else {
      number_parcel = data.length;
      for (i = 0; i < data.length; i++) {
        if (data[i].status == "fail") {
          var cellBgStyle = wb.createStyle({
            fill: {
              type: "pattern",
              patternType: "solid",
              bgColor: "#cc0000",
              fgColor: "#cc0000"
            }
          });
        } else {
          if ((i - 1) % 2 == 0) {
            var cellBgStyle = wb.createStyle({
              fill: {
                type: "pattern",
                patternType: "solid",
                bgColor: "#deede3",
                fgColor: "#deede3"
              }
            });
          } else {
            var cellBgStyle = wb.createStyle({
              fill: {
                type: "pattern",
                patternType: "solid",
                bgColor: "#c2e0ed",
                fgColor: "#c2e0ed"
              }
            });
          }
        }
        ws.cell(i + 2, 1).string(data[i].tracking).style(cellBgStyle);
        ws.cell(i + 2, 2).string(data[i].receiver_name).style(cellBgStyle);
        ws.cell(i + 2, 3).string(data[i].receiver_address).style(cellBgStyle);
        ws.cell(i + 2, 4).string("").style(cellBgStyle);
        ws.cell(i + 2, 5).string(data[i].DISTRICT_NAME).style(cellBgStyle);
        ws.cell(i + 2, 6).string(data[i].PROVINCE_NAME).style(cellBgStyle);
        ws.cell(i + 2, 7).string(data[i].zipcode).style(cellBgStyle);
        ws.cell(i + 2, 8).string(data[i].phone).style(cellBgStyle);
        ws.cell(i + 2, 9).number(data[i].cod_value).style(cellBgStyle);
        ws.cell(i + 2, 10).string("").style(cellBgStyle);
        ws.cell(i + 2, 11).string(data[i].billing_no).style(cellBgStyle);
      }
      wb.write(filename);
    }
    
    var mail = {
      from: "booking@945holding.com", //from email (option)
      to: "penquin501@gmail.com", //to email (require) cs@945holding.com
      subject: "TDZ-My945Parcel-" + current_date + " ", //subject
      html:
        ` &nbsp;Good day DHL team,<br><br>\r\n\r\n&nbsp;&nbsp;&nbsp;This attachment file is My945Parcel(945Holding) booking file for dhl express at ` +
        current_date +
        `<br>\r\n The total number of shipments : ` +
        number_parcel +
        ` pcs. <br>\r\n And so, this mail was generate by automatically system.<br>\r\n&nbsp;&nbsp;&nbsp;If you have any concerned or some question, Please contact to My945Parcel Call Center 0914271551<br><br>\r\n\r\n&nbsp;Best Regards,<br>\r\n&nbsp;945Holding`, //email body
      attachments: [
        {
          filename: filename,
          path: __dirname + "/" + filename
        }
      ]
    };

    smtpTransport.sendMail(mail, function(error, response) {
      smtpTransport.close();
      if (error) {
        //error handler
        console.log("send email error", error);
      } else {
        //success handler
        console.log("send email success");
        res.end("send email success");
      }
    });
  });

});

app.listen(port, () => console.log(`listening on port ${port}!`));
