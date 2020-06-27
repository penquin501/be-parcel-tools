// require("dotenv").config();
const express = require("express");
const request = require("request");
const path = require("path");
var xl = require("excel4node");
var mailer = require("nodemailer");
const app = express();
const moment = require("moment");
const m = require("moment-timezone");
const port = process.env.PORT || 3000;

const initDb = require("./env/parceldb.js");
const initAmqp = require('./env/amqp');

moment.locale("th");
app.use(express.json());
app.use(express.static("public"));

const parcelServices = require("./services/parcelService.js");

if (process.env.NODE_ENV === "production") {
  console.log("In production mode");
} else {
  console.log("In development mode");
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  next();
});
Promise.all([initDb(),initAmqp()]).then((values)=> {
  const appCtx = {
      db: values[0],
      amqpChannel: values[1],
  }

  const db=values[0];
  const amqpChannel = values[1];

  require('./routers/branch')(app,appCtx);
  require('./routers/sizeInfo')(app,appCtx);

  app.get("/", function(req, res) {
    res.sendFile(path.resolve("public/index.html"));
  });
  
  app.get("/check/info/tracking", function(req, res) {
    let tracking = req.query.tracking;
    parcelServices.getTrackingImgUrl(db,tracking).then(function(dataImg) {
      parcelServices.getBillingItemTracking(db,tracking).then(function(data) {
        if (data.length == 0 || data == false) {
          res.json({ status: "ERR_NO_DATA_PARCEL" });
        } else {
          res.json({
            status: "SUCCESS",
            imgCapture: dataImg,
            billingInfo: data
          });
        }
      });
    });
  });
  
  app.get("/check/info/billing", function(req, res) {
    let billing = req.query.billing;
  
    parcelServices.getBillingInfo(db,billing).then(function(data) {
      if(data==false){
        res.json({
          status: "data_not_found"
        });
      } else {
        res.json({
          status: "SUCCESS",
          data
        });
      }
      
    });
  });
  
  app.post("/save/cancel/tracking", function(req, res) {
    console.log("save_cancel_tracking", req.body.tracking);
    let tracking = req.body.tracking;
    let billing_no = req.body.billing_no;
    let previous_value = req.body.previous_value;
    let reason = req.body.reason;
    let remark = req.body.remark;
    let module_name = "cancel_tracking";
    let user = req.body.user;
  
    let status = "";
    if (
      previous_value[0].status === null ||
      previous_value[0].status === undefined ||
      previous_value[0].status === ""
    ) {
      status = "";
    } else {
      status = previous_value[0].status;
    }
  
    parcelServices.selectBillingInfo(db,billing_no).then(function(previous_total) {
      var data_api = {
        billNo: previous_value[0].billing_no,
        trackingNo: previous_value[0].tracking,
        orderDateTime: m(previous_total[0].billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true),
        orderPrice: previous_value[0].size_price,
        orderPhoneNo: previous_value[0].phone,
        parcelMethod: previous_value[0].bi_parcel_type
      };
      if (status == "cancel") {
        res.json({ status: "ERROR", reason: "data_cancelled" });
      } else if (status == "success") {
        res.json({ status: "ERROR", reason: "data_sending_to_server" });
      } else if (status == "SUCCESS") {
        request(
          {
            url: process.env.W945_CANCEL_TRACKING_API,
            method: "POST",
            body: data_api,
            json: true,
            headers: {
              apikey: process.env.W945_APIKEY
            }
          },
          (err, res2, body) => {
            if (res2.body.status === "success") {
              parcelServices.updateStatusReceiver(db,tracking).then(function(res_update_status) {
                  if (res_update_status !== false) {
                    parcelServices.selectParcelSize(db,billing_no).then(function(dataListPrice) {
                      let current_total = 0;  
                        if(dataListPrice==0){
                          current_total = 0; 
                        } else {
                          for (i = 0; i < dataListPrice.length; i++) {
                            current_total += dataListPrice[i].size_price;
                          }
                        }
                        parcelServices.updateBillingInfo(db,current_total, billing_no).then(function(data) {});
                        var previous_value = status + "/total=" + previous_total[0].total;
                        var current_value = "cancel/total=" + current_total;
                        parcelServices.insertLog(db,billing_no,previous_value,current_value,reason,module_name,user,tracking,remark).then(function(data) {});
  
                        res.json({ status: "SUCCESS" });
                      });
                  } else {
                    res.json({ status: "ERROR", reason: "No_data" });
                  }
                });
            } else {
              res.json({ status: res2.body.status, reason: res2.body.reason });
            }
          }
        );
      } else {
        parcelServices.updateStatusReceiver(db,tracking).then(function(res_update_status) {
            if (res_update_status !== false) {
              parcelServices.selectParcelSize(db,billing_no).then(function(dataListPrice) {
                let current_total = 0;  
                if(dataListPrice==0){
                  current_total = 0; 
                } else {
                  for (i = 0; i < dataListPrice.length; i++) {
                    current_total += dataListPrice[i].size_price;
                  }
                }
                  parcelServices.updateBillingInfo(db,current_total, billing_no).then(function(data) {});
                  var previous_value =status + "/total=" + previous_total[0].total;
                  var current_value = "cancel/total=" + current_total;
                  parcelServices.insertLog(db,billing_no,previous_value,current_value,reason,module_name,user,tracking,remark).then(function(data) {});
  
                  res.json({ status: "SUCCESS" });
                });
            } else {
              res.json({ status: "ERROR", reason: "No_data" });
            }
          });
      }
    });
  });
  
  app.post("/save/cancel/billing", function(req, res) {
    let billing_no = req.body.billing_no;
    let billing_status=req.body.billing_status;
    let select_item=req.body.select_item;//ส่งค่าเก่าอยู่แล้ว
    let reason = req.body.reason;
    let remark = req.body.remark;
    let module_name = "cancel_billing";
    let user = req.body.user;
    
    if(select_item.length<=0) {
      res.json({ status: "ERROR", reason: "no_select_data" });
    } else if(billing_no == '') {
      res.json({ status: "ERROR", reason: "no_billing_to_cancel" });
    } else if(billing_status == 'cancel') {
      res.json({ status: "ERROR", reason: "billing_cancelled" });
    } else if(billing_status == 'pass') {
      res.json({ status: "ERROR", reason: "data_sending_to_server" });
    } else {
  
        async function item() {
          var listTracking = [];
          await select_item.forEach(async (val,index) => {
            listTracking.push(send_api(val,billing_no,reason,remark,user));
          })
          var resultArr = await Promise.all(listTracking);
          return resultArr;
        }
        item().then(function(result) {
  
          res.json({status:"SUCCESS",result:result});
        })
  
    }
  });
  function send_api(data,billing_no,reason,remark,user){
  
    return new Promise(function(resolve, reject) {
      let tracking = data.tracking;
      let pre_status=data.status;
      let module_name = "cancel_billing";
  
      let status = "";
      if (
        pre_status === null ||
        pre_status === undefined ||
        pre_status === ""
      ) {
        status = "";
      } else {
        status = pre_status;
      }
    
      parcelServices.selectBillingInfo(db,billing_no).then(function(previous_total) {
        var data_api = {
          billNo: billing_no,
          trackingNo: data.tracking,
          orderDateTime: m(previous_total[0].billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true),
          orderPrice: data.size_price,
          orderPhoneNo: data.phone,
          parcelMethod: data.parcel_type
        };
        if (status == "cancel") {
          res.json({ status: "ERROR", reason: "data_cancelled" });
        } else if (status == "success") {
          res.json({ status: "ERROR", reason: "data_sending_to_server" });
        } else if (status == "SUCCESS") {
          request(
            {
              url: process.env.W945_CANCEL_TRACKING_API,
              method: "POST",
              body: data_api,
              json: true,
              headers: {
                apikey: process.env.W945_APIKEY
              }
            },
            (err, res2, body) => {
              if (res2.body.status === "success") {
                parcelServices.updateStatusReceiver(db,tracking).then(function(res_update_status) {
                    if (res_update_status !== false) {
                      parcelServices.selectParcelSize(db,billing_no).then(function(dataListPrice) {
                        let current_total = 0;  
                          if(dataListPrice==0){
                            current_total = 0; 
                          } else {
                            for (i = 0; i < dataListPrice.length; i++) {
                              current_total += dataListPrice[i].size_price;
                            }
                          }
                          parcelServices.updateBillingInfo(db,current_total, billing_no).then(function(data) {});
                          var previous_value = status + "/total=" + previous_total[0].total;
                          var current_value = "cancel/total=" + current_total;
                          parcelServices.insertLog(db,billing_no,previous_value,current_value,reason,module_name,user,tracking,remark).then(function(data) {});
  
                          resolve({tracking:data.tracking,status:"SUCCESS",reason: ""});
                        });
                    } else {
                      resolve({tracking:data.tracking, status: "ERROR", reason: "No_data" });
                    }
                  });
              } else {
                resolve({tracking:data.tracking, status: res2.body.status, reason: res2.body.reason });
              }
            }
          );
        } else {
          parcelServices.updateStatusReceiver(db,tracking).then(function(res_update_status) {
              if (res_update_status !== false) {
                parcelServices.selectParcelSize(db,billing_no).then(function(dataListPrice) {
                  let current_total = 0;  
                  if(dataListPrice==0){
                    current_total = 0; 
                  } else {
                    for (i = 0; i < dataListPrice.length; i++) {
                      current_total += dataListPrice[i].size_price;
                    }
                  }
                    parcelServices.updateBillingInfo(db,current_total, billing_no).then(function(data) {});
                    var previous_value =status + "/total=" + previous_total[0].total;
                    var current_value = "cancel/total=" + current_total;
                    parcelServices.insertLog(db,billing_no,previous_value,current_value,reason,module_name,user,tracking,remark).then(function(data) {});
  
                    resolve({tracking:data.tracking,status:"SUCCESS",reason: ""});
                  });
              } else {
                resolve({tracking:data.tracking, status: "ERROR", reason: "No_data" });
              }
            });
        }
      });
    })
  }
  
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
    parcelServices.updateReceiverInfo(db,tracking, receiver_name, phone, address).then(function(data) {});
    parcelServices.insertLog(db,billing_no,previous_value,log_current_value,module_name,user,tracking).then(function(data) {});
    res.json({ status: "SUCCESS" });
  });
  
  app.get("/tools/list/tracking", function(req, res) {
    parcelServices.getListTrackingNotMatch(db).then(function(data) {
      if (!data) {
        res.json({ status: "ERR_NO_TRACKING" });
      } else {
        branch_info = {}
        
        data.forEach(value => {
  
          if(!(value.branch_id in branch_info)){
            branch_info[String(value.branch_id)]=[];
          }
          branch_info[String(value.branch_id)].push({
            branch_name: value.branch_name,
            tracking:value.tracking
          });
  
        });

        result=[];
        for (const [key, items] of Object.entries(branch_info)) {
          var dataBranch={
            branch_id:key,
            branch_name:items[0].branch_name,
            tracking: items[0].tracking,
            total: items.length
          }
          result.push(dataBranch);
        }
        res.json({
          status: "SUCCESS",
          listTracking: result
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
    parcelServices.selectTrackingToCheck(db,branch_id).then(function(data) {
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
    let log_previous_value = previous_value.bi_parcel_type +"/" +previous_value.br_parcel_type +"/" +previous_value.bi_zipcode +"/" +previous_value.br_zipcode;
    let log_current_value = parcel_type + "/" + br_zipcode;
    let module_name = "ql_checker";
    let cs_name = req.body.user;
  
    parcelServices.addressInfo(db,district_code).then(function(data) {
      let addressInfo = data[0];
      let district_id = addressInfo.DISTRICT_ID;
      let district_name = addressInfo.DISTRICT_NAME;
      let amphur_id = addressInfo.AMPHUR_ID;
      let amphur_name = addressInfo.AMPHUR_NAME;
      let province_id = addressInfo.PROVINCE_ID;
      let province_name = addressInfo.PROVINCE_NAME;
      let zipcode = addressInfo.zipcode;
  
      let billing_no_str = billing_no.split("-");
      let branch_id = billing_no_str[0];
      let user_id = billing_no_str[1];
  
      let error_code;
      let error_maker;
      let remark;
      /* error_maker = shop staff,key operator, system */
      if (previous_value.bi_parcel_type !== previous_value.br_parcel_type) {
        /* error_zipcode = zipcode ไม่ตรงกัน */
        error_code = "error_parcel_type";
        if (parcel_type !== previous_value.bi_parcel_type) {
          error_maker = "shop staff";
        } else if (parcel_type !== previous_value.br_parcel_type) {
          error_maker = "key operator";
        } else {
          error_maker = "system";
        }
      } else if (previous_value.bi_zipcode !== previous_value.br_zipcode) {
        /* error_parcel_type = type ไม่ตรงกัน */
        error_code = "error_zipcode";
  
        if (zipcode !== previous_value.bi_zipcode) {
          error_maker = "shop staff";
        } else if (parcel_type !== previous_value.br_zipcode) {
          error_maker = "key operator";
        } else {
          error_maker = "system";
        }
      } else {
        error_code = "both";
        error_maker = "system";
      }
      if(error_maker=="shop staff"){
        remark="สาขาทำรายการผิด"
      } 
      if(error_maker=="key operator"){
        remark="เจ้าหน้าที่คีย์ข้อมูลผิด"
      }
      if(error_maker=="system"){
        remark="ระบบเกิดความผิดพลาด"
      }
      console.log("confirm :", tracking, error_code, error_maker);
      parcelServices.findOperator(db,tracking).then(function(data) {
        let operation_key = "";
        if (data.length <= 0) {
          operation_key = "";
        } else {
          operation_key = data[0].operator_id;
        }
        parcelServices.selectBillingInfo(db,billing_no).then(function(previous_total) {
            parcelServices.updateCheckerInfo(db,billing_no,tracking,size_id,size_price,cod_value,receiver_name,phone,address,parcel_type,district_id,district_name,amphur_id,amphur_name,province_id,province_name,zipcode).then(function(current_total) {
                if (current_total !== false) {
                  parcelServices.updateBilling(db,billing_no, current_total).then(function(data) {});
                  parcelServices.saveLogQlChecker(db,branch_id,user_id,billing_no,error_code,error_maker,cs_name,tracking,operation_key).then(function(data) {});
  
                  log_previous_value += "/total=" + previous_total[0].total;
                  log_current_value += "/total=" + current_total;
                  parcelServices.insertLog(db,billing_no,log_previous_value,log_current_value,error_code,module_name,cs_name,tracking,remark).then(function(data) {});
                  /* ส่งเข้าคิว เพื่อไป booking ข้อมูล */
                  let data={
                    tracking:tracking,
                    source:"QLChecker"
                  }
                  amqpChannel.publish("parcel.exchange.prepare-booking","",Buffer.from(JSON.stringify(data)),{persistent: true});
                  res.json({ status: "SUCCESS" });
                } else {
                  res.json({ status: "ERROR" });
                }
              });
          });
      });
    });
  });

  app.post("/confirm-member-code", function(req, res) {
    let billing_no = req.body.billing_no;
    let previous_value = req.body.previous_value;
    let current_value = req.body.current_value;
    let billing_items=previous_value.billingItem;
    let log_previous_value = previous_value.billingNo.member_code + "/" + previous_value.billingNo.status;
    let log_current_value = current_value.current_member_code;
    let module_name = "change_member_code";
    let reason = req.body.reason;
    let remark = req.body.remark;
    let user = req.body.user;

    parcelServices.updateMemberBilling(db, billing_no, current_value.current_member_code).then(function(result_billing) {
      if(result_billing){
        async function item() {
          var listTracking = [];
          await billing_items.forEach(async (val, index) => {
            listTracking.push(parcelServices.updateSenderInfo(db,current_value.current_sender_name,current_value.current_sender_phone,current_value.current_sender_address,val.tracking));
          });
          var resultArr = await Promise.all(listTracking);
          return resultArr;
        }
        item().then(function(result) {
          parcelServices.insertLog(db,billing_no,log_previous_value,log_current_value,reason,module_name,user,billing_no,remark).then(function(data) {});
          res.json({ status: "SUCCESS" });
        });
      } else {
        res.json({ status: "error_data_not_found" });
      }
      
    });
    
  });

  app.get("/report-branch", (req, res) => {
    let date_check = req.query.date_check;
    parcelServices.reportBranch(db,date_check).then(function(data) {
      if (data == false) {
        res.json([]);
      } else {
        d = []
        branch_info = {}
        
        data.forEach(value => {
  
          if(!(value.branch_id in branch_info)){
            branch_info[String(value.branch_id)]=[];
          }
          branch_info[String(value.branch_id)].push({
            branch_name: value.branch_name,
            billing_no: value.billing_no,
            sender_name: value.sender_name,
            status: value.status,
            billing_date: value.billing_date,
            booking_status: value.booking_status
          });
  
        });
  
        result=[];
        for (const [key, items] of Object.entries(branch_info)) {
  
          var cBooked=0;
          var cNotBook=0;
          items.forEach(item => {
              if(item.booking_status==100){
                cBooked++;
              } else {
                cNotBook++;
              }
          })
          var dataBranch={
            branch_name:items[0].branch_name,
            cBooked: cBooked,
            c_not_book: cNotBook,
            total: items.length
          }
          result.push(dataBranch);
        }
        res.json(result);
      }
    });
  });
  
  app.get("/daily-report", (req, res) => {
    let date_check = req.query.date_check;
    parcelServices.dailyReport(db,date_check).then(function(data) {
      if (data == false) {
        res.json([]);
      } else {
        d = []
        branch_info = {}
        var sumBooked=0;
        var sumNotBooked=0;
        data.forEach(value => {
  
          if(!(value.billing_no in branch_info)){
            branch_info[String(value.billing_no)]=[];
          }
          branch_info[String(value.billing_no)].push({
            branch_id:value.branch_id,
            branch_name: value.branch_name,
            billing_no: value.billing_no,
            sender_name: value.sender_name,
            status: value.status,
            billing_date: value.billing_date,
            booking_status: value.booking_status
          });
          if(value.booking_status == 100){
            sumBooked++;
          } else {
            sumNotBooked++;
          }
        });
  
        result=[];
        for (const [key, items] of Object.entries(branch_info)) {
  
          var cBooked=0;
          var cNotBook=0;
          items.forEach(item => {
              if(item.booking_status==100){
                cBooked++;
              } else {
                cNotBook++;
              }
          })
          var dataBranch={
            branch_id:items[0].branch_id,
            branch_name:items[0].branch_name,
            billing_date: items[0].billing_date,
            billing_no: key,
            sender_name: items[0].sender_name,
            status: items[0].status,
            booked: cBooked,
            cNotBook: cNotBook,
            total: items.length
          }
          result.push(dataBranch);
        }
  
        var summary={
          total:data.length,
          sumBooked:sumBooked,
          sumNotBooked:sumNotBooked
        }
        res.json({result:result,summary:summary});
      }
    });
  });
  app.get("/summary-booking", (req, res) => {
    let date_check = req.query.date_check;
    parcelServices.summaryBooking(db,date_check).then(function(data) {
      if (data == false) {
        res.json([]);
      } else {
        var cBooked=0;
        var cNotBook=0;
        data.forEach((val)=>{
          if(val.booking_status == 100){
            cBooked++;
          } else {
            cNotBook++;
          }
        })
        var output={
          total:data.length,
          cBooked:cBooked,
          cNotBook:cNotBook
        }
        res.json(output);
      }
    });
  });
  app.get("/list-tracking-bill", (req, res) => {
    let billing_no = req.query.billing_no;
  
    parcelServices.dailyListTracking(db,billing_no).then(function(data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });
  
  app.get("/list-error-maker", (req, res) => {
    parcelServices.listErrorMaker(db).then(function(data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });
  
  app.get("/booking-report", (req, res) => {
    let tracking = req.query.tracking;
    parcelServices.bookingReport(db,tracking).then(function(data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });
  
  app.get("/log-parcel-tool", (req, res) => {
    let ref = req.query.ref;
    parcelServices.log_parcel_tool(db,ref).then(function(data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });
  
  app.get("/log-daily-tool", (req, res) => {
    let date_check = req.query.date_check;
    parcelServices.log_daily_tool(db,date_check).then(function(data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });
  /* extra tools */
  app.get("/check-data-item", function(req, res) {
    let tracking = req.query.tracking;
    parcelServices.selectDataItem(db,tracking).then(function(data) {
      if(!data){
        res.json({
          status: "error_not_found"
        });
      } else {
        res.json({
          status: "SUCCESS",
          data: data
        });
      }
    });
  });
  
  app.get("/check-data-receiver", function(req, res) {
    let tracking = req.query.tracking;
    parcelServices.selectDataReceiver(db,tracking).then(function(data) {
      if(!data){
        res.json({
          status: "error_not_found"
        });
      } else {
        res.json({
          status: "SUCCESS",
          data: data
        });
      }
    });
  });

  app.post("/generate-resend-bill", function(req, res) {
    if (req.headers['apikey'] != 'XbOiHrrpH8aQXObcWj69XAom1b0ac5eda2b') {
      return res.send(401, 'Unauthorized');
    } else {
      let billing_no = req.body.billing_no;

      let module_name = "generate_resend_bill";
      let reason = req.body.reason;
      let remark = req.body.remark;
      let user = req.body.user;
  
      parcelServices.getBillingInfo(db, billing_no).then(function(data) {
        if(data !== false){
          var billing_status = data.billingNo.status;
          if(billing_status == "SUCCESS" || billing_status == "pass"){
            let log_previous_value = billing_status;
            let log_current_value = 'booked';
             parcelServices.updateResendBilling(db,billing_no,billing_status).then(function(data) {
               if(data!==false){
                 if(data.affectedRows>0){
                  parcelServices.insertLog(db,billing_no,log_previous_value,log_current_value,reason,module_name,user,billing_no,remark).then(function(data) {});
                  res.json({status:"SUCCESS"});
                 } else {
                  res.json({status:"error_resend_bill"});
                 }
               } else {
                  res.json({status:"error_resend_bill"});
               }
             });       
          } else {
            res.json({status:"billing_status_can_not_resend"});
          }
        } else {
          res.json({status:"data_not_found"});
        }
      });
    }
    
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
  
  app.get("/get-excel-file", function(req, res) {
    var date_check=req.query.date_check;
  
    var date_now = new Date();
    var current_date = m(date_now).tz("Asia/Bangkok").format("YYYY-MM-DD", true);
    var current_date_excel = m(date_now).tz("Asia/Bangkok").format("YYMMDDHHmmss", true);
    var random_number = Math.floor(Math.random() * (999 - 111)) + 111;
    var number_parcel = 0;
  
    var filename ="My945_Parcel_TDZ_" + current_date_excel + "_" + random_number + ".xlsx";
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
  
    parcelServices.getDailyData(db,date_check).then(function(data) {
      if (data === null) {
        res.end("no data");
      } else {
        number_parcel = data.length;
        for (i = 0; i < data.length; i++) {
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
          ws.cell(i + 2, 1).string(data[i].tracking).style(cellBgStyle);
          ws.cell(i + 2, 2).string(data[i].receiver_name).style(cellBgStyle);
          ws.cell(i + 2, 3).string(data[i].receiver_address).style(cellBgStyle);
          ws.cell(i + 2, 4).string("").style(cellBgStyle);
          ws.cell(i + 2, 5).string(data[i].district_name).style(cellBgStyle);
          ws.cell(i + 2, 6).string(data[i].province_name).style(cellBgStyle);
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
        to: "penquin501@gmail.com, jade.yo@sunteen.co.th", //to email (require) cs@945holding.com
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
          res.end("send email error");
        } else {
          //success handler
          console.log("send email success");
          res.end("send email success");
        }
      });
    });
  });
  
  app.get("/get-excel-file-unbook", function(req, res) {
    var date_check=req.query.date_check;
    var date_now = new Date();
    var current_date = m(date_now).tz("Asia/Bangkok").format("YYYY-MM-DD", true);
    var current_date_excel = m(date_now).tz("Asia/Bangkok").format("YYMMDDHHmmss", true);
    var random_number = Math.floor(Math.random() * (999 - 111)) + 111;
    var number_parcel = 0;
  
    var filename ="My945_Parcel_TDZ_" + current_date_excel + "_" + random_number + ".xlsx";
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
  
    parcelServices.getDailyDataUnbook(db,date_check).then(function(result) {
      if (result === null) {
        res.end("no data");
      } else {
        listTracking=[];
        var resultList = [];
        result.forEach((value)=>{
          var item_valid = true;
          item_valid = true;
          item_valid = isGenericValid(value,"tracking",item_valid,resultList,value.tracking);
          item_valid = isGenericValid(value,"receiver_name",item_valid,resultList,value.tracking);
          item_valid = isGenericValid(value,"receiver_address",item_valid,resultList,value.tracking);
          item_valid = isGenericValid(value,"district_name",item_valid,resultList,value.tracking);
          item_valid = isGenericValid(value,"province_name",item_valid,resultList,value.tracking);
          item_valid = isGenericValid(value,"zipcode",item_valid,resultList,value.tracking);
          item_valid = isGenericValid(value,"phone",item_valid,resultList,value.tracking);
          item_valid = isGenericValid(value,"billing_no",item_valid,resultList,value.tracking);

          if(item_valid){
            listTracking.push(value);
          }
        })

        for (i = 0; i < listTracking.length; i++) {
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
          ws.cell(i + 2, 1).string(listTracking[i].tracking).style(cellBgStyle);
          ws.cell(i + 2, 2).string(listTracking[i].receiver_name).style(cellBgStyle);
          ws.cell(i + 2, 3).string(listTracking[i].receiver_address).style(cellBgStyle);
          ws.cell(i + 2, 4).string("").style(cellBgStyle);
          ws.cell(i + 2, 5).string(listTracking[i].district_name).style(cellBgStyle);
          ws.cell(i + 2, 6).string(listTracking[i].province_name).style(cellBgStyle);
          ws.cell(i + 2, 7).string(listTracking[i].zipcode).style(cellBgStyle);
          ws.cell(i + 2, 8).string(listTracking[i].phone).style(cellBgStyle);
          ws.cell(i + 2, 9).number(listTracking[i].cod_value).style(cellBgStyle);
          ws.cell(i + 2, 10).string("").style(cellBgStyle);
          ws.cell(i + 2, 11).string(listTracking[i].billing_no).style(cellBgStyle);
        }

        wb.write(filename,res);
        // wb.write(filename);//สร้างไฟล์ excel
      }
      /* ส่วนการส่ง mail */
      // var mail = {
      //   from: "booking@945holding.com", //from email (option)
      //   to: "penquin501@gmail.com, jade.yo@sunteen.co.th", //to email (require) cs@945holding.com
      //   subject: "TDZ-My945Parcel-" + current_date + " ", //subject
      //   html:
      //     ` &nbsp;Good day DHL team,<br><br>\r\n\r\n&nbsp;&nbsp;&nbsp;This attachment file is My945Parcel(945Holding) booking file for dhl express at ` +
      //     current_date +
      //     `<br>\r\n The total number of shipments : ` +
      //     listTracking.length +
      //     ` pcs. <br>\r\n And so, this mail was generate by automatically system.<br>\r\n&nbsp;&nbsp;&nbsp;If you have any concerned or some question, Please contact to My945Parcel Call Center 0914271551<br><br>\r\n\r\n&nbsp;Best Regards,<br>\r\n&nbsp;945Holding`, //email body
      //   attachments: [
      //     {
      //       filename: filename,
      //       path: __dirname + "/" + filename
      //     }
      //   ]
      // };
  
      // smtpTransport.sendMail(mail, function(error, response) {
      //   smtpTransport.close();
      //   if (error) {
      //     //error handler
      //     console.log("send email error", error);
      //     res.end("send email error");
      //   } else {
      //     //success handler
      //     console.log("send email success");
      //     res.end("send email success");
      //   }
      // });
    });
  });
  function isGenericValid(data,key,defaultValue,resultList = null,check_tracking) {
    var out = [];

    if (resultList != null) {
      out = resultList;
    }
    if (data[key] == "") {
      // out.push("" + check_tracking + " empty");
      console.log("" + check_tracking + " " + key + " empty");
      return false;
    }
    if (data[key] == null) {
      // out.push("" + check_tracking + " missing");
      console.log("" + check_tracking + " " + key + " missing");
      return false;
    }
    if (data[key] == undefined) {
      // out.push("" + check_tracking + " missing");
      console.log("" + check_tracking + " " + key + " missing");
      return false;
    }
    // console.log(out);
    return defaultValue;
  }
  
})
// app.get("/", function (req, res) {
//   res.json({ 'hello': 'World' });
// });

app.listen(port, () => console.log(`listening on port ${port}!`));


