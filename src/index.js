// require("dotenv").config();
const express = require("express");
const request = require("request");
const path = require("path");
var xl = require("excel4node");
var mailer = require("nodemailer");
const app = express();
const moment = require("moment");
const m = require("moment-timezone");

var fileSystem = require("fs");
var fastcsv = require("fast-csv");
const stringify = require('csv-stringify');

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
          res.json({ status: "data_not_found" });
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

  app.get("/check-availabel-tracking", (req, res) => {
    let tracking = req.query.tracking;

    checkAvailableTracking(tracking.toUpperCase()).then(result=>{
      res.send(result);
    });
  });

  app.post("/tools/void-billing", function(req, res) {
    let data = req.body;

    let billingNo = data.billingNo;
    let billingInfo = data.billingInfo;
    let billingStatus = data.billingStatus;
    let reason = data.reason;
    let remark = data.remark;
    let moduleName = data.moduleName;
    let user = data.user;

    let selectItems= data.selectItem;
    let currentMember = data.currentMember;

    if(moduleName !== undefined && moduleName !== null && moduleName !== "") {
      if(billingStatus == "cancel"){
        return res.json({ status: "ERROR", reason: "data_cancelled" });
      } else {
        if(billingNo !== undefined && billingNo !== null && billingNo !== ""){
          if(selectItems.length <= 0){
            /*change member */
            voidBilling(billingNo).then(resultVoidBilling => {
              if(resultVoidBilling){
                let listCancelTracking = billingInfo.billingItem;
                createBilling(billingInfo, billingInfo.billingItem, currentMember).then((resultCreateBilling)=>{
                  if(resultCreateBilling !== false){
                    async function saveLogItem() {
                      var listLogTracking = [];
                      var previous_value_log = billingStatus;
                      var current_value_log = "cancel";
                      await listCancelTracking.forEach(async (val,index) => {
                        listLogTracking.push(parcelServices.insertLog(db, billingNo, previous_value_log, current_value_log, reason, moduleName, user, val.tracking, remark));
                      })
                      var resultArr = await Promise.all(listLogTracking);
                      return resultArr;
                    }
                    saveLogItem().then(function(result) {
                      return res.json({ status: "SUCCESS", billingNo: resultCreateBilling.billingNo });
                    });
                    
                  } else {
                    return res.json({ status: "ERROR", reason: "cannot_restructure_billing" }); 
                  }
                });
              } else {
                return res.json({ status: "ERROR", reason: "cannot_void_billing" }); 
              }
            });
          } else {
            let billingItems = billingInfo.billingItem;

            listCheckItem=[];
            selectItems.forEach(selectItem => {
              var checkItem = billingItems.find(item => selectItem.tracking==item.tracking);
              if(checkItem == undefined){
                // ไม่เจอใน billing
                listCheckItem.push(false);
              } else {
                listCheckItem.push(true);
              }
            });
            var check_pass = true;
            listCheckItem.forEach(value =>{
              if(value == false){
                check_pass=false;
              }
            });
            if(!check_pass){
              return res.json({ status: "ERROR", reason: "data_not_found_in_billing" });
            } else {
              let listCancelTracking=[];
              let listCreateTracking=[];

              billingItems.forEach(item => {
                var checkCancelItem = selectItems.find(value => value.tracking==item.tracking);
                if(checkCancelItem !== undefined){
                  listCancelTracking.push(item);
                } else {
                  listCreateTracking.push(item);
                }
              });

              if(listCreateTracking.length<=0){
                /* cancel billing */
               voidBilling(billingNo).then(resultVoidBilling => {
                 if(resultVoidBilling){
                    async function cancelItem() {
                      var listTracking = [];
                      await listCancelTracking.forEach(async (val,index) => {
                        listTracking.push(parcelServices.updateStatusReceiver(db,'cancel',val.tracking));
                      })
                      var resultArr = await Promise.all(listTracking);
                      return resultArr;
                    }
                    cancelItem().then(function(result) {
                      parcelServices.updateCancelBilling(db, billingNo).then((resultBilling)=>{
                        if(resultBilling){
                          async function saveLogItem() {
                            var listLogTracking = [];
                            var previous_value_log = billingStatus;
                            var current_value_log = "cancel";
                            await listCancelTracking.forEach(async (val,index) => {
                              listLogTracking.push(parcelServices.insertLog(db, billingNo, previous_value_log, current_value_log, reason, moduleName, user, val.tracking, remark));
                            })
                            var resultArr = await Promise.all(listLogTracking);
                            return resultArr;
                          }
                          saveLogItem().then(function(result) {
                            return res.json({ status: "SUCCESS", billingNo: "" });
                          });
                        } else {
                          return res.json({ status: "ERROR", reason: "cannot_cancel_billing" }); 
                        }
                      });
                    });
                  } else {
                    return res.json({ status: "ERROR", reason: "cannot_void_billing" }); 
                 }
               });
                
              } else {
                /* cancel tracking */
              voidBilling(billingNo).then(resultVoidBilling => {
                if(resultVoidBilling){
                  async function cancelItem() {
                    var listTracking = [];
                    await listCancelTracking.forEach(async (val,index) => {
                      listTracking.push(parcelServices.updateStatusReceiver(db,'cancel',val.tracking));
                    })
                    var resultArr = await Promise.all(listTracking);
                    return resultArr;
                  }
                  cancelItem().then(function(result) {
                    createBilling(billingInfo, listCreateTracking, currentMember).then((resultCreateBilling)=>{
                      if(resultCreateBilling !== false){
                        async function saveLogItem() {
                          var listLogTracking = [];
                          var previous_value_log = billingStatus;
                          var current_value_log = "cancel";
                          await listCancelTracking.forEach(async (val,index) => {
                            listLogTracking.push(parcelServices.insertLog(db, billingNo, previous_value_log, current_value_log, reason, moduleName, user, val.tracking, remark));
                          })
                          var resultArr = await Promise.all(listLogTracking);
                          return resultArr;
                        }
                        saveLogItem().then(function(result) {

                          return res.json({ status: "SUCCESS", billingNo: resultCreateBilling.billingNo });
                        });
                        
                      } else {
                        return res.json({ status: "ERROR", reason: "cannot_restructure_billing" }); 
                      }
                    });
                  })
                 } else {
                    return res.json({ status: "ERROR", reason: "cannot_void_billing" }); 
                 }
              })
              }
            }
          }
        } else {
          return res.json({ status: "ERROR", reason: "data_no_billing_no" });
        }
      }
    } else {
      return res.json({ status: "ERROR", reason: "no_module_select" });
    }
  });

  app.post("/tools/relabel-tracking", function(req, res) {
    let data = req.body;
    let billingNo = data.billingNo;
    let billingStatus = data.billingStatus;

    let billingInfo = data.billingInfo;

    let currentValue = data.currentValue;
    
    let causeType = data.causeType;//1=บ.ผิดเอง, 2=shop ผิด
    let reason = data.reason;
    let remark = data.remark;
    let user = data.user;
    let moduleName = data.moduleName;

    if(moduleName == undefined && moduleName == null && moduleName == "") {
      return res.json({ status: "ERROR", reason: "no_module_select" });
    } else if(billingInfo == undefined) {
      return res.json({ status: "ERROR", reason: "no_data_was_created" });
    } else if(billingInfo.billing_status == 'cancel') {
      return res.json({ status: "ERROR", reason: "data_cancelled" });
    } else if(currentValue == undefined){
      return res.json({ status: "ERROR", reason: "no_data_to_relabeling" });
    } else if(causeType =="" || causeType==0 || causeType == undefined){
      return res.json({ status: "ERROR", reason: "no_cause_type" });
    } else if(reason == undefined){
      return res.json({ status: "ERROR", reason: "no_reason" });
    } else if(remark == undefined){
      return res.json({ status: "ERROR", reason: "no_remark" });
    } else if(user == undefined){
      return res.json({ status: "ERROR", reason: "no_user" });
    } else {
      if(currentValue.billingItem == undefined){
        return res.json({ status: "ERROR", reason: "no_new_data_item" });
      } else if(currentValue.receiverInfo == undefined){
        return res.json({ status: "ERROR", reason: "no_new_data_receiver" });
      } else {
        let billingItem = currentValue.billingItem;
        let receiverInfo = currentValue.receiverInfo;

        if(receiverInfo.keyAddress == undefined){
          return res.json({ status: "ERROR", reason: "no_new_data_address" });
        } else {
          let receiverAddress= receiverInfo.keyAddress;

          var resultList = [];
          item_valid = true;
          item_valid = isGenericValid(billingItem,"tracking",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(billingItem,"parcelType",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(billingItem,"sizeId",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(billingItem,"sizePrice",item_valid,resultList,billingItem.tracking);

          item_valid = isGenericValid(receiverInfo,"receiverName",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(receiverInfo,"phone",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(receiverInfo,"receiverAddress",item_valid,resultList,billingItem.tracking);

          item_valid = isGenericValid(receiverAddress,"DISTRICT_CODE",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(receiverAddress,"zipcode",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(receiverAddress,"DISTRICT_ID",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(receiverAddress,"DISTRICT_NAME",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(receiverAddress,"AMPHUR_ID",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(receiverAddress,"AMPHUR_NAME",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(receiverAddress,"PROVINCE_ID",item_valid,resultList,billingItem.tracking);
          item_valid = isGenericValid(receiverAddress,"PROVINCE_NAME",item_valid,resultList,billingItem.tracking);

          if (billingItem.parcelType == "NORMAL" && billingItem.codValue !== 0) {
            item_valid=false;
          }
          if (billingItem.parcelType == "COD" && billingItem.codValue == 0) {
            item_valid=false;
          }

          if(!item_valid){
            return res.json({ status: "ERROR", reason: "no_complete_data_to_relabeling" });
          } else {
            checkAvailableTracking(billingItem.tracking.toUpperCase()).then(resultAvailableTracking=>{
              if(!resultAvailableTracking){
                return res.json({ status: "ERROR", reason: "tracking_not_available" });
              } else {
                /* start process relabel */
                parcelServices.updateStatusReceiver(db,'relabel',billingInfo.tracking).then(resultUpdateStatus => {
                  if(resultUpdateStatus !== false){
                    parcelServices.selectBillingInfo(db, billingInfo.billing_no).then(resultBilling => {
                        createBillingRelabel(resultBilling, billingInfo, currentValue, causeType).then(resultCreateBilling => {
                          if (resultCreateBilling !== false) {

                            var dataToPrepareBooking = {
                              tracking: billingItem.tracking,
                              source: "RELABEL"
                            };
                            amqpChannel.publish("parcel.exchange.prepare-booking", "", Buffer.from(JSON.stringify(dataToPrepareBooking)), { persistent: true });

                            var previous_value_log = billingInfo.status + "/" + billingInfo.tracking;
                            var current_value_log = "relabel" + "/" + billingItem.tracking;

                            parcelServices.insertLog(db, billingInfo.billing_no, previous_value_log, current_value_log, reason, moduleName, user, billingInfo.tracking, remark);
                            return res.json({
                              status: "SUCCESS",
                              billingNo: resultCreateBilling.billingNo
                            });
                          } else {
                            return res.json({
                              status: "ERROR",
                              reason: "cannot_relabel_billing"
                            });
                          }
                        });
                      });
                  } else {
                    return res.json({ status: "ERROR", reason: "cannot_update_status_tracking" }); 
                  }
                });
                /*******/
              }
            });
          }
        }
      } 
    }
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

    var currentDate = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD");
    var flagDate = moment(today+" 18:00:00").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var startDate = moment(today+" 18:00:00").add(-1,'day').tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var endDate = moment(today+" 18:00:00").add(1,'day').tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    parcelServices.selectBillingInfo(db,billing_no).then(function(previous_total) {

      if (status == "cancel") {
        return res.json({ status: "ERROR", reason: "data_cancelled" });
      } else if (status == "success") {
        return res.json({ status: "ERROR", reason: "data_sending_to_server" });
      } else {
        var billingDate=moment(previous_total[0].billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true)
        var checkDateTime=true;

        if(billingDate > flagDate){
          //วัน/เวลาของบิล ที่ทำรายการหลัง 18.00 น.
          if(currentDate > flagDate && currentDate <= endDate) {
            checkDateTime=true;
          } else {
            checkDateTime=false;
          }
        } else {
          //วัน/เวลาของบิล ที่ทำรายการก่อน 18.00 น.

          if(currentDate > startDate && currentDate <= flagDate) {
            checkDateTime=true;
          } else {
            checkDateTime=false;
          }
        }

        if(!checkDateTime){
          return res.json({ status: "ERROR", reason: "data_overtime" });
        } else {
          parcelServices.updateStatusReceiver(db,'cancel',val.tracking).then(function(res_update_status) {
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

                  var dataTo945 = {
                    billNo: previous_value[0].billing_no,
                    trackingNo: previous_value[0].tracking,
                    orderDateTime: m(previous_total[0].billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true),
                    orderPrice: previous_value[0].size_price,
                    orderPhoneNo: previous_value[0].phone,
                    parcelMethod: previous_value[0].bi_parcel_type
                  };
                  amqpChannel.publish("parcel.exchange.cancel-task","",Buffer.from(JSON.stringify(dataTo945)),{persistent: true});
                  amqpChannel.publish("share.exchange.cancel-task","",Buffer.from(JSON.stringify(dataTo945)),{persistent: true});
  
                  return res.json({ status: "SUCCESS" });
                });
            } else {
              return res.json({ status: "ERROR", reason: "No_data" });
            }
          });
        }
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
      var currentDate = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD");
    var flagDate = moment(today+" 18:00:00").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var startDate = moment(today+" 18:00:00").add(-1,'day').tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var endDate = moment(today+" 18:00:00").add(1,'day').tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    parcelServices.selectBillingInfo(db,billing_no).then(function(previous_total) {
      var billingDate=moment(previous_total[0].billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true)
      var checkDateTime=true;

      if(billingDate > flagDate){
        //วัน/เวลาของบิล ที่ทำรายการหลัง 18.00 น.
        if(currentDate > flagDate && currentDate <= endDate) {
          checkDateTime=true;
        } else {
          checkDateTime=false;
        }
      } else {
        //วัน/เวลาของบิล ที่ทำรายการก่อน 18.00 น.

        if(currentDate > startDate && currentDate <= flagDate) {
          checkDateTime=true;
        } else {
          checkDateTime=false;
        }
      }

      if(!checkDateTime){
        return res.json({ status: "ERROR", reason: "data_overtime" });
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

        if (status == "cancel") {
          res.json({ status: "ERROR", reason: "data_cancelled" });
        } else if (status == "success") {
          res.json({ status: "ERROR", reason: "data_sending_to_server" });
        } else {
          parcelServices.updateStatusReceiver(db,'cancel',val.tracking).then(function(res_update_status) {
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
                    var dataTo945 = {
                      billNo: previous_value[0].billing_no,
                      trackingNo: previous_value[0].tracking,
                      orderDateTime: m(previous_total[0].billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true),
                      orderPrice: previous_value[0].size_price,
                      orderPhoneNo: previous_value[0].phone,
                      parcelMethod: previous_value[0].bi_parcel_type
                    };
                    amqpChannel.publish("parcel.exchange.cancel-task","",Buffer.from(JSON.stringify(dataTo945)),{persistent: true});
                    amqpChannel.publish("share.exchange.cancel-task","",Buffer.from(JSON.stringify(dataTo945)),{persistent: true});

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

      listTrackingNotMatch=[];
      data.forEach(value => {
        var resultList = [];
        var valid = true;
        valid = isMatched(valid,value.bi_type,value.br_type,value.bi_zipcode,value.br_zipcode,value.cod_value,resultList = null,value.tracking);
        if(!valid){
          listTrackingNotMatch.push(value);
        }
      });

      if (listTrackingNotMatch.length<=0) {
        res.json({ status: "ERR_NO_TRACKING" });
      } else {
        branch_info = {}
        
        listTrackingNotMatch.forEach(value => {
  
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

    var currentDate = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD");
    var flagDate = moment(today+" 18:00:00").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var startDate = moment(today+" 18:00:00").add(-1,'day').tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var endDate = moment(today+" 18:00:00").add(1,'day').tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var billingDate=moment(previous_value.billingNo.billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true)
        var checkDateTime=true;

        if(billingDate > flagDate){
          //วัน/เวลาของบิล ที่ทำรายการหลัง 18.00 น.
          if(currentDate > flagDate && currentDate <= endDate) {
            checkDateTime=true;
          } else {
            checkDateTime=false;
          }
        } else {
          //วัน/เวลาของบิล ที่ทำรายการก่อน 18.00 น.

          if(currentDate > startDate && currentDate <= flagDate) {
            checkDateTime=true;
          } else {
            checkDateTime=false;
          }
        }

        if(!checkDateTime){
          return res.json({ status: "ERROR", reason: "data_overtime" });
        } else {
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

                var dataTo945 = {
                  billNo: billing_no,
                  orderDateTime: moment(previous_value.billingNo.billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true),
                  previousMemberCode: previous_value.billingNo.member_code,
                  currentMemberCode: current_value.current_member_code
                };
                amqpChannel.publish("parcel.exchange.update-member","",Buffer.from(JSON.stringify(dataTo945)),{persistent: true});
                amqpChannel.publish("share.exchange.update-member","",Buffer.from(JSON.stringify(dataTo945)),{persistent: true});
                res.json({ status: "SUCCESS" });
              });
            } else {
              res.json({ status: "error_data_not_found" });
            }
            
          });
        }
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
    let dateCheck = req.query.date_check;
    parcelServices.logDailyTool(db,dateCheck).then(function(data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  /******************************************** extra tools ********************************************/
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

  app.get("/create-csv",function(req, res) {
    let date_check = req.query.date_check;
    parcelServices.selectBillData(db,date_check).then(function(data) {
      if(!data){
        res.end('no data');
      } else {
        data.forEach((val)=>{
          val.billing_date=m(val.billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
        })
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + m().tz("Asia/Bangkok").format("YYYYMMDDHHmmss") + '.csv\"');
        stringify(data, { header: true })
        .pipe(res);
      }
    })
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

  app.post("/resume-booking-to-queue", function(req, res) {
    if (req.headers['apikey'] != 'XbOiHrrpH8aQXObcWj69XAom1b0ac5eda2b') {
      return res.send(401, 'Unauthorized');
    } else {
      let tracking = req.body.tracking;
      // let source = req.body.source;
      var data = {
        tracking: tracking.toUpperCase(),
        source: "ReBOOKING"
      };
      amqpChannel.publish("parcel.exchange.prepare-booking","",Buffer.from(JSON.stringify(data)),{persistent: true});
      res.json(data);
    }
  });

  app.post("/resend-bill-to-queue", function(req, res) {
    if (req.headers['apikey'] != 'XbOiHrrpH8aQXObcWj69XAom1b0ac5eda2b') {
      return res.send(401, 'Unauthorized');
    } else {
      let billing_no = req.body.billing_no;
      let module_name = "resend_bill_to_queue";
      let reason = req.body.reason;
      let remark = req.body.remark;
      let user = req.body.user;
  
      parcelServices.sendDataToServer(db, billing_no).then(function(data_to_945) {
        if(data_to_945 !== false){
          let log_previous_value = billing_no+'/complete';
          let log_current_value = billing_no+'/complete';
          parcelServices.insertLog(db,billing_no,log_previous_value,log_current_value,reason,module_name,user,billing_no,remark).then(function(dataLog) {
            // amqpChannel.publish("parcel.exchange.event","",Buffer.from(JSON.stringify(data_to_945)),{persistent: true});
            amqpChannel.publish("share.exchange.event","",Buffer.from(JSON.stringify(data_to_945)),{persistent: true});
            res.json(data_to_945);
          });
        } else {
          res.json({status:"data_not_found"});
        }
      });
    }
  });

  app.post("/resend-tracking-to-queue", function(req, res) {
    if (req.headers['apikey'] != 'XbOiHrrpH8aQXObcWj69XAom1b0ac5eda2b') {
      return res.send(401, 'Unauthorized');
    } else {
      let tracking = req.body.tracking;
      let billing_no = req.body.billing_no;
      let module_name = "resend_tracking_to_queue";
      let reason = req.body.reason;
      let remark = req.body.remark;
      let user = req.body.user;
  
      parcelServices.selectDataToExchangeUpdateBooking(db, tracking).then(function(data_to_945) {
        if(data_to_945 !== false){
          let log_previous_value = tracking+'/booked';
          let log_current_value = tracking+'/booked';
          parcelServices.insertLog(db,billing_no,log_previous_value,log_current_value,reason,module_name,user,tracking,remark).then(function(dataLog) {
            // amqpChannel.publish(EXCHANGE_UPDATE_BOOKING,"",Buffer.from(JSON.stringify(results)),{persistent: true});
            amqpChannel.publish("share.exchange.task-update","",Buffer.from(JSON.stringify(data_to_945)),{persistent: true});
            res.json(data_to_945);
          });
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
  /*******************************************************************************************************************************/
  /**************************************************Specify Function*************************************************************/
  function checkAvailableTracking(tracking) {
    let trackings = [];
    var trackingItem = {
      tracking: tracking
    };
    trackings.push(trackingItem);
    var data2 = {
      trackingList: trackings
    };
    return new Promise(function(resolve, reject) {
      request(
        {
          url: "https://www.945api.com/parcel/check/tracking/list/api",
          method: "POST",
          body: data2,
          json: true
        },
        (err, res2, body) => {
          if (err === null) {
            if (res2.body.status != true) {
              resolve(false);
            } else {
              parcelServices.checkDuplicatedTracking(db,tracking).then(function(data) {
                resolve(data);
              });
            }
          }
        }
      );
    });
  }

  function voidBilling(billingNo){
    return new Promise(function(resolve, reject) {
      parcelServices.sendDataToServer(db,billingNo).then((dataTo945)=>{
        if(dataTo945==false){
          resolve(false);
        } else {
          amqpChannel.publish("parcel.exchange.void-billing","",Buffer.from(JSON.stringify(dataTo945)),{persistent: true});
          amqpChannel.publish("share.exchange.void-billing","",Buffer.from(JSON.stringify(dataTo945)),{persistent: true});
          resolve(true);
        }
      });
    })
  }

  function createBilling(billingInfo, listCreateTracking, currentMember) {
    return new Promise(function(resolve, reject) {
      var dataCreateBillingNo = {
        user_id: billingInfo.billing.user_id,
        branch_id: billingInfo.billing.branch_id
      }
      request(
      {
        url: "https://pos.945.report/genBillNo/genBillingNumber",
        method: "POST",
        body: dataCreateBillingNo,
        json: true
      },(err, res2, body) => {
        var newBillingNo=res2.body;
  
        var total=0;
        listCreateTracking.forEach(value => {
          total+=value.size_price;
        });
  
        parcelServices.saveDataBilling(db, billingInfo.billing, currentMember, total, newBillingNo).then((data)=>{
          if(data){
            async function item() {
              var listTracking = [];
              await listCreateTracking.forEach(async (item,index) => {
                listTracking.push(parcelServices.updateBillingNoItem(db, newBillingNo, item, currentMember));
              })
              var resultArr = await Promise.all(listTracking);
              return resultArr;
            }
            item().then(function(result) {
              if(result.length==listCreateTracking.length){
                parcelServices.updateStatusBilling(db, newBillingNo).then((resultUpdateBilling)=>{
                  if(resultUpdateBilling){
                    parcelServices.sendDataToServer(db, newBillingNo).then((dataTo945)=>{
                        amqpChannel.publish("parcel.exchange.restructure-billing","",Buffer.from(JSON.stringify(dataTo945)),{persistent: true});
                        amqpChannel.publish("share.exchange.restructure-billing","",Buffer.from(JSON.stringify(dataTo945)),{persistent: true});

                        console.log("create billing = %s",newBillingNo);
                        resolve({
                          status: "success",
                          billingNo: newBillingNo});
                    })
                  } else {
                    resolve(false);
                  }
                }) 
              } else {
                resolve(false);
              }
            })
          } else {
            resolve(false);
          }
        })
      });
    });
  }

  function createBillingRelabel(billingInfo, billingItemInfo, currentValue, causeType) {
    return new Promise(function(resolve, reject) {
      var dataCreateBillingNo = {
        user_id: billingInfo[0].user_id,
        branch_id: billingInfo[0].branch_id
      }
      request(
      {
        url: "https://pos.945.report/genBillNo/genBillingNumber",
        method: "POST",
        body: dataCreateBillingNo,
        json: true
      },(err, res2, body) => {
        var newBillingNo=res2.body;
        var total=0;

        console.log("create billing relabel = %s",newBillingNo);
        if(causeType==1){
          currentValue.billingItem.sizePrice=0;
          total=0;
        } else {
          total=currentValue.billingItem.sizePrice;
        }
  
        parcelServices.saveDataBillingRelabel(db, billingInfo[0], total, newBillingNo).then((dataBilling)=>{
          if(dataBilling){
            parcelServices.saveDataBillingItemRelabel(db, newBillingNo, billingItemInfo, currentValue).then((dataBillingItem)=>{
                if(dataBillingItem){

                  parcelServices.updateStatusBilling(db, newBillingNo).then((resultUpdateBilling)=>{
                  if(resultUpdateBilling) {
                    /* start relabel to main server */
                    var listBilling = [
                      {
                        billingNo: billingInfo[0].billing_no,
                        tracking: billingItemInfo.tracking
                      },
                      {
                        billingNo: newBillingNo,
                        tracking: currentValue.billingItem.tracking
                      }
                    ];

                    var listDataToServer=[];

                    async function setFormatToServer() {
                      for(i=0;i<listBilling.length;i++){
                        listDataToServer.push(parcelServices.sendRelabelDataToServer(db, listBilling[i].billingNo, listBilling[i].tracking));
                      }
                      var resultArr = await Promise.all(listDataToServer);
                      return resultArr;
                    }
                    setFormatToServer().then(function(result) {
                      var dataTo945={
                        relabelBilling:result[0],
                        restructureBilling: result[1]
                      };
                      // console.log("dataTo945", JSON.stringify(dataTo945));
                      amqpChannel.publish("parcel.exchange.relabel-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
                      amqpChannel.publish("share.exchange.relabel-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });

                      resolve({
                        status: "success",
                        billingNo: newBillingNo
                      });
                    });
                  } else {
                    resolve(false);
                  }
                }); 
                } else {
                  resolve(false);
                }
            });
          } else {
            resolve(false);
          }
        });
      });
    });
  }

  /*******************************************************************************************************************************/
  function isGenericValid(data,key,defaultValue,resultList = null,check_tracking) {
    var out = [];

    if (resultList != null) {
      out = resultList;
    }
    if (data[key] == "") {
      return false;
    }
    if (data[key] == null) {
      return false;
    }
    if (data[key] == undefined) {
      return false;
    }
    // console.log(out);
    return defaultValue;
  }
  function isMatched(defaultValue,bi_type,br_type,bi_zipcode,br_zipcode,cod_value,resultList = null,check_tracking) {
    var out = [];
    if (resultList != null) {
      out = resultList;
    }
  
    if (bi_type == "NORMAL" && cod_value !== 0) {
      return false;
    }
  
    if (bi_type == "COD" && cod_value == 0) {
      return false;
    }
  
    if (bi_type !== br_type) {
      return false;
    }
  
    if (bi_zipcode !== br_zipcode) {
      return false;
    }
    return defaultValue;
  }
  
})
// app.get("/", function (req, res) {
//   res.json({ 'hello': 'World' });
// });

app.listen(port, () => console.log(`listening on port ${port}!`));


