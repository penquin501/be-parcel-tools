// require("dotenv").config();
require("newrelic");
const express = require("express");
const cors = require('cors');
const request = require("request");
const path = require("path");
var xl = require("excel4node");
var mailer = require("nodemailer");
const app = express();
const moment = require("moment");
const m = require("moment-timezone");
const queryString = require("query-string");

var fileSystem = require("fs");
var fastcsv = require("fast-csv");
const stringify = require("csv-stringify");

const port = process.env.PORT || 3000;

const initDb = require("./env/parceldb.js");
const initAmqp = require("./env/amqp");

moment.locale("th");
// app.use(express.json());
app.use(express.json({ limit: '5mb' }));
app.use(express.static("public"));
app.use(cors());

const parcelServices = require("./services/parcelService.js");
const MY_AMQP_PREFIX = process.env.MY_AMQP_PREFIX || "parcel";

if (process.env.NODE_ENV === "production") {
  console.log("In production mode");
} else {
  console.log("In development mode");
}

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
//   next();
// });
Promise.all([initDb(), initAmqp()]).then(values => {
  const appCtx = {
    db: values[0],
    amqpChannel: values[1]
  };

  const db = values[0];
  const amqpChannel = values[1];

  require('./routers/healthz')(app, appCtx);
  require("./routers/branch")(app, appCtx);
  require("./routers/sizeInfo")(app, appCtx);
  require("./routers/general")(app, appCtx);

  app.get("/", function (req, res) {
    res.sendFile(path.resolve("public/index.html"));
  });

  app.get("/check/info/tracking", function (req, res) {
    let tracking = req.query.tracking;
    parcelServices.getTrackingImgUrl(db, tracking).then(function (dataImg) {
      parcelServices.getBillingItemTracking(db, tracking).then(function (data) {
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

  app.get("/check/info/billing", function (req, res) {
    let billing = req.query.billing;

    parcelServices.getBillingInfo(db, billing).then(function (data) {
      if (data == false) {
        res.json({ status: "data_not_found" });
      } else {
        res.json({ status: "SUCCESS", data });
      }
    });
  });

  app.post("/parcelPrice", (req, res) => {
    let zipcode = req.body.zipcode;
    let size_name = req.body.size_name;
    let zone = req.body.zone;
    parcelServices.checkDistrict(db, zipcode).then(function (data) {
      if (data == false) {
        return res.json({ results: false });
      } else {
        let district = data[0].district_code;
        let code;
        let districtConvert = parseInt(district[0] + district[1]);
        if (zipcode == "13180") {
          code = "upc";
        } else if (districtConvert >= 10 && districtConvert < 14) {
          code = "bkk";
        } else {
          code = "upc";
        }
        parcelServices.checkPrice(db, code, size_name, zone).then(function (data) {
          if (data == false) {
            return res.json([]);
          } else {
            return res.json(data);
          }
        });
      }
    });
  });

  app.get("/check-available-tracking", (req, res) => {
    let tracking = req.query.tracking;

    checkAvailableTracking(tracking.toUpperCase()).then(result => {
      res.send(result);
    });
  });

  app.post("/tools/void-billing", function (req, res) {
    let data = req.body;

    let billingNo = data.billingNo;
    let billingInfo = data.billingInfo;
    let billingStatus = data.billingStatus;
    let reason = data.reason;
    let remark = data.remark;
    let moduleName = data.moduleName;
    let user = data.user;

    let selectItems = data.selectItem;
    let currentMember = data.currentMember;

    if (moduleName !== undefined && moduleName !== null && moduleName !== "") {
      if (billingStatus == "cancel") {
        return res.json({ status: "ERROR", reason: "data_cancelled" });
      } else {
        if (billingNo !== undefined && billingNo !== null && billingNo !== "") {

          var listLogTracking = [];
          var previous_value_log = billingStatus;
          var current_value_log = "cancel";

          if (selectItems.length <= 0) {
            /* change member */
            voidBilling(billingNo).then(resultVoidBilling => {
              if (resultVoidBilling) {
                let listCancelTracking = billingInfo.billingItem;
                createBilling(billingInfo, billingInfo.billingItem, currentMember).then(async resultCreateBilling => {
                  if (resultCreateBilling !== false) {
                    /* save log */
                    for (let val of listCancelTracking) {
                      listLogTracking.push(await parcelServices.insertLog(db, billingNo, previous_value_log, current_value_log, reason, moduleName, user, val.tracking, remark));
                    }
                    if (listLogTracking.length == listCancelTracking.length) {
                      return res.json({ status: "SUCCESS", billingNo: resultCreateBilling.billingNo });
                    } else {
                      return res.json({ status: "ERROR", reason: "cannot_save_log" });
                    }
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

            listCheckItem = [];
            selectItems.forEach(selectItem => {
              var checkItem = billingItems.find(item => selectItem.tracking == item.tracking);
              if (checkItem == undefined) {
                // ไม่เจอใน billing
                listCheckItem.push(false);
              } else {
                listCheckItem.push(true);
              }
            });
            var check_pass = true;
            listCheckItem.forEach(value => {
              if (value == false) {
                check_pass = false;
              }
            });
            if (!check_pass) {
              return res.json({ status: "ERROR", reason: "data_not_found_in_billing" });
            } else {
              let listCancelTracking = [];
              let listCreateTracking = [];

              billingItems.forEach(item => {
                var checkCancelItem = selectItems.find(value => value.tracking == item.tracking);

                if (checkCancelItem !== undefined) {
                  listCancelTracking.push(item);
                } else {
                  listCreateTracking.push(item);
                }
              });

              if (listCreateTracking.length <= 0) {
                /* cancel billing */
                voidBilling(billingNo).then(async resultVoidBilling => {
                  if (resultVoidBilling) {
                    var listTracking = [];
                    for (let val of listCancelTracking) {
                      listTracking.push(await parcelServices.updateStatusReceiver(db, "cancel", val.tracking));
                    }
                    if (listTracking.length == listCancelTracking.length) {
                      /* save log */
                      for (let val of listCancelTracking) {
                        listLogTracking.push(await parcelServices.insertLog(db, billingNo, previous_value_log, current_value_log, reason, moduleName, user, val.tracking, remark));
                      }
                      if (listLogTracking.length == listCancelTracking.length) {
                        return res.json({ status: "SUCCESS", billingNo: "" });
                      } else {
                        return res.json({ status: "ERROR", reason: "cannot_save_log" });
                      }
                    } else {
                      return res.json({ status: "ERROR", reason: "cannot_void_billing_item" });
                    }
                  } else {
                    return res.json({ status: "ERROR", reason: "cannot_void_billing" });
                  }
                });
              } else {
                /* cancel tracking */
                voidBilling(billingNo).then(async resultVoidBilling => {
                  if (resultVoidBilling) {
                    var listTracking = [];
                    for (let val of listCancelTracking) {
                      listTracking.push(await parcelServices.updateStatusReceiver(db, "cancel", val.tracking));
                    }
                    if (listTracking.length == listCancelTracking.length) {
                      createBilling(billingInfo, listCreateTracking, currentMember).then(async resultCreateBilling => {
                        if (resultCreateBilling !== false) {
                          /* save log */
                          for (let val of listCancelTracking) {
                            listLogTracking.push(await parcelServices.insertLog(db, billingNo, previous_value_log, current_value_log, reason, moduleName, user, val.tracking, remark));
                          }
                          if (listLogTracking.length == listCancelTracking.length) {
                            return res.json({ status: "SUCCESS", billingNo: resultCreateBilling.billingNo });
                          } else {
                            return res.json({ status: "ERROR", reason: "cannot_save_log" });
                          }
                        } else {
                          return res.json({ status: "ERROR", reason: "cannot_restructure_billing" });
                        }
                      });
                    } else {
                      return res.json({ status: "ERROR", reason: "cannot_void_billing_item" });
                    }
                  } else {
                    return res.json({ status: "ERROR", reason: "cannot_void_billing" });
                  }
                });
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

  app.post("/tools/relabel-tracking", async function (req, res) {
    let data = req.body;
    let billingNo = data.billingNo;
    let billingStatus = data.billingStatus;

    let billingInfo = data.billingInfo;

    let currentValue = data.currentValue;

    let causeType = data.causeType; //1=บ.ผิดเอง, 2=shop ผิด
    let reason = data.reason;
    let remark = data.remark;
    let user = data.user;
    let moduleName = data.moduleName;

    if (moduleName == undefined && moduleName == null && moduleName == "") {
      return res.json({ status: "ERROR", reason: "no_module_select" });
    } else if (billingInfo == undefined) {
      return res.json({ status: "ERROR", reason: "no_data_was_created" });
    } else if (billingInfo.billing_status == "cancel") {
      return res.json({ status: "ERROR", reason: "data_cancelled" });
    } else if (billingInfo.billing_status == "relabel") {
      return res.json({ status: "ERROR", reason: "data_relabled" });
    } else if (currentValue == undefined) {
      return res.json({ status: "ERROR", reason: "no_data_to_relabeling" });
    } else if (causeType == "" || causeType == 0 || causeType == undefined) {
      return res.json({ status: "ERROR", reason: "no_cause_type" });
    } else if (reason == undefined) {
      return res.json({ status: "ERROR", reason: "no_reason" });
    } else if (remark == undefined) {
      return res.json({ status: "ERROR", reason: "no_remark" });
    } else if (user == undefined) {
      return res.json({ status: "ERROR", reason: "no_user" });
    } else {
      if (currentValue.billingItem == undefined) {
        return res.json({ status: "ERROR", reason: "no_new_data_item" });
      } else if (currentValue.receiverInfo == undefined) {
        return res.json({ status: "ERROR", reason: "no_new_data_receiver" });
      } else {
        let billingItem = currentValue.billingItem;
        let receiverInfo = currentValue.receiverInfo;

        if (receiverInfo.keyAddress == undefined) {
          return res.json({ status: "ERROR", reason: "no_new_data_address" });
        } else {
          let receiverAddress = receiverInfo.keyAddress;

          var resultList = [];
          item_valid = true;
          item_valid = isGenericValid(billingItem, "tracking", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(billingItem, "parcelType", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(billingItem, "sizeId", item_valid, resultList, billingItem.tracking);
          // item_valid = isGenericValid(billingItem, "sizePrice", item_valid, resultList, billingItem.tracking);

          item_valid = isGenericValid(receiverInfo, "receiverName", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(receiverInfo, "phone", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(receiverInfo, "receiverAddress", item_valid, resultList, billingItem.tracking);

          item_valid = isGenericValid(receiverAddress, "DISTRICT_CODE", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(receiverAddress, "zipcode", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(receiverAddress, "DISTRICT_ID", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(receiverAddress, "DISTRICT_NAME", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(receiverAddress, "AMPHUR_ID", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(receiverAddress, "AMPHUR_NAME", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(receiverAddress, "PROVINCE_ID", item_valid, resultList, billingItem.tracking);
          item_valid = isGenericValid(receiverAddress, "PROVINCE_NAME", item_valid, resultList, billingItem.tracking);

          if (causeType == 1 && billingItem.sizePrice !== 0) {
            console.log("causeType = 1, sizePrice = %d", billingItem.sizePrice);
            item_valid = false;
          }
          if (causeType == 2 && billingItem.sizePrice == 0) {
            console.log("causeType = 2, sizePrice = %d", billingItem.sizePrice);
            item_valid = false;
          }

          if (!item_valid) {
            return res.json({
              status: "ERROR",
              reason: "data_not_complete_to_relabeling"
            });
          } else {
            var checkQlCase = true;
            let autoInfo = await parcelServices.getAutoLabelInfo(db, billingItem.tracking);

            if (billingItem.parcelType.toUpperCase() !== "NORMAL" && billingItem.parcelType.toUpperCase() !== "COD") {
              console.log("type is wrong(ql checker) = %s", tracking);
              return false;
            }
            if (billingItem.parcelType.toUpperCase() == "NORMAL" && parseInt(billingItem.codValue) !== 0) {
              console.log("parcelType = NORMAL, codValue = %d", billingItem.codValue);
              checkQlCase = false;
            }
            if (billingItem.parcelType.toUpperCase() == "COD" && parseInt(billingItem.codValue) == 0) {
              console.log("parcelType = COD, codValue = %d", billingItem.codValue);
              checkQlCase = false;
            }
            if (billingItem.parcelType.toUpperCase() == "COD" && parseInt(billingItem.codValue) > 50000) {
              console.log("parcelType = COD, codValue = %d", billingItem.codValue);
              checkQlCase = false;
            }
            if (billingInfo.sender_phone == receiverInfo.phone) {
              console.log("sender phone = receiver phone (re-label) = %s", tracking);
              checkQlCase = false;
            }
            if (autoInfo !== false) {
              let rawDataAutoStr = removeCharacter(autoInfo.raw_data);
              if (receiverInfo.phone !== "0914271551" && rawDataAutoStr.search(receiverInfo.phone) == -1) {
                console.log("receiver phone is not in raw data (re-label) = %s", tracking);
                checkQlCase = false;
              }
            }

            if (!checkQlCase) {
              return res.json({
                status: "ERROR",
                reason: "data_have_ql_case"
              });
            } else {
              checkAvailableTracking(billingItem.tracking.toUpperCase()).then(resultAvailableTracking => {
                if (!resultAvailableTracking) {
                  return res.json({
                    status: "ERROR",
                    reason: "tracking_not_available"
                  });
                } else {
                  /* start process relabel */
                  parcelServices.updateStatusReceiver(db, "relabel", billingInfo.tracking).then(resultUpdateStatus => {
                    if (resultUpdateStatus !== false) {
                      parcelServices.selectBillingInfo(db, billingInfo.billing_no).then(resultBilling => {
                        createBillingRelabel(resultBilling, billingInfo, currentValue, causeType, reason, remark).then(resultCreateBilling => {
                          if (resultCreateBilling !== false) {
                            var dataToPrepareBooking = {
                              tracking: billingItem.tracking,
                              source: "RELABEL"
                            };
                            amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.prepare-booking", "", Buffer.from(JSON.stringify(dataToPrepareBooking)), { persistent: true });

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
                      return res.json({
                        status: "ERROR",
                        reason: "cannot_update_status_tracking"
                      });
                    }
                  });
                  /*******/
                }
              });
            }
          }
        }
      }
    }
  });

  app.post("/tools/move-member-info", function (req, res) {
    let previousValue = req.body.previousValue;
    let currentValue = req.body.currentValue;
    let moduleName = req.body.moduleName;
    let user = req.body.user;

    var dataJson = currentValue;

    var url945 = "https://api-key-tool.945holding.com";
    request(
      {
        url: url945 + "/update/member-info/api",
        method: "POST",
        body: dataJson,
        json: true
      },
      (err, res2, body) => {
        var resultUpdateApi = res2.body.status;

        if (resultUpdateApi == "SUCCESS") {
          var previousValueLog = previousValue.member_id + "/" + previousValue.merid + "/" + previousValue.status;
          var currentValueLog = currentValue.memberId + "/" + currentValue.merId + "/" + currentValue.status;

          parcelServices.insertLog(db, "-", previousValueLog, currentValueLog, "move_member", moduleName, user, "-", "-");

          request(
            {
              url: url945 + "/check/member-info?memberId=" + currentValue.memberId,
              method: "GET"
            },
            (err, res3, body) => {
              var resultCheckMember = JSON.parse(res3.body);
              res.json({
                status: "SUCCESS",
                memberInfo: resultCheckMember.memberInfo[0]
              });
            });
        } else {
          res.json({ status: "ERROR", reason: res2.body.reason });
        }
      }
    );
  });

  app.post("/tools/change-phoneregis", function (req, res) {
    let previousValue = req.body.previousValue;
    let currentValue = req.body.currentValue;
    let moduleName = req.body.moduleName;
    let user = req.body.user;

    var dataJson = currentValue;

    var url945 = "https://api-key-tool.945holding.com";
    request(
      {
        url: url945 + "/update/phoneregis/api",
        method: "POST",
        body: dataJson,
        json: true
      },
      (err, res2, body) => {
        var resultUpdateApi = res2.body.status;

        if (resultUpdateApi == "SUCCESS") {
          var previousValueLog = previousValue.member_id + "/" + previousValue.phoneregis;
          var currentValueLog = currentValue.memberId + "/" + currentValue.phoneRegis;

          parcelServices.insertLog(db, "-", previousValueLog, currentValueLog, "change_phone_regis", moduleName, user, "-", "-");

          request(
            {
              url: url945 + "/parcel/check-member/phoneregis?phoneregis=" + currentValue.phoneRegis,
              method: "GET"
            },
            (err, res3, body) => {
              var resultCheckMember = JSON.parse(res3.body);
              if (resultCheckMember.status == "EXISTED_MEMBER") {
                return res.json({ status: "SUCCESS" });
              } else if (resultCheckMember.status == "SUCCESS") {
                return res.json({
                  status: "ERROR",
                  reason: "ไม่มีข้อมูลอยู่ใน server หลัก"
                });
              } else {
                return res.json({
                  status: "ERROR",
                  reason: "ไม่สามารถเชื่อมต่อข้อมูลที่ server หลักได้"
                });
              }
            });
        } else {
          return res.json({ status: "ERROR", reason: res2.body.reason });
        }
      });
  });

  app.get("/tools/list-pending-tracking", function (req, res) {
    parcelServices.getListPendingTracking(db).then(function (data) {
      if (data == false) {
        return res.json({ status: "ERROR_CONNECT_DB" });
      } else {
        if (data == null) {
          return res.json({ status: "ERROR_NO_TRACKING" });
        } else {
          branch_info = {};

          data.forEach(value => {
            if (!(value.branch_id in branch_info)) {
              branch_info[String(value.branch_id)] = [];
            }
            branch_info[String(value.branch_id)].push({
              branch_name: value.branch_name,
              tracking: value.tracking
            });
          });

          result = [];
          for (const [key, items] of Object.entries(branch_info)) {
            var dataBranch = {
              branch_id: key,
              branch_name: items[0].branch_name,
              tracking: items[0].tracking,
              total: items.length
            };
            result.push(dataBranch);
          }
          res.json({
            status: "SUCCESS",
            listTracking: result
          });
        }
      }
    });
  });

  app.get("/tools/list/tracking", function (req, res) {
    parcelServices.getListTrackingNotMatch(db).then(function (data) {
      listTrackingNotMatch = [];
      data.forEach(value => {
        var resultList = [];
        var valid = true;
        valid = isMatched(valid, value.bi_type, value.br_type, value.bi_zipcode, value.br_zipcode, value.cod_value, (resultList = null), value.tracking);
        if (!valid) {
          listTrackingNotMatch.push(value);
        }
      });

      if (listTrackingNotMatch.length <= 0) {
        res.json({ status: "ERROR_NO_TRACKING" });
      } else {
        branch_info = {};

        listTrackingNotMatch.forEach(value => {
          if (!(value.branch_id in branch_info)) {
            branch_info[String(value.branch_id)] = [];
          }
          branch_info[String(value.branch_id)].push({
            branch_name: value.branch_name,
            tracking: value.tracking
          });
        });

        result = [];
        for (const [key, items] of Object.entries(branch_info)) {
          var dataBranch = {
            branch_id: key,
            branch_name: items[0].branch_name,
            tracking: items[0].tracking,
            total: items.length
          };
          result.push(dataBranch);
        }
        res.json({
          status: "SUCCESS",
          listTracking: result
        });
      }
    });
  });

  app.post("/tools/recal-billing", async function (req, res) {
    var user = req.body.user;
    var moduleName = req.body.moduleName;
    var resultsFile = req.body.resultsFile;

    if (resultsFile.length <= 0) {
      return res.json({
        status: "ERROR_NO_DATA",
        listBilling: [],
        listRemainBilling: [],
        listBillingError: [],
        listTrackingError: []
      });
    } else {
      let listInputData = [];
      resultsFile.forEach(element => {
        if (!(element["member_id"] == "" && element["pricing_zone"] == "" && element["mailcode"] == "" && element["recal_size"] == "")) {
          let data = {
            tracking: element["mailcode"] == undefined ? "" : element["mailcode"].toString(),
            zone: element["pricing_zone"] == undefined ? "" : element["pricing_zone"].toString(),
            size: element["recal_size"] == undefined ? "" : element["recal_size"].toString(),
            memberId: element["member_id"] == undefined ? "" : element["member_id"].toString(),
          };
          listInputData.push(data);
        }
      });
      let validItem = true;
      for (let item of listInputData) {
        validItem = true;
        validItem = isGenericValid(item, "tracking", validItem, [], item.tracking);
        validItem = isGenericValid(item, "zone", validItem, [], item.tracking);
        validItem = isGenericValid(item, "size", validItem, [], item.tracking);
        validItem = isGenericValid(item, "memberId", validItem, [], item.tracking);
      }
      if (!validItem) {
        return res.json({
          status: "ERROR_DATA_NOT_VALID",
          listBilling: [],
          listRemainBilling: [],
          listBillingError: [],
          listTrackingError: []
        });
      } else {
        let listTrackingInfo = [];
        let listTrackingError = [];
        for (let item of listInputData) {
          /* เก็บข้อมูลของ tracking เดิม */
          let checkTrackingInfo = await parcelServices.getTrackingInfo(db, item);
          if (checkTrackingInfo !== false) {
            listTrackingInfo.push(checkTrackingInfo);
          } else {
            listTrackingError.push({ tracking: item.tracking });
          }
        }

        if (listTrackingInfo.length !== 0) {
          billing = {};
          listTrackingInfo.forEach(value => {
            if (!(value.billingNo in billing)) {
              billing[String(value.billingNo)] = [];
            }
            billing[String(value.billingNo)].push(value);
          });

          let listBilling = [];
          let listRemainBilling = [];
          let listBillingError = [];

          for (const [billingNo, items] of Object.entries(billing)) {
            var billingInfo = await parcelServices.getBillingInfo(db, billingNo);
            let listTrackingInFile = [];
            let listTrackingNotInFile = [];

            for (let item of billingInfo.billingItem) {
              var checkItem = items.find(e => e.tracking == item.tracking);
              if (checkItem == undefined) {
                listTrackingNotInFile.push(item);
              } else {
                let getNewSizeInfo = await parcelServices.checkPrice(db, checkItem.billingItem.location_zone, checkItem.size.toLowerCase(), parseInt(checkItem.zone));
                if (getNewSizeInfo == false) {
                  listTrackingError.push({ tracking: item.tracking });
                } else {
                  checkItem.sizeInfo = getNewSizeInfo[0];
                }
                listTrackingInFile.push(checkItem);
              }
            }

            let resultVoidBilling = await voidBilling(billingInfo.billing.billing_no);
            let resultRemainBilling = {};
            if (resultVoidBilling) {
              let resultCreateBilling = await createReCalBilling(billingInfo.billing, listTrackingInFile, moduleName, user);

              if (listTrackingNotInFile.length !== 0) {
                resultRemainBilling = await createRemainBilling(billingInfo.billing, listTrackingNotInFile);
                listRemainBilling.push(resultRemainBilling);
              }

              listBilling.push(resultCreateBilling);
            } else {
              listBillingError.push({
                status: billingInfo.billing.status,
                billingNo: billingInfo.billing.billing_no
              });
            }
          }
          return res.json({
            status: "SUCCESS",
            listBilling: listBilling,
            listRemainBilling: listRemainBilling,
            listBillingError: listBillingError,
            listTrackingError: listTrackingError
          });
        } else {
          return res.json({
            status: "ERROR_NO_DATA_TO_RECAL_BILLING",
            listBilling: [],
            listRemainBilling: [],
            listBillingError: [],
            listTrackingError: listTrackingError
          });
        }
      }
    }
  });

  app.post("/confirm/match/data/info", async function (req, res) {
    let valid = true;

    valid = isGenericValid(req.body, "tracking", valid);
    valid = isGenericValid(req.body, "billing_no", valid);
    valid = isGenericValid(req.body, "previous_value", valid);
    valid = isGenericValid(req.body, "current_value", valid);
    valid = isGenericValid(req.body, "user", valid);

    valid = isGenericValid(req.body.current_value, "parcel_type", valid);
    valid = isGenericValid(req.body.current_value, "size_id", valid);
    // valid = isGenericValid(req.body.current_value, "size_price", valid);
    valid = isGenericValid(req.body.current_value, "first_name", valid);
    valid = isGenericValid(req.body.current_value, "last_name", valid);
    valid = isGenericValid(req.body.current_value, "phone", valid);
    valid = isGenericValid(req.body.current_value, "address", valid);
    valid = isGenericValid(req.body.current_value, "district_code", valid);
    valid = isGenericValid(req.body.current_value, "br_zipcode", valid);

    if (!valid) {
      return res.json({ status: "ERROR_DATA_NOT_VALID" });
    } else {
      let sizeInfo = await parcelServices.getSizeInfo(db, req.body.current_value);
      if (sizeInfo == false) {
        return res.json({ status: "ERROR_CHECK_SIZE" });
      } else {
        var checkQlCase = true;
        let autoInfo = await parcelServices.getAutoLabelInfo(db, req.body.tracking);
        checkQlCase = await isValidMatched(checkQlCase, req.body.tracking, req.body.current_value, req.body.previous_value, autoInfo);

        if (!checkQlCase) {
          return res.json({ status: "ERROR_DATA_QL_CASE" });
        } else {
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
          let log_previous_value = previous_value.bi_parcel_type + "/" + previous_value.br_parcel_type + "/" + previous_value.bi_zipcode + "/" + previous_value.br_zipcode;
          let log_current_value = parcel_type + "/" + br_zipcode;
          let module_name = "ql_checker";
          let cs_name = req.body.user;

          parcelServices.addressInfo(db, district_code).then(function (data) {
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
            if (error_maker == "shop staff") {
              remark = "สาขาทำรายการผิด";
            }
            if (error_maker == "key operator") {
              remark = "เจ้าหน้าที่คีย์ข้อมูลผิด";
            }
            if (error_maker == "system") {
              remark = "ระบบเกิดความผิดพลาด";
            }
            console.log("confirm :", tracking, error_code, error_maker);
            parcelServices.findOperator(db, tracking).then(function (data) {
              let operation_key = data.length <= 0 ? "" : data[0].operator_id;

              parcelServices.selectBillingInfo(db, billing_no).then(function (previous_total) {
                parcelServices.updateCheckerInfo(db, billing_no, tracking, size_id, size_price, cod_value, receiver_name, phone, address, parcel_type, district_id, district_name, amphur_id, amphur_name, province_id, province_name, zipcode).then(function (current_total) {
                  if (current_total !== false) {
                    parcelServices.updateBilling(db, billing_no, current_total).then(function (data) { });
                    parcelServices.saveLogQlChecker(db, branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key).then(function (data) { });

                    log_previous_value += "/total=" + previous_total[0].total;
                    log_current_value += "/total=" + current_total;
                    parcelServices.insertLog(db, billing_no, log_previous_value, log_current_value, error_code, module_name, cs_name, tracking, remark).then(function (data) { });
                    /* ส่งเข้าคิว เพื่อไป booking ข้อมูล */
                    let data = {
                      tracking: tracking,
                      source: "QLChecker"
                    };
                    console.log("send to parcel exchange prepare-booking = %s", tracking);
                    amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.prepare-booking", "", Buffer.from(JSON.stringify(data)), { persistent: true });
                    console.log("sent to parcel exchange prepare-booking = %s", tracking);

                    return res.json({ status: "SUCCESS" });
                  } else {
                    return res.json({ status: "ERROR" });
                  }
                });
              });
            });
          });
        }
      }
    }
  });

  app.post("/update/flash/data", function (req, res) {
    let valid = true;

    valid = isGenericValid(req.body, "tracking", valid);
    valid = isGenericValid(req.body, "billing_no", valid);
    valid = isGenericValid(req.body, "previous_value", valid);
    valid = isGenericValid(req.body, "current_value", valid);
    valid = isGenericValid(req.body, "user", valid);

    valid = isGenericValid(req.body.current_value, "receiver_name", valid);
    valid = isGenericValid(req.body.current_value, "receiver_address", valid);
    valid = isGenericValid(req.body.current_value, "receiver_phone", valid);
    valid = isGenericValid(req.body.current_value, "district_code", valid);
    valid = isGenericValid(req.body.current_value, "district_name", valid);
    valid = isGenericValid(req.body.current_value, "amphur_name", valid);
    valid = isGenericValid(req.body.current_value, "province_info", valid);
    valid = isGenericValid(req.body.current_value, "zipcode", valid);

    if (!valid) {
      return res.json({ status: "ERROR_DATA_NOT_VALID" });
    } else {
      let tracking = req.body.tracking;
      let address = req.body.previous_value;
      let newAddress = req.body.current_value;
      parcelServices.saveDistrictFlash(db, address, newAddress).then(function (resultDistrict) {
        if (!resultDistrict) {
          return res.json({ status: "ERROR_CANNOT_SAVE_DISTRICT" });
        } else {
          parcelServices.saveAmphurFlash(db, address, newAddress).then(function (resultAmphur) {
            if (!resultAmphur) {
              return res.json({ status: "ERROR_CANNOT_SAVE_AMPHUR" });
            } else {
              parcelServices.saveZipcodeFlash(db, address, newAddress).then(function (resultZipcode) {
                if (!resultZipcode) {
                  return res.json({ status: "ERROR_CANNOT_SAVE_ZIPCODE" });
                } else {
                  parcelServices.updateReceiverInfo(db, tracking, newAddress).then(result => {
                    if (result) {
                      var info = {
                        tracking: tracking,
                        status: "ready_to_booking"
                      };
                      console.log("send to exchange checked-ready = %s", tracking);
                      amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.checked-ready", "", Buffer.from(JSON.stringify(info)), { persistent: true });
                      console.log("sent to exchange checked-ready = %s", tracking);

                      return res.json({ status: "SUCCESS" });
                    } else {
                      return res.json({ status: "ERROR_CANNOT_UPDATE_RECEIVER_INFO" });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });

  app.post("/update/ninja/data", function (req, res) {
    let valid = true;

    valid = isGenericValid(req.body, "tracking", valid);
    valid = isGenericValid(req.body, "billing_no", valid);
    valid = isGenericValid(req.body, "previous_value", valid);
    valid = isGenericValid(req.body, "current_value", valid);
    valid = isGenericValid(req.body, "user", valid);

    valid = isGenericValid(req.body.current_value, "receiver_name", valid);
    valid = isGenericValid(req.body.current_value, "receiver_address", valid);
    valid = isGenericValid(req.body.current_value, "receiver_phone", valid);
    valid = isGenericValid(req.body.current_value, "district_code", valid);
    valid = isGenericValid(req.body.current_value, "district_name", valid);
    valid = isGenericValid(req.body.current_value, "amphur_name", valid);
    valid = isGenericValid(req.body.current_value, "province_info", valid);
    valid = isGenericValid(req.body.current_value, "zipcode", valid);

    if (!valid) {
      return res.json({ status: "ERROR_DATA_NOT_VALID" });
    } else {
      let tracking = req.body.tracking;
      let address = req.body.previous_value;
      let newAddress = req.body.current_value;

      parcelServices.updateReceiverInfo(db, tracking, newAddress).then(result => {
        if (result) {
          var info = {
            tracking: tracking,
            status: "ready_to_booking"
          };
          console.log("send to exchange checked-ready = %s", tracking);
          amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.checked-ready", "", Buffer.from(JSON.stringify(info)), { persistent: true });
          console.log("sent to exchange checked-ready = %s", tracking);

          return res.json({ status: "SUCCESS" });
        } else {
          return res.json({ status: "ERROR_CANNOT_UPDATE_RECEIVER_INFO" });
        }
      });
    }
  });

  app.get("/report-branch", (req, res) => {
    let date_check = req.query.date_check;
    parcelServices.reportBranch(db, date_check).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        d = [];
        branch_info = {};

        data.forEach(value => {
          if (!(value.branch_id in branch_info)) {
            branch_info[String(value.branch_id)] = [];
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

        result = [];
        for (const [key, items] of Object.entries(branch_info)) {
          var cBooked = 0;
          var cNotBook = 0;
          items.forEach(item => {
            if (item.booking_status == 100) {
              cBooked++;
            } else {
              cNotBook++;
            }
          });
          var dataBranch = {
            branch_name: items[0].branch_name,
            cBooked: cBooked,
            c_not_book: cNotBook,
            total: items.length
          };
          result.push(dataBranch);
        }
        res.json(result);
      }
    });
  });

  app.get("/daily-report", (req, res) => {
    let date_check = req.query.date_check;
    parcelServices.dailyReport(db, date_check).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        d = [];
        branch_info = {};
        var sumBooked = 0;
        var sumNotBooked = 0;
        var sumFlashBooked = 0;
        var sumFlashNotBooked = 0;
        var sumNinjaBooked = 0;
        var sumNinjaNotBooked = 0;
        data.forEach(value => {
          if (!(value.billing_no in branch_info)) {
            branch_info[String(value.billing_no)] = [];
          }
          branch_info[String(value.billing_no)].push({
            branch_id: value.branch_id,
            branch_name: value.branch_name,
            billing_no: value.billing_no,
            sender_name: value.sender_name,
            status: value.status,
            billing_date: value.billing_date,
            booking_status: value.booking_status,
            booking_flash_status: value.booking_flash_status,
            booking_ninja_status: value.booking_ninja_status
          });
          if (value.booking_status == 100) {
            sumBooked++;
          } else {
            sumNotBooked++;
          }
          if (value.booking_flash_status == 100) {
            sumFlashBooked++;
          } else {
            sumFlashNotBooked++;
          }
          if (value.booking_ninja_status == 100) {
            sumNinjaBooked++;
          } else {
            sumNinjaNotBooked++;
          }
        });

        result = [];
        for (const [key, items] of Object.entries(branch_info)) {
          var c_dhlBooked = 0;
          var c_dhlNotBook = 0;
          var c_flashBooked = 0;
          var c_flashNotBook = 0;
          var c_ninjaBooked = 0;
          var c_ninjaNotBook = 0;
          items.forEach(item => {
            if (item.booking_status == 100) {
              c_dhlBooked++;
            } else {
              c_dhlNotBook++;
            }
            if (item.booking_flash_status == 100) {
              c_flashBooked++;
            } else {
              c_flashNotBook++;
            }
            if (item.booking_ninja_status == 100) {
              c_ninjaBooked++;
            } else {
              c_ninjaNotBook++;
            }
          });
          var dataBranch = {
            branch_id: items[0].branch_id,
            branch_name: items[0].branch_name,
            billing_date: items[0].billing_date,
            billing_no: key,
            sender_name: items[0].sender_name,
            status: items[0].status,
            dhl_booked: c_dhlBooked,
            dhl_cNotBook: c_dhlNotBook,
            flash_booked: c_flashBooked,
            flash_cNotBook: c_flashNotBook,
            ninja_booked: c_ninjaBooked,
            ninja_cNotBook: c_ninjaNotBook,
            total: items.length
          };
          result.push(dataBranch);
        }

        var summary = {
          total: data.length,
          sumBooked: sumBooked,
          sumNotBooked: sumNotBooked,
          sumFlashBooked: sumFlashBooked,
          sumFlashNotBooked: sumFlashNotBooked,
          sumNinjaBooked: sumNinjaBooked,
          sumNinjaNotBooked: sumNinjaNotBooked
        };
        res.json({ result: result, summary: summary });
      }
    });
  });

  app.get("/summary-booking", (req, res) => {
    let date_check = req.query.date_check;
    parcelServices.summaryBooking(db, date_check).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        var c_dhlBooked = 0;
        var c_dhlNotBook = 0;
        var c_flashBooked = 0;
        var c_flashNotBook = 0;
        var c_ninjaBooked = 0;
        var c_ninjaNotBook = 0;
        data.forEach(val => {
          if (val.booking_status == 100) {
            c_dhlBooked++;
          } else {
            c_dhlNotBook++;
          }
          if (val.booking_flash_status == 100) {
            c_flashBooked++;
          } else {
            c_flashNotBook++;
          }
          if (val.booking_ninja_status == 100) {
            c_ninjaBooked++;
          } else {
            c_ninjaNotBook++;
          }
        });
        var output = {
          total: data.length,
          c_dhlBooked: c_dhlBooked,
          c_dhlNotBook: c_dhlNotBook,
          c_flashBooked: c_flashBooked,
          c_flashNotBook: c_flashNotBook,
          c_ninjaBooked: c_ninjaBooked,
          c_ninjaNotBook: c_ninjaNotBook,
        };
        res.json(output);
      }
    });
  });

  app.get("/list-capture-monitor", (req, res) => {
    let branch_id = req.query.branch_id;
    let date_check = req.query.date_check;

    parcelServices.getCaptureData(db, date_check).then(async function (data) {
      if (data == false) {
        return res.json({ status: "ERROR_CONNECT_DB", data: [] });
      } else {
        if (data == null) {
          return res.json({ status: "ERROR_NO_DATA", data: [] });
        } else {
          branch_info = {};
          data.forEach(value => {
            if (value.phone_number !== "" && value.phone_number !== undefined && value.phone_number !== null) {
              if (!(value.phone_number in branch_info)) {
                branch_info[String(value.phone_number)] = [];
              }
              branch_info[String(value.phone_number)].push(value);
            }
          });
          var listMember = [];
          for (const [phoneNumber, items] of Object.entries(branch_info)) {

            let countCapture = 0;
            let countAutolabel = 0;
            let startCapture = 99999999999999;
            let lastCapture = 0;

            for (let e of items) {
              if (e.data_type == "AUTOLABEL") {
                countAutolabel++;
              } else {
                countCapture++;
              }
              let record = moment(e.record_created_at);
              if (parseInt(+record) > lastCapture) {
                lastCapture = parseInt(+record)
              }
              if (parseInt(+record) < startCapture) {
                startCapture = parseInt(+record)
              }
            }

            listMember.push({
              phoneNumber: phoneNumber,
              totalCapture: items.length,
              countAutolabel: countAutolabel,
              countCapture: countCapture,
              startCapture: moment(startCapture).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss"),
              lastCapture: moment(lastCapture).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss")
            });
          }

          var url945api = "https://www.945api.com";
          request(
            {
              url: url945api + "/parcel/capture/get-member-info",
              method: "POST",
              body: listMember,
              json: true
            },
            async (err, res2, body) => {
              if (res2.statusCode == 200) {
                var memberInfo = res2.body;
                if (memberInfo.length <= 0) {
                  return res.json({ status: "ERROR_NO_MEMBER_INFO", data: [] });
                } else {
                  var output = [];
                  for (let item of memberInfo) {
                    if (parseInt(item.merid) == parseInt(branch_id)) {
                      let captureItem = await parcelServices.listCaptureCheckBillingItem(db, item, date_check);
                      output.push(captureItem);
                    }
                  }
                  return res.json({ status: "SUCCESS", data: output });
                }
              } else {
                return res.json({ status: "ERROR_GET_MEMBER_INFO", data: [] });
              }
            });
        }
      }
    });
  });

  app.get("/list-capture-by-phone", (req, res) => {
    let phone_number = req.query.phone_number;
    let date_check = req.query.date_check;

    parcelServices.listCaptureByPhone(db, phone_number, moment(date_check).format("YYYY-MM-DD")).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  app.get("/list-tracking-bill", (req, res) => {
    let billing_no = req.query.billing_no;

    parcelServices.dailyListTracking(db, billing_no).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  app.get("/list-error-maker", (req, res) => {
    parcelServices.listErrorMaker(db).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  app.get("/booking-flash-report", (req, res) => {
    parcelServices.bookingFlashReport(db).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  app.get("/booking-ninja-report", (req, res) => {
    // let tracking = req.query.tracking;
    parcelServices.bookingNinjaReport(db).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  app.get("/log-parcel-tool", (req, res) => {
    let ref = req.query.ref;
    parcelServices.logListParcelTool(db, ref).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  app.get("/log-daily-tool", (req, res) => {
    let dateCheck = req.query.date_check;
    parcelServices.logDailyTool(db, dateCheck).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  app.get("/log-relabel-tool", (req, res) => {
    let dateCheck = req.query.date_check;
    parcelServices.logRelabelTool(db, dateCheck).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  app.get("/log-daily-qlchecker", (req, res) => {
    let dateCheck = req.query.date_check;
    parcelServices.logDailyQlChecker(db, dateCheck).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  app.get("/daily-capture", (req, res) => {
    let dateCheck = req.query.date_check;
    parcelServices.listCapture(db, dateCheck).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });

  app.get("/log-booking-dhl", (req, res) => {
    let tracking = req.query.tracking;
    parcelServices.getBookingLog(db, tracking).then(function (data) {
      if (data == false) {
        res.json([]);
      } else {
        res.json(data);
      }
    });
  });


  /******************************************** extra tools ********************************************/
  app.get("/check-data-item", function (req, res) {
    let tracking = req.query.tracking;
    parcelServices.selectDataItem(db, tracking).then(function (data) {
      if (!data) {
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

  app.get("/check-data-receiver", function (req, res) {
    let tracking = req.query.tracking;
    parcelServices.selectDataReceiver(db, tracking).then(function (data) {
      if (!data) {
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

  app.get("/delete-data-item", function (req, res) {
    let id = req.query.id;
    let tracking = req.query.tracking;

    parcelServices.selectDataToDeleteBillingItem(db, id, tracking).then(function (resDelItem) {
      if (resDelItem == false) {
        return res.json({
          status: "error_connect_db"
        });
      } else {
        if(resDelItem == null){
          return res.json({
            status: "error_del_item",
            data: {
              id: id,
              tracking: tracking
            }
          });
        } else {
          parcelServices.selectDataItem(db, tracking).then(function (data) {
            if (!data) {
              return res.json({
                status: "error_not_found"
              });
            } else {
              return res.json({
                status: "SUCCESS",
                data: data
              });
            }
          });
        }
      }
    });
  });

  app.get("/delete-data-item-temp", function (req, res) {
    let tracking = req.query.tracking;

    parcelServices.selectDataToDeleteBillingItemTemp(db, tracking).then(function (resDelItemTemp) {
      if (resDelItemTemp == false) {
        return res.json({
          status: "error_connect_db"
        });
      } else {
        if(resDelItemTemp == null){
          return res.json({
            status: "error_del_item_temp",
            data: {
              tracking: tracking
            }
          });
        } else {
          parcelServices.selectDataItem(db, tracking).then(function (data) {
            if (!data) {
              return res.json({
                status: "error_not_found"
              });
            } else {
              return res.json({
                status: "SUCCESS",
                data: data
              });
            }
          });
        }
      }
    });
  });

  app.get("/delete-data-receiver", function (req, res) {
    let id = req.query.id;
    let tracking = req.query.tracking;

    parcelServices.selectDataToDeleteReceiver(db, id, tracking).then(function (resDelItem) {
      if (resDelItem == false) {
        return res.json({
          status: "error_connect_db"
        });
      } else {
        if(resDelItem == null){
          return res.json({
            status: "error_del_receiver",
            data: {
              id: id,
              tracking: tracking
            }
          });
        } else {
          parcelServices.selectDataReceiver(db, tracking).then(function (data) {
            if (!data) {
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
        }
      }
    });
  });

  app.get("/delete-data-receiver-temp", function (req, res) {
    let tracking = req.query.tracking;

    parcelServices.selectDataToDeleteReceiverTemp(db, tracking).then(function (resDelItemTemp) {
      if (resDelItemTemp == false) {
        return res.json({
          status: "error_connect_db"
        });
      } else {
        if(resDelItemTemp == null){
          return res.json({
            status: "error_del_receiver_temp",
            data: {
              tracking: tracking
            }
          });
        } else {
          parcelServices.selectDataReceiver(db, tracking).then(function (data) {
            if (!data) {
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
        }
      }
    });
  });

  app.get("/create-csv", function (req, res) {
    let date_check = req.query.date_check;
    parcelServices.selectBillData(db, date_check).then(function (data) {
      if (!data) {
        res.end("no data");
      } else {
        data.forEach(val => {
          val.billing_date = m(val.billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
        });
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="' + "download-" + m().tz("Asia/Bangkok").format("YYYYMMDDHHmmss") + '.csv"');
        stringify(data, { header: true }).pipe(res);
      }
    });
  });

  app.post("/resume-booking-to-queue", function (req, res) {
    if (req.headers["apikey"] != "XbOiHrrpH8aQXObcWj69XAom1b0ac5eda2b") {
      return res.send(401, "Unauthorized");
    } else {
      let tracking = req.body.tracking;
      parcelServices.selectDataReceiver(db, tracking).then(function (dataReceiver) {
        if (dataReceiver == false) {
          return res.json({ status: "ERROR_CONNECT_DB" });
        } else {
          if(dataReceiver == null) {
            return res.json({ status: "ERROR_NO_DATA" });
          } else {
            let receiverInfo = dataReceiver.receiverInfo[0];
            if (receiverInfo.booking_status !== 100) {
              parcelServices.updateStatusReceiver(db, null, tracking).then(function (resultUpdateStatus) {
                if (resultUpdateStatus !== false) {
                  var data = {
                    tracking: tracking.toUpperCase(),
                    source: "re_booking"
                  };
  
                  amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.prepare-booking", "", Buffer.from(JSON.stringify(data)), { persistent: true });
                  return res.json(data);
                } else {
                  return res.json({ status: "ERROR" });
                }
              });
            } else {
              parcelServices.selectDataToExchangeUpdateBooking(db, tracking).then(function (dataTo945) {
                amqpChannel.publish("share.exchange.task-update", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
                return res.json({
                  tracking: tracking.toUpperCase(),
                  source: "re_send_to_945"
                });
              });
            }
          }
        }
      });
    }
  });

  app.post("/resend-bill-to-queue", function (req, res) {
    if (req.headers["apikey"] != "XbOiHrrpH8aQXObcWj69XAom1b0ac5eda2b") {
      return res.send(401, "Unauthorized");
    } else {
      let billing_no = req.body.billing_no;
      let module_name = "resend_bill_to_queue";
      let reason = req.body.reason;
      let remark = req.body.remark;
      let user = req.body.user;

      parcelServices.selectBillingInfo(db, billing_no).then(function (billingInfo) {
        if (billingInfo == false) {
          return res.json({ status: "ERROR_CONNECT_DB" });
        } else {
          if (billingInfo == null) {
            return res.json({ status: "ERROR_NO_DATA" });
          } else {
            let log_previous_value = billing_no + "/" + billingInfo[0].status;
            let log_current_value = billing_no + "/resend_bill";

            parcelServices.insertLog(db, billing_no, log_previous_value, log_current_value, reason, module_name, user, billing_no, remark).then(function (dataLog) {
              let dataBilling = {
                billing_no: billing_no,
                source: "resend_bill"
              };
              console.log("send resend bill to prepare-billing exchange = %s", billing_no);
              amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.prepare-billing", "", Buffer.from(JSON.stringify(dataBilling)), { persistent: true });
              console.log("sent resend bill to prepare-billing exchange = %s", billing_no);
              res.json(dataBilling);
            });
          }
        }
      });
    }
  });

  app.get("/list-dhl-token", (req, res) => {
    parcelServices.selectDhlToken(db).then((listToken) => {
      return res.json(listToken);
    });
  });

  app.get("/get-new-tracking", (req, res) => {
    var qs = queryString.stringify({
      prefix: "TDZ"
    });
    request(
      {
        url:
          "https://www.945holding.com/webservice/restful/parcel/gentracking/v11/generator",
        method: "POST",
        headers: {
          apikey: "XbOiHrrpH8aQXObcWj69XAom1b0ac5eda2b",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: qs
      },
      (err, result, body) => {
        var newTracking = JSON.parse(result.body);
        res.send(newTracking[0]);
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

  app.get("/get-excel-file", function (req, res) {
    var date_check = req.query.date_check;

    var date_now = new Date();
    var current_date = m(date_now).tz("Asia/Bangkok").format("YYYY-MM-DD", true);
    var current_date_excel = m(date_now).tz("Asia/Bangkok").format("YYMMDDHHmmss", true);
    var random_number = Math.floor(Math.random() * (999 - 111)) + 111;
    var number_parcel = 0;

    var filename = "My945_Parcel_TDZ_" + current_date_excel + "_" + random_number + ".xlsx";
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

    parcelServices.getDailyData(db, date_check).then(function (data) {
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

      smtpTransport.sendMail(mail, function (error, response) {
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

  app.get("/get-excel-file-unbook", function (req, res) {
    var date_check = req.query.date_check;
    var date_now = new Date();
    var current_date = m(date_now).tz("Asia/Bangkok").format("YYYY-MM-DD", true);
    var current_date_excel = m(date_now).tz("Asia/Bangkok").format("YYMMDDHHmmss", true);
    var random_number = Math.floor(Math.random() * (999 - 111)) + 111;
    var number_parcel = 0;

    var filename = "My945_Parcel_TDZ_" + current_date_excel + "_" + random_number + ".xlsx";
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

    parcelServices.getDailyDataUnbook(db, date_check).then(function (result) {
      if (result === null) {
        res.end("no data");
      } else {
        listTracking = [];
        var resultList = [];
        result.forEach(value => {
          var item_valid = true;
          item_valid = true;
          item_valid = isGenericValid(value, "tracking", item_valid, resultList, value.tracking);
          item_valid = isGenericValid(value, "receiver_name", item_valid, resultList, value.tracking);
          item_valid = isGenericValid(value, "receiver_address", item_valid, resultList, value.tracking);
          item_valid = isGenericValid(value, "district_name", item_valid, resultList, value.tracking);
          item_valid = isGenericValid(value, "province_name", item_valid, resultList, value.tracking);
          item_valid = isGenericValid(value, "zipcode", item_valid, resultList, value.tracking);
          item_valid = isGenericValid(value, "phone", item_valid, resultList, value.tracking);
          item_valid = isGenericValid(value, "billing_no", item_valid, resultList, value.tracking);

          if (item_valid) {
            listTracking.push(value);
          }
        });

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

        wb.write(filename, res);
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
    return new Promise(function (resolve, reject) {
      var url945api = "https://www.945api.com";
      request(
        {
          url: url945api + "/parcel/check/tracking/list/api",
          method: "POST",
          body: data2,
          json: true
        },
        (err, res2, body) => {
          if (err === null) {
            if (res2.body.status != true) {
              resolve(false);
            } else {
              parcelServices.checkDuplicatedTracking(db, tracking).then(function (data) {
                resolve(data);
              });
            }
          }
        });
    });
  }

  function voidBilling(billingNo) {
    return new Promise(function (resolve, reject) {
      console.log("start void billing = %s", billingNo);
      parcelServices.sendDataToServer(db, billingNo).then(dataTo945 => {
        if (dataTo945 == false) {
          console.log("not ready to void billing = %s", billingNo);
          resolve(false);
        } else {
          parcelServices.updateVoidBilling(db, billingNo).then(resultVoidBilling => {
            if (resultVoidBilling) {
              console.log("send to parcel exchange void-billing = %s", billingNo);
              amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.void-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
              console.log("sent to parcel exchange void-billing = %s", billingNo);

              console.log("send to share exchange void-billing = %s", billingNo);
              amqpChannel.publish("share.exchange.void-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
              console.log("sent to share exchange void-billing = %s", billingNo);
              resolve(true);
            } else {
              console.log("cannot update to void billing = %s", billingNo);
              resolve(false);
            }
          });
        }
      });
    });
  }

  function createBilling(billingInfo, listCreateTracking, currentMember) {
    return new Promise(function (resolve, reject) {
      var dataCreateBillingNo = {
        user_id: billingInfo.billing.user_id,
        branch_id: billingInfo.billing.branch_id
      };
      request(
        {
          url: "https://pos.945.report/genBillNo/genBillingNumber",
          method: "POST",
          body: dataCreateBillingNo,
          json: true
        },
        (err, res2, body) => {
          if (res2.statusCode == 200) {
            if (res2.body.billing_no == undefined) {
              resolve(false);
            } else {
              var newBillingNo = res2.body.billing_no;

              console.log("restructure billing = %s", newBillingNo);
              var total = 0;
              listCreateTracking.forEach(value => {
                total += value.size_price;
              });

              parcelServices.saveDataBilling(db, billingInfo.billing, currentMember, total, newBillingNo).then(async data => {
                if (data) {
                  listTracking = [];
                  for (let item of listCreateTracking) {
                    listTracking.push(await parcelServices.updateBillingNoItem(db, newBillingNo, item, currentMember));
                  }
                  if (listTracking.length == listCreateTracking.length) {
                    parcelServices.updateCompleteStatusBilling(db, newBillingNo).then(resultUpdateBilling => {
                      if (resultUpdateBilling) {
                        parcelServices.sendDataToServer(db, newBillingNo).then(async dataTo945 => {
                          console.log("send to parcel exchange restructure-billing = %s", newBillingNo);
                          amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.restructure-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
                          console.log("sent to parcel exchange restructure-billing = %s", newBillingNo);

                          console.log("send to share exchange restructure-billing = %s", newBillingNo);
                          amqpChannel.publish("share.exchange.restructure-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
                          console.log("sent to share exchange restructure-billing = %s", newBillingNo);

                          resolve({ status: "success", billingNo: newBillingNo });
                        });
                      } else {
                        resolve(false);
                      }
                    });
                  } else {
                    resolve(false);
                  }
                } else {
                  resolve(false);
                }
              });
            }
          } else {
            resolve(false);
          }
        });
    });
  }

  function createBillingRelabel(billingInfo, billingItemInfo, currentValue, causeType, reason, remark) {
    return new Promise(function (resolve, reject) {
      var dataCreateBillingNo = {
        user_id: billingInfo[0].user_id,
        branch_id: billingInfo[0].branch_id
      };
      request(
        {
          url: "https://pos.945.report/genBillNo/genBillingNumber",
          method: "POST",
          body: dataCreateBillingNo,
          json: true
        },
        (err, res2, body) => {
          if (res2.statusCode == 200) {
            if (res2.body.billing_no == undefined) {
              resolve(false);
            } else {
              var newBillingNo = res2.body.billing_no;
              var total = 0;

              console.log("create billing relabel = %s", newBillingNo);
              if (causeType == 1) {
                currentValue.billingItem.sizePrice = 0;
                total = 0;
              } else {
                total = currentValue.billingItem.sizePrice;
              }

              parcelServices.saveDataBillingRelabel(db, billingInfo[0], total, newBillingNo).then(dataBilling => {
                if (dataBilling) {
                  parcelServices.saveDataBillingItemRelabel(db, newBillingNo, billingItemInfo, currentValue).then(dataBillingItem => {
                    if (dataBillingItem) {
                      parcelServices.updateCompleteStatusBilling(db, newBillingNo).then(resultUpdateBilling => {
                        if (resultUpdateBilling) {
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
                          var listDataToServer = [];

                          async function setFormatToServer() {
                            for (i = 0; i < listBilling.length; i++) {
                              listDataToServer.push(parcelServices.sendRelabelDataToServer(db, listBilling[i].billingNo, listBilling[i].tracking));
                            }
                            var resultArr = await Promise.all(
                              listDataToServer
                            );
                            return resultArr;
                          }
                          setFormatToServer().then(function (result) {
                            let strReason = "";
                            if (reason == "change_cod_to_normal") {
                              strReason = "เปลี่ยนประเภท COD เป็น NORMAL";
                            }
                            if (reason == "change_normal_to_cod") {
                              strReason = "เปลี่ยนประเภท NORMAL เป็น COD";
                            }
                            if (reason == "change_codvalue") {
                              strReason = "เปลี่ยนมูลค่า COD";
                            }
                            if (reason == "change_address") {
                              strReason = "เปลี่ยนที่อยู่";
                            }
                            if (reason == "close_status_early_due") {
                              strReason = "ปิดสถานะก่อนกำหนด";
                            }

                            var dataTo945 = {
                              relabelBilling: result[0],
                              restructureBilling: result[1],
                              causeType: causeType == 1 ? "945 เป็นฝ่ายผิด" : "ลูกค้า/shop เป็นฝ่ายผิด",
                              reason: strReason,
                              remark: remark
                            };

                            let dataBilling = {
                              billing_no: newBillingNo,
                              source: "RELABEL"
                            };
                            console.log("send relabel to parcel exchange prepare-billing = %s", newBillingNo);
                            amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.prepare-billing", "", Buffer.from(JSON.stringify(dataBilling)), { persistent: true });
                            console.log("sent relabel to parcel exchange prepare-billing = %s", newBillingNo);

                            console.log("send to parcel exchange relabel-billing = %s", newBillingNo);
                            amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.relabel-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
                            console.log("sent to parcel exchange relabel-billing = %s", newBillingNo);

                            console.log("send to share exchange relabel-billing = %s", newBillingNo);
                            amqpChannel.publish("share.exchange.relabel-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
                            console.log("sent to share exchange relabel-billing = %s", newBillingNo);

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
            }
          } else {
            resolve(false);
          }
        });
    });
  }

  function createReCalBilling(billingInfo, listTracking, moduleName, user) {

    return new Promise(async function (resolve, reject) {
      let newBillingNo = await getBillingManual(billingInfo.branch_id, billingInfo.user_id, billingInfo.billing_date);
      console.log("re-cal billing = %s", newBillingNo);

      var total = 0;
      listTracking.forEach(value => {
        total += value.sizeInfo.parcel_price;
      });

      parcelServices.saveReCalDataBilling(db, billingInfo, total, newBillingNo).then(async draftBilling => {
        if (draftBilling) {
          let output = [];
          for (let item of listTracking) {
            output.push(await parcelServices.saveReCalBillingItem(db, newBillingNo, item));
          }
          if (output.length == listTracking.length) {
            parcelServices.updateCompleteStatusBilling(db, newBillingNo).then(async resultUpdateBilling => {
              if (resultUpdateBilling) {
                parcelServices.sendDataToServer(db, newBillingNo).then(async dataTo945 => {
                  console.log("send to parcel exchange restructure-billing = %s", newBillingNo);
                  amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.restructure-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
                  console.log("sent to parcel exchange restructure-billing = %s", newBillingNo);

                  console.log("send to share exchange restructure-billing = %s", newBillingNo);
                  amqpChannel.publish("share.exchange.restructure-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
                  console.log("sent to share exchange restructure-billing = %s", newBillingNo);

                  /* save log */
                  var listLogTracking = [];
                  var previous_value_log = billingInfo.status + "/" + billingInfo.billing_no;
                  var current_value_log = "re-cal billing" + "/" + newBillingNo;

                  for (let val of listTracking) {
                    listLogTracking.push(await parcelServices.insertLog(db, billingInfo.billing_no, previous_value_log, current_value_log, "re-cal size", moduleName, user, val.tracking, "คำนวน size ใหม่"));
                  }

                  resolve({ status: "success", billingNo: newBillingNo });
                });
              } else {
                console.log("error cannot update complete ReCalDataBilling = %s", newBillingNo);
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        } else {
          console.log("error cannot save ReCalDataBilling = %s", newBillingNo);
          resolve(false);
        }
      });
    });
  }

  function createRemainBilling(billingInfo, listTracking) {

    return new Promise(async function (resolve, reject) {
      let newBillingNo = await getBillingManual(billingInfo.branch_id, billingInfo.user_id, billingInfo.billing_date);
      console.log("remain billing (re-cal) = %s", newBillingNo);

      var total = 0;
      listTracking.forEach(value => {
        total += value.size_price;
      });

      parcelServices.saveReCalDataBilling(db, billingInfo, total, newBillingNo).then(async draftBilling => {
        if (draftBilling) {
          let output = [];
          for (let item of listTracking) {
            output.push(await parcelServices.saveRemainBillingItem(db, newBillingNo, item));
          }
          if (output.length == listTracking.length) {
            parcelServices.updateCompleteStatusBilling(db, newBillingNo).then(resultUpdateBilling => {
              if (resultUpdateBilling) {
                parcelServices.sendDataToServer(db, newBillingNo).then(async dataTo945 => {
                  console.log("send to parcel exchange restructure-billing = %s", newBillingNo);
                  amqpChannel.publish(MY_AMQP_PREFIX + ".exchange.restructure-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
                  console.log("sent to parcel exchange restructure-billing = %s", newBillingNo);

                  console.log("send to share exchange restructure-billing = %s", newBillingNo);
                  amqpChannel.publish("share.exchange.restructure-billing", "", Buffer.from(JSON.stringify(dataTo945)), { persistent: true });
                  console.log("sent to share exchange restructure-billing = %s", newBillingNo);

                  resolve({ status: "success", billingNo: newBillingNo });
                });
              } else {
                console.log("error cannot update remain billing = %s", newBillingNo);
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        } else {
          console.log("error cannot save remain billing = %s", newBillingNo);
          resolve(false);
        }
      });
    });
  }

  /*******************************************************************************************************************************/
  function isGenericValid(data, key, defaultValue, resultList = null, check_tracking) {
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
    return defaultValue;
  }

  function isMatched(defaultValue, bi_type, br_type, bi_zipcode, br_zipcode, cod_value, resultList = null, check_tracking) {
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

  function isValidMatched(defaultValue, tracking, current_value, previous_value, autoInfo) {
    if (current_value.parcel_type !== "NORMAL" && current_value.parcel_type !== "COD") {
      console.log("type is wrong(ql checker) = %s", tracking);
      return false;
    }
    if (current_value.parcel_type == "NORMAL" && parseInt(current_value.cod_value) !== 0) {
      console.log("cod is wrong(ql checker) = %s", tracking);
      return false;
    }
    if (current_value.parcel_type == "COD" && (parseInt(current_value.cod_value) == 0 || current_value.cod_value == undefined || current_value.cod_value == "")) {
      console.log("cod is wrong(ql checker) = %s", tracking);
      return false;
    }
    if (current_value.parcel_type == "COD" && parseInt(current_value.cod_value) > 50000) {
      console.log("cod is over 50,000(ql checker) = %s", tracking);
      return false;
    }
    if (previous_value.sender_phone == current_value.phone) {
      console.log("sender phone = receiver phone (ql checker) = %s", tracking);
      return false;
    }
    if (autoInfo !== false) {
      let rawDataAutoStr = removeCharacter(autoInfo.raw_data);
      if (current_value.phone !== "0914271551" && rawDataAutoStr.search(current_value.phone) == -1) {
        console.log("receiver phone is not in raw data (ql checker) = %s", tracking);
        return false;
      }
    }
    return defaultValue;
  }

  function removeCharacter(text) {
    var newText = "";
    text = text.replace(/^[<br>]*/g, '');

    for (i = 0; i < text.length; i++) {
      if (text[i] == "-") {
        newCha = text[i].replace('-', '');
        newText += newCha;
      } else if (text[i] == " ") {
        newCha = text[i].replace(' ', '');
        newText += newCha;
      } else if (text[i] == ":") {
        newCha = text[i].replace(':', '');
        newText += newCha;
      } else if (text[i] == "?") {
        newCha = text[i].replace('?', '');
        newText += newCha;
      } else {
        newText += text[i];
      }
    }

    return newText;
  }

  async function getBillingManual(branchId, userId, datetimeInBilling) {
    let result = true;
    let output = "";

    let dateBilling = "";
    let timeBilling = "";
    let billingNo = "";
    let randomNo = 0;

    do {
      dateBilling = m(datetimeInBilling).tz("Asia/Bangkok").format("YYMMDD", true);
      timeBilling = m().tz("Asia/Bangkok").format("HHmmss", true);

      randomNo = Math.floor(Math.random() * (999 - 100)) + 100;
      billingNo = branchId + "-" + userId + "-" + dateBilling + timeBilling + "-" + randomNo;

      result = await parcelServices.checkDuplicateBillingNo(db, billingNo);

      output = result ? billingNo : "";

    } while (!result);

    return output;
  }
});

app.listen(port, () => console.log(`listening on port ${port}!`));
