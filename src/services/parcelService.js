// const parcel_connection = require("../env/parceldb.js");
const bodyParser = require("body-parser");
const request = require("request");
const moment = require("moment");
const m = require("moment-timezone");
moment.locale("th");

module.exports = {
  getBillingItemTracking: (db, tracking) => {
    let sql = `SELECT b.status as billing_status, b.branch_id, bi.billing_no, bi.tracking, bi.size_id, s.alias_size, bi.size_price, 
      bi.parcel_type as bi_parcel_type, bi.cod_value,bi.zipcode as bi_zipcode, br.parcel_type as br_parcel_type, 
      br.sender_name, br.sender_phone, br.sender_address, br.receiver_name, br.phone, br.receiver_address, 
      br.district_id, br.district_name, br.amphur_id, br.amphur_name, br.province_id, br.province_name, br.zipcode as br_zipcode, 
      br.booking_status, br.status, br.booking_flash_status, 
      d.DISTRICT_CODE, d.GEO_ID, a.AMPHUR_CODE, p.PROVINCE_CODE
      FROM billing_item bi 
      JOIN billing b ON bi.billing_no=b.billing_no
      LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking 
      JOIN postinfo_district d ON br.district_id=d.DISTRICT_ID AND br.amphur_id=d.AMPHUR_ID AND br.province_id=d.PROVINCE_ID 
      JOIN postinfo_amphur a ON br.amphur_id=a.AMPHUR_ID
      JOIN postinfo_province p ON br.province_id=p.PROVINCE_ID 
      JOIN size_info s ON bi.size_id= s.size_id
      WHERE bi.tracking=?`;
    let data = [tracking];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results) => {
        if (error == null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            var listActiveItem = [];
            results.forEach(item => {
              if (item.billing_status !== "cancel" && item.billing_status !== "relabel") {
                listActiveItem.push(item);
              }
            });
            resolve(listActiveItem);
          }
        } else {
          console.log("error query tracking = ", error);
          resolve(false);
        }
      });
    });
  },
  getTrackingImgUrl: (db, tracking) => {
    let sql = "SELECT image_url FROM parcel_capture_data WHERE barcode=?";
    let data = [tracking];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error == null) {
          if (results.length > 0) {
            let result = results[0].image_url !== "" && results[0].image_url !== null ? results : false;
            resolve(result);
          } else {
            resolve(false);
          }
        } else {
          console.log(error);
          resolve(false);
        }
      });
    });
  },
  checkDuplicatedTracking: (db, tracking) => {
    var sqlItem = "SELECT tracking FROM billing_item WHERE tracking = ?";

    var sqlItemTemp = "SELECT tracking FROM billing_item_temp WHERE tracking = ?";

    var sqlCapture = "SELECT barcode FROM parcel_capture_data WHERE barcode=?";

    return new Promise(function (resolve, reject) {
      db.query(sqlItem, [tracking], (err_item, results_item) => {
        if (err_item === null) {
          if (results_item.length <= 0) {
            db.query(sqlItemTemp, [tracking], (err_item_temp, results_item_temp) => {
              if (err_item_temp == null) {
                if (results_item_temp.length <= 0) {
                  db.query(sqlCapture, [tracking], (err_capture, results_capture) => {
                    if (err_capture == null) {
                      if (results_capture.length <= 0) {
                        resolve(true);
                      } else {
                        resolve(false);
                      }
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
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  getBillingInfo: (db, billing) => {
    let sql = `SELECT b.user_id, b.mer_authen_level, b.member_code, b.carrier_id, b.billing_date, b.billing_no, b.branch_id, b.total, b.img_url, b.status, b.ref_billing_no, bInfo.branch_name
    FROM billing b
    LEFT JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id
    WHERE billing_no=?`;
    let data = [billing];

    let sqlItem = `SELECT bi.tracking, bi.size_id, bi.size_price, bi.parcel_type, bi.cod_value, bi.source, 
    br.sender_name, br.sender_phone, br.sender_address, br.receiver_name, br.phone, br.receiver_address, 
    br.district_id, br.district_name, br.amphur_id, br.amphur_name, br.province_id, br.province_name, br.zipcode, br.status, br.remark, 
    br.booking_status, br.booking_flash_status, br.booking_date, br.booking_flash_date, s.alias_size
    FROM billing_item bi
    LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
    JOIN size_info s ON bi.size_id=s.size_id
    WHERE bi.billing_no=?`;
    let dataItem = [billing];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (errBilling, resultsBilling) => {
        if (errBilling === null) {
          if (resultsBilling.length <= 0) {
            resolve(false);
          } else {
            db.query(sqlItem, dataItem, (errItem, resultsItem) => {
              if (errItem == null) {
                if (resultsItem.length <= 0) {
                  resolve(false);
                } else {
                  resultsItem.forEach(item => {
                    if (resultsBilling[0].status == "cancel") {
                      item.status = resultsBilling[0].status;
                    } else {
                      item.status = item.status;
                    }
                  });
                  var dataResult = {
                    billing: resultsBilling[0],
                    billingItem: resultsItem
                  };
                  resolve(dataResult);
                }
              } else {
                resolve(false);
              }
            });
          }
        } else {
          console.log(err);
          resolve(false);
        }
      });
    });
  },
  getListTrackingNotMatch: db => {
    var current_date = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var weekAgo = moment(current_date).add(-2, "week").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    let sql = `SELECT bInfo.branch_name,b.branch_id,bi.tracking,bi.parcel_type as bi_type,bi.cod_value,bi.zipcode as bi_zipcode,br.parcel_type as br_type,br.zipcode as br_zipcode
    FROM billing b 
    JOIN billing_item bi ON b.billing_no=bi.billing_no 
    JOIN billing_receiver_info br ON bi.tracking=br.tracking 
    JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id
    WHERE (b.billing_date >= ? AND b.billing_date < ?) AND (br.status != 'cancel' OR br.status is null)`;
    let data = [weekAgo, current_date];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            var listTracking = [];
            var resultList = [];
            results.forEach(value => {
              var item_valid = true;
              item_valid = isGenericValid(value, "branch_name", item_valid, (resultList = null), value.tracking);
              // item_valid = isGenericValid(value, "branch_id", item_valid, resultList, value.tracking);
              item_valid = isGenericValid(value, "tracking", item_valid, (resultList = null), value.tracking);
              item_valid = isGenericValid(value, "bi_type", item_valid, (resultList = null), value.tracking);
              // item_valid = isGenericValid(value, "cod_value", item_valid, resultList, value.tracking);
              item_valid = isGenericValid(value, "bi_zipcode", item_valid, (resultList = null), value.tracking);
              item_valid = isGenericValid(value, "br_type", item_valid, (resultList = null), value.tracking);
              item_valid = isGenericValid(value, "br_zipcode", item_valid, (resultList = null), value.tracking);

              if (item_valid) {
                listTracking.push(value);
              }
            });
            resolve(listTracking);
          }
        } else {
          console.log(error);
          resolve(false);
        }
      });
    });
  },
  selectTrackingToCheck: (db, branch_id) => {
    let sql = `SELECT bi.tracking FROM billing b 
      Left JOIN billing_item bi ON b.billing_no=bi.billing_no 
      LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking 
      WHERE (bi.zipcode<>br.zipcode OR bi.parcel_type <> br.parcel_type OR (bi.parcel_type='COD' AND bi.cod_value=0) OR (bi.parcel_type='NORMAL' AND bi.cod_value > 0)) AND 
        (br.status not in ('cancel','SUCCESS','success') OR br.status is null) AND b.branch_id=? LIMIT 1`;
    let data = [branch_id];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error === null) {
          if (results.length == 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          console.log(error);
          resolve(false);
        }
      });
    });
  },
  selectBillingInfo: (db, billing_no) => {
    let sql = `SELECT * FROM billing WHERE billing_no=?`;
    let data = [billing_no];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error === null) {
          if(results.length > 0){
            resolve(results);
          } else {
            console.log("no data, %s", billing_no);
            resolve(null);
          }
        } else {
          console.log(error);
          resolve(false);
        }
      });
    });
  },
  parcelSizeList: (db, zone) => {
    let sql = `SELECT alias_size FROM size_info GROUP BY alias_size ORDER BY min(parcel_price) ASC`;

    return new Promise(function (resolve, reject) {
      db.query(sql, (error, results, fields) => {
        if (error === null) {
          if (results.length == 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          console.log(error);
          resolve(false);
        }
      });
    });
  },
  checkDistrict: (db, zipcode) => {
    var sql = `SELECT district_code FROM postinfo_zipcodes WHERE zipcode = ?`;
    var data = [zipcode];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length == 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        }
      });
    });
  },
  checkPrice: (db, code, size_name, zone) => {
    var sql = `SELECT size_id,parcel_price FROM size_info where location_zone=? and alias_size= ? and zone=?`;
    var data = [code, size_name, zone];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        resolve(results);
      });
    });
  },
  updateStatusBilling: (db, billing_no) => {
    let updateBilling = `UPDATE billing SET status='cancel' WHERE billing_no=?`;
    let selectBillingItem = `SELECT tracking FROM billing_item WHERE billing_no=?`;
    let updateStatusReceiver = `UPDATE billing_receiver_info SET status='cancel' WHERE tracking=?`;
    let dataBilling = [billing_no];

    return new Promise(function (resolve, reject) {
      db.query(updateBilling, dataBilling, (error, results, fields) => { });
      db.query(selectBillingItem, dataBilling, (error, resListTracking, fields) => {
        for (i = 0; i < resListTracking.length; i++) {
          let dataTracking = [resListTracking[i].tracking];
          db.query(updateStatusReceiver, dataTracking, (error, results2, fields) => { });
        }
      });
    });
  },
  updateStatusReceiver: (db, status, tracking) => {
    let sql = `UPDATE billing_receiver_info SET status=? WHERE tracking=?`;
    let data = [status, tracking];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error === null) {
          if (results.affectedRows > 0) {
            resolve(tracking);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  selectParcelSize: (db, billingNo) => {
    let sql = `SELECT b.size_price FROM billing_item b JOIN billing_receiver_info br ON b.tracking=br.tracking WHERE b.billing_no=? AND (br.status!='cancel' OR br.status is null)`;
    let data = [billingNo];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (results.length <= 0) {
          resolve(0);
        } else {
          resolve(results);
        }
      });
    });
  },
  updateBillingInfo: (db, current_total, billing_no) => {
    let sqlTotal = `UPDATE billing SET total=? WHERE billing_no=?`;
    let dataTotal = [current_total, billing_no];

    let sqlStatus = `UPDATE billing SET status=? WHERE billing_no=?`;
    let dataStatus = ["cancel", billing_no];

    return new Promise(function (resolve, reject) {
      if (current_total == 0) {
        db.query(sqlStatus, dataStatus, (error, results, fields) => {
          resolve(results);
        });
      } else {
        db.query(sqlTotal, dataTotal, (error, results, fields) => {
          resolve(results);
        });
      }
    });
  },
  updateReceiverInfo: (db, tracking, newAddress) => {
    let sql = `UPDATE billing_receiver_info SET receiver_name=?, phone=?, receiver_address=?, status=? WHERE tracking=? AND status is null`;
    let data = [newAddress.receiver_name, newAddress.receiver_phone, newAddress.receiver_address, "ready", tracking];

    let sqlLog = `UPDATE response_flash_log SET status=? WHERE tracking=?`;
    let dataLog = [99, tracking];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error == null) {
          if (results.affectedRows > 0) {
            db.query(sqlLog, dataLog, (errorLog, resultsLog, fields) => {
              if (errorLog == null) {
                if (resultsLog.affectedRows > 0) {
                  resolve(true);
                } else {
                  resolve(false);
                }
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
    });
  },
  addressInfo: (db, district_code) => {
    let sql = `SELECT d.DISTRICT_ID,d.DISTRICT_NAME,a.AMPHUR_ID,a.AMPHUR_NAME,p.PROVINCE_ID,p.PROVINCE_NAME,z.zipcode 
      FROM postinfo_district d 
      JOIN postinfo_zipcodes z ON d.DISTRICT_CODE=z.district_code 
      JOIN postinfo_amphur a ON d.AMPHUR_ID=a.AMPHUR_ID 
      JOIN postinfo_province p ON d.PROVINCE_ID=p.PROVINCE_ID 
      WHERE d.DISTRICT_CODE=?`;
    let data = [district_code];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error === null) {
          resolve(results);
        } else {
          console.log(error);
          resolve(false);
        }
      });
    });
  },
  updateCheckerInfo: (db, billing_no, tracking, size_id, size_price, cod_value, receiver_name, phone, address, parcel_type, district_id, district_name, amphur_id, amphur_name, province_id, province_name, zipcode) => {
    let sqlBillingItem = `UPDATE billing_item SET zipcode=?, size_id=?, size_price=?, parcel_type=?, cod_value=? WHERE tracking=?`;
    let dataBillingItem = [zipcode, size_id, size_price, parcel_type, cod_value, tracking];

    let sqlReceiver = `UPDATE billing_receiver_info SET parcel_type=?, receiver_name=?, phone=?, receiver_address=?, district_id=?, district_name=?, amphur_id=?, amphur_name=?, province_id=?, province_name=?, zipcode=? WHERE tracking=?`;
    let dataReceiver = [parcel_type, receiver_name, phone, address, district_id, district_name, amphur_id, amphur_name, province_id, province_name, zipcode, tracking];

    let sqlSizeItem = `SELECT size_price FROM billing_item WHERE billing_no=?`;
    let dataSizeItem = [billing_no];

    let total = 0;

    return new Promise(function (resolve, reject) {
      db.query(sqlBillingItem, dataBillingItem, (error1, resultsItem, fields) => {
        if (error1 === null) {
          if (resultsItem.affectedRows > 0) {
            db.query(sqlReceiver, dataReceiver, (error2, resultsReceiver, fields) => {
              if (error2 === null) {
                if (resultsReceiver.affectedRows > 0) {
                  db.query(sqlSizeItem, dataSizeItem, (error, resultsSizeItem, fields) => {
                    for (i = 0; i < resultsSizeItem.length; i++) {
                      total += resultsSizeItem[i].size_price;
                    }
                    resolve(total);
                  });
                } else {
                  console.log("resultsReceiver", resultsReceiver);
                  resolve(false);
                }
              } else {
                console.log("error2", error2);
                resolve(false);
              }
            });
          } else {
            console.log("resultsItem", resultsItem);
            resolve(false);
          }
        } else {
          console.log("error1", error1);
          resolve(false);
        }
      });
    });
  },
  updateBilling: (db, billing_no, current_total) => {
    let sql = `UPDATE billing SET total=? WHERE billing_no=?`;
    let data = [current_total, billing_no];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  updateResendBilling: (db, billing_no, status) => {
    let sql = `UPDATE billing SET status='booked', prepare_raw_data=null WHERE billing_no=? AND status=?`;
    let data = [billing_no, status];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error == null) {
          resolve(results);
        } else {
          resolve(false);
        }
      });
    });
  },
  updateMemberBilling: (db, billing_no, member_code) => {
    let sql = `UPDATE billing SET member_code=? WHERE billing_no=?`;
    let data = [member_code, billing_no];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error == null) {
          if (results.affectedRows > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  updateSenderInfo: (db, sender_name, sender_phone, sender_address, tracking) => {
    let sql = `UPDATE billing_receiver_info SET sender_name=?,sender_phone=?,sender_address=? WHERE tracking=?`;
    let data = [sender_name, sender_phone, sender_address, tracking];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error == null) {
          if (results.affectedRows > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  saveLogQlChecker: (db, branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key) => {
    let sql = `INSERT INTO log_ql_checker(branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key, record_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let data = [branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key, new Date()];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error === null) {
          resolve(results);
        } else {
          console.log(error);
          resolve(false);
        }
      });
    });
  },
  findOperator: (db, tracking) => {
    let sql = `SELECT operator_id FROM parcel_keyin_data_temp WHERE barcode=?`;
    let data = [tracking];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error === null) {
          resolve(results);
        }
      });
    });
  },
  insertLog: (db, billing_no, previous_value, current_value, reason, module_name, user, ref, remark) => {
    let sql = `INSERT INTO log_parcel_tool(billing_no, time_to_system, previous_value, current_value,reason, module_name, user, ref,remark) VALUES (?,?,?,?,?,?,?,?,?)`;
    let data = [billing_no, new Date(), previous_value, current_value, reason, module_name, user, ref, remark];
    return new Promise(function (resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  saveTracking: (db, tracking) => {
    let sqlCheck = `SELECT tracking FROM test_dhl_response WHERE tracking=?`;
    let dataCheck = [tracking];

    let sql = `INSERT INTO test_dhl_response(tracking) VALUES (?)`;
    let data = [tracking];

    return new Promise(function (resolve, reject) {
      db.query(sqlCheck, dataCheck, (error, results, fields) => {
        if (error === null) {
          if (results.length > 0) {
            resolve(false);
          } else {
            db.query(sql, data, (error, results, fields) => {
              resolve(true);
            });
          }
        } else {
          console.log(error);
          resolve(false);
        }
      });
    });
  },
  getDailyData: (db, date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    console.log("getDailyData", current_date, nextDay);
    var sqlBilling = `SELECT bi.tracking,bi.billing_no,bi.cod_value,br.receiver_name,br.phone,br.receiver_address,br.district_name,br.amphur_name,br.province_name,br.zipcode
    FROM billing b
    JOIN billing_item bi ON b.billing_no=bi.billing_no
    JOIN billing_receiver_info br ON bi.tracking=br.tracking
    WHERE (b.billing_date>=? AND b.billing_date<?)`;
    var data = [current_date, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sqlBilling, data, (error, results, fields) => {
        if (error === null) {
          if (results.length <= 0) {
            resolve(null);
          } else {
            resolve(results);
          }
        } else {
          console.log("getDailyData error=>", error);
          resolve(null);
        }
      });
    });
  },
  getDailyDataUnbook: (db, date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sqlBilling = `SELECT bi.tracking,bi.billing_no,bi.cod_value,br.receiver_name,br.phone,br.receiver_address,br.district_name,br.amphur_name,br.province_name,br.zipcode
    FROM billing b
    JOIN billing_item bi ON b.billing_no=bi.billing_no
    JOIN billing_receiver_info br ON bi.tracking=br.tracking
    WHERE (b.billing_date>=? AND b.billing_date<?) AND (br.booking_status != 100 OR br.booking_status is null)`;
    var data = [current_date, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sqlBilling, data, (error, results, fields) => {
        if (error === null) {
          if (results.length <= 0) {
            resolve(null);
          } else {
            resolve(results);
          }
        } else {
          console.log("getDailyDataUnbook error=>", error);
          resolve(null);
        }
      });
    });
  },
  reportBranch: (db, date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT b.branch_id,bInfo.branch_name,b.billing_no,br.sender_name,b.status,b.billing_date,br.booking_status
    FROM billing b 
    JOIN billing_item bi ON b.billing_no=bi.billing_no 
    JOIN billing_receiver_info br ON bi.tracking=br.tracking 
    JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id 
    WHERE (b.billing_date>=? AND b.billing_date<?) AND (br.status != 'cancel' OR br.status is null) AND (b.status!='cancel' OR b.status is null)`;
    var data = [current_date, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          resolve(results);
        } else {
          resolve(false);
        }
      });
    });
  },
  dailyReport: (db, date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT b.branch_id,bInfo.branch_name,b.billing_no,br.sender_name,b.status,b.billing_date,br.booking_status, br.booking_flash_status
    FROM billing b 
    JOIN billing_item bi ON b.billing_no=bi.billing_no 
    JOIN billing_receiver_info br ON bi.tracking=br.tracking 
    JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id 
    WHERE (b.billing_date>=? AND b.billing_date<?) AND (br.status != 'cancel' OR br.status is null) AND b.status NOT IN ('cancel','SUCCESS')`;
    var data = [current_date, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          resolve(results);
        } else {
          resolve(false);
        }
      });
    });
  },
  dailyListTracking: (db, billing_no) => {
    var sql = `SELECT bi.tracking,s.alias_size,bi.size_price,bi.parcel_type as bi_parcel_type,bi.zipcode as bi_zipcode,bi.cod_value,bi.source, 
    br.parcel_type as br_parcel_type,br.sender_name,br.sender_phone,br.sender_address,br.receiver_name,br.phone,br.receiver_address,
    br.district_name,br.amphur_name,br.province_name,br.zipcode as br_zipcode,br.status,br.sending_date,
    br.booking_status,br.booking_date,br.booking_flash_status,br.booking_flash_date 
    FROM billing_item bi 
    JOIN billing_receiver_info br ON bi.tracking = br.tracking 
    JOIN size_info s ON bi.size_id = s.size_id
    WHERE bi.billing_no=?`;
    var data = [billing_no];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  summaryBooking: (db, date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sqlListTracking = `SELECT bi.tracking, br.booking_status, br.booking_flash_status FROM billing b
    LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no
    LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
    WHERE (b.billing_date>=? AND b.billing_date<?) AND (br.status != 'cancel' OR br.status is null)`;
    var dataListTracking = [current_date, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sqlListTracking, dataListTracking, (err, results) => {
        if (err == null) {
          resolve(results);
        } else {
          resolve(false);
        }
      });
    });
  },
  getCaptureData: (db, date_check) => {
    var current_date = moment(date_check + " 00:00:00").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT phone_number, barcode, record_created_at, raw_data FROM parcel_capture_data WHERE record_created_at >= ? AND record_created_at < ?`;
    var data = [current_date, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, async (err, results) => {
        if (err == null) {
          if (results.length > 0) {
            var listTrackingInfo = [];
            for (let item of results) {
              let enRawData = JSON.parse(item.raw_data);
              if (enRawData.dataType == "API_JSON_TEXT") {
                item.data_type = "AUTOLABEL";
              } else {
                item.data_type = "CAPTURE";
              }
              listTrackingInfo.push({
                phone_number: item.phone_number,
                barcode: item.barcode,
                record_created_at: item.record_created_at,
                data_type: item.data_type,
              });
            }
            resolve(listTrackingInfo);
          } else {
            resolve(null);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  getBillingItem: (db, data) => {
    let sql = `SELECT tracking, source FROM billing_item WHERE tracking=?`;
    let dataToDb = [data.barcode];

    return new Promise(function (resolve, reject) {
      db.query(sql, dataToDb, (error, results, fields) => {
        if (error == null) {
          if (results.length > 0) {
            data.billing_source = results[0].source;
            resolve(data);
          } else {
            resolve(data);
          }
        } else {
          resolve(data);
        }
      });
    });
  },
  listErrorMaker: db => {
    var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key, record_date FROM log_ql_checker WHERE (record_date >= ? AND record_date < ?)`;
    var data = [today, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  bookingFlashReport: db => {
    var sql = `SELECT * FROM response_flash_log WHERE status != ? AND status != ?`;
    var data = [100, 99];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  saveDistrictFlash: (db, address, newAddress) => {
    let district_id = address.district_id;
    let district_code = address.DISTRICT_CODE;
    let district_name = newAddress.district_name;
    let amphur_id = address.amphur_id;
    let province_id = newAddress.province_info.PROVINCE_ID;
    let geo_id = address.GEO_ID;

    let selectDistrict = `SELECT * FROM postinfo_district_flash WHERE DISTRICT_ID=?`;

    let updateDistrict = `UPDATE postinfo_district_flash SET DISTRICT_ID=?, DISTRICT_CODE=?, DISTRICT_NAME=?, AMPHUR_ID=?, PROVINCE_ID=? WHERE DISTRICT_CODE=?`;
    let dataUpdateDistrict = [district_id, district_code, district_name, amphur_id, parseInt(province_id), district_code];

    let saveDistrict = `INSERT INTO postinfo_district_flash(DISTRICT_ID, DISTRICT_CODE, DISTRICT_NAME, AMPHUR_ID, PROVINCE_ID, GEO_ID) VALUES (?, ?, ?, ?, ?, ?)`;
    let dataDistrict = [district_id, district_code, district_name, amphur_id, parseInt(province_id), geo_id];

    return new Promise(function (resolve, reject) {
      db.query(selectDistrict, [district_id], (error, result) => {
        if (error == null) {
          if (result.length > 0) {
            db.query(updateDistrict, dataUpdateDistrict, (errorUpdate, resultUpdate) => {
              if (errorUpdate == null) {
                if (resultUpdate.affectedRows > 0) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              } else {
                resolve(false);
              }
            });
          } else {
            db.query(saveDistrict, dataDistrict, (errorSave, resultSave) => {
              if (errorSave == null) {
                if (resultSave.affectedRows > 0) {
                  resolve(true);
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
  },
  saveAmphurFlash: (db, address, newAddress) => {
    let amphur_id = address.amphur_id;
    let amphur_code = address.AMPHUR_CODE;
    let amphur_name = newAddress.amphur_name;
    let province_id = newAddress.province_info.PROVINCE_ID;
    let geo_id = address.GEO_ID;
    let selectAmphur = `SELECT * FROM postinfo_amphur_flash WHERE AMPHUR_ID=?`;

    let updateAmphur = `UPDATE postinfo_amphur_flash SET AMPHUR_ID=?, AMPHUR_NAME=?, PROVINCE_ID=? WHERE AMPHUR_ID=?`;
    let dataUpdateAmphur = [amphur_id, amphur_name, parseInt(province_id), amphur_id];

    let saveAmphur = `INSERT INTO postinfo_amphur_flash(AMPHUR_ID, AMPHUR_CODE, AMPHUR_NAME, GEO_ID, PROVINCE_ID) VALUES (?, ?, ?, ?, ?)`;
    let dataAmphur = [amphur_id, amphur_code, amphur_name, geo_id, parseInt(province_id)];

    return new Promise(function (resolve, reject) {
      db.query(selectAmphur, [amphur_id], (error, result) => {
        if (error == null) {
          if (result.length > 0) {
            db.query(updateAmphur, dataUpdateAmphur, (errorUpdate, resultUpdate) => {
              if (errorUpdate == null) {
                if (resultUpdate.affectedRows > 0) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              } else {
                resolve(false);
              }
            });
          } else {
            db.query(saveAmphur, dataAmphur, (errorSave, resultSave) => {
              if (errorSave == null) {
                if (resultSave.affectedRows > 0) {
                  resolve(true);
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
  },
  saveZipcodeFlash: (db, address, newAddress) => {
    let district_code = address.DISTRICT_CODE;
    let zipcode = newAddress.zipcode;
    let dhlZipcode = address.br_zipcode;

    let selectZipcode = `SELECT * FROM postinfo_zipcodes_flash WHERE district_code=? AND dhl_zipcode=?`;

    let updateZipcode = `UPDATE postinfo_zipcodes_flash SET district_code=?, zipcode=? WHERE district_code=? AND dhl_zipcode=?`;
    let dataUpdateZipcode = [district_code, zipcode, district_code, dhlZipcode];

    let saveZipcode = `INSERT INTO postinfo_zipcodes_flash(district_code, dhl_zipcode, zipcode) VALUES (?, ?, ?)`;
    let dataZipcode = [district_code, dhlZipcode, zipcode];

    return new Promise(function (resolve, reject) {
      db.query(selectZipcode, [district_code, dhlZipcode], (error, result) => {
        if (error == null) {
          if (result.length > 0) {
            db.query(updateZipcode, dataUpdateZipcode, (errorUpdate, resultUpdate) => {
              if (errorUpdate == null) {
                if (resultUpdate.affectedRows > 0) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              } else {
                resolve(false);
              }
            });
          } else {
            db.query(saveZipcode, dataZipcode, (errorSave, resultSave) => {
              if (errorSave == null) {
                if (resultSave.affectedRows > 0) {
                  resolve(true);
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
  },
  log_parcel_tool: (db, ref) => {
    var sql = `SELECT billing_no, time_to_system, previous_value, current_value,reason, module_name, user, ref,remark FROM log_parcel_tool WHERE ref=?`;
    var data = [ref];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  logDailyQlChecker: (db, dateCheck) => {
    var currentDay = moment(dateCheck + " 00:00:00").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(currentDay).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT log_ql.*, b_info.branch_name FROM log_ql_checker log_ql JOIN branch_info b_info ON log_ql.branch_id=b_info.branch_id WHERE record_date >= ? AND record_date < ?`;
    var data = [currentDay, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  logDailyTool: (db, dateCheck) => {
    var currentDay = moment(dateCheck + " 00:00:00").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(currentDay).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT log_tool.*, b_info.branch_name
    FROM log_parcel_tool log_tool
    JOIN billing b ON log_tool.billing_no = b.billing_no
    JOIN branch_info b_info ON b.branch_id = b_info.branch_id
    WHERE (time_to_system >=? AND time_to_system < ?)`;
    var data = [currentDay, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  logRelabelTool: (db, dateCheck) => {
    var currentDay = moment(dateCheck + " 00:00:00").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(currentDay).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var previousMonth = moment(currentDay).add(-1, "month").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var moduleName = 'relabeling_tracking';

    var sql = `SELECT log_tool.*, b_info.branch_name
    FROM log_parcel_tool log_tool
    JOIN billing b ON log_tool.billing_no = b.billing_no
    JOIN branch_info b_info ON b.branch_id = b_info.branch_id
    WHERE (time_to_system > ? AND time_to_system <= ?) AND module_name = ?`;
    var data = [previousMonth, nextDay, moduleName];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  listCapture: (db, dateCheck) => {
    var currentDay = moment(dateCheck + " 00:00:00").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(currentDay).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT phone_number, barcode FROM parcel_capture_data WHERE record_created_at >= ? AND record_created_at < ?`;
    var data = [currentDay, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  listCaptureCheckBillingItem: (db, dataToCheck, dateCheck) => {
    var currentDay = moment(dateCheck + " 00:00:00").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(currentDay).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    let countQl = 0;
    let countQQ = 0;

    var sql = `SELECT pc.barcode, bi.source FROM parcel_capture_data pc
    JOIN billing_item bi ON pc.barcode=bi.tracking
    WHERE pc.phone_number = ? AND pc.record_created_at >= ? AND pc.record_created_at < ?`;
    var data = [dataToCheck.phoneNumber, currentDay, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            dataToCheck.countQl = 0;
            dataToCheck.countQQ = 0;
            resolve(dataToCheck);
          } else {
            results.forEach(e => {
              if(e.source == "QUICKLINK"){
                countQl++;
              }
              if(e.source == "QUICKQUICK"){
                countQQ++;
              }
            });
            dataToCheck.countQl = countQl;
            dataToCheck.countQQ = countQQ;
            resolve(dataToCheck);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  listCaptureByPhone: (db, phoneNumber, dateCheck) => {
    var currentDay = moment(dateCheck + " 00:00:00").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(currentDay).add(1, "day").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT phone_number, barcode, image_url, image_path FROM parcel_capture_data WHERE phone_number = ? AND record_created_at >= ? AND record_created_at < ?`;
    var data = [phoneNumber, currentDay, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, async (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            var output = [];
            for (let e of results) {
              if (e.image_path == "") {
                e.image_url = await removeCharacter(e.image_url);
                output.push(e);
              } else {
                output.push(e);
              }
            }
            resolve(output);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  getBookingLog: (db, tracking) => {
    var sql = `SELECT * FROM booking_tracking_batch WHERE tracking=?`;
    var data = [tracking];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            resolve(results);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  updateStatusManual: (db, tracking) => {
    var sql = `UPDATE billing_receiver_info SET status='booked',booking_status=100 WHERE tracking=?`;
    var data = [tracking];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        resolve(results);
      });
    });
  },
  selectBillData: (db, date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT b.billing_no, bi.tracking, b.billing_date, b.status
              FROM billing b
              INNER JOIN billing_item bi ON b.billing_no = bi.billing_no
              WHERE b.billing_date >= ? AND b.billing_date < ?`;
    var data = [current_date, nextDay];

    return new Promise(function (resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err == null) {
          if (results.length > 0) {
            resolve(results);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  selectDataItem: (db, tracking) => {
    var sqlItem = `SELECT * FROM billing_item WHERE tracking=?`;
    var dataItem = [tracking];

    var sqlItemTemp = `SELECT * FROM billing_item_temp WHERE tracking=?`;
    var dataItemTemp = [tracking];

    return new Promise(function (resolve, reject) {
      db.query(sqlItem, dataItem, (err_item, results_item) => {
        if (err_item == null) {
          db.query(sqlItemTemp, dataItemTemp, (err_item_temp, results_item_temp) => {
            if (err_item_temp == null) {
              var data = {
                billingItemTemp: results_item_temp,
                billingItem: results_item
              };
              resolve(data);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });
    });
  },
  selectDataReceiver: (db, tracking) => {
    var sqlReceiver = `SELECT * FROM billing_receiver_info WHERE tracking=?`;
    var dataReceiver = [tracking];

    var sqlReceiverTemp = `SELECT * FROM billing_receiver_info_temp WHERE tracking=?`;
    var dataReceiverTemp = [tracking];

    return new Promise(function (resolve, reject) {
      db.query(sqlReceiver, dataReceiver, (err_receiver, results_receiver) => {
        if (err_receiver == null) {
          db.query(sqlReceiverTemp, dataReceiverTemp, (err_receiver_temp, results_receiver_temp) => {
            if (err_receiver_temp == null) {
              var data = {
                receiverInfoTemp: results_receiver_temp,
                receiverInfo: results_receiver
              };
              resolve(data);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });
    });
  },
  sendDataToServer: (db, billing_no) => {
    var sqlBilling = `SELECT user_id,mer_authen_level,member_code,carrier_id,billing_no,branch_id,img_url FROM billing WHERE billing_no= ? AND status='complete'`;
    var dataBilling = [billing_no];

    let sqlBillingItem = `SELECT bItem.tracking, bItem.size_id, bItem.size_price, bItem.parcel_type, bItem.cod_value FROM billing_item bItem WHERE bItem.billing_no=?`;
    var dataBillItem = [billing_no];

    return new Promise(function (resolve, reject) {
      db.query(sqlBilling, dataBilling, (error_billing, result_billing, fields) => {
        if (error_billing == null) {
          if (result_billing.length > 0) {
            db.query(sqlBillingItem, dataBillItem, async (error_item, result_items, fields) => {
              if (error_item == null) {
                if (result_items.length > 0) {
                  var orderlist = [];
                  for (let item of result_items) {
                    let sizeItem = await getSizeInfo(db, item);
                    let dataItem = await selectReceiverData(db, item);

                    var dataReceiver = dataItem.dataReceiver;

                    var data_json_item = {
                      productinfo: {
                        globalproductid: sizeItem.product_id,
                        productname: sizeItem.product_name,
                        methodtype: dataItem.parcel_type.toUpperCase(),
                        paymenttype: dataItem.parcel_type.toUpperCase() == "NORMAL" ? "99" : "60",
                        price: dataItem.size_price.toString(),
                        codvalue: dataItem.cod_value.toString()
                      },
                      destinationinfo: {
                        custname: dataReceiver.receiver_name,
                        custphone: dataReceiver.phone,
                        custzipcode: dataReceiver.zipcode,
                        custaddr: dataReceiver.receiver_address,
                        ordershortnote: dataReceiver.remark == null || dataReceiver.remark == "KEYIN" ? "" : dataReceiver.remark,
                        districtcode: dataReceiver.DISTRICT_CODE,
                        amphercode: dataReceiver.AMPHUR_CODE,
                        provincecode: dataReceiver.PROVINCE_CODE,
                        geoid: dataReceiver.GEO_ID,
                        geoname: dataReceiver.GEO_NAME,
                        sendername: dataReceiver.sender_name,
                        senderphone: dataReceiver.sender_phone,
                        senderaddr: dataReceiver.sender_address == null ? "-" : dataReceiver.sender_address
                      },
                      consignmentno: dataItem.tracking,
                      transporter_id: dataReceiver.courirer_id == null ? 7 : parseInt(dataReceiver.courirer_id),
                      user_id: "0",
                      sendbooking: dataReceiver.booking_status == 100 ? 1 : null
                    };
                    if (dataReceiver.booking_date !== null) {
                      data_json_item.sendmaildate = m(dataReceiver.booking_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true);
                    }
                    orderlist.push(data_json_item);
                  }

                  var data = {
                    authen: {
                      merid: result_billing[0].branch_id,
                      userid: result_billing[0].user_id,
                      merauthenlevel: result_billing[0].mer_authen_level
                    },
                    memberparcel: {
                      memberinfo: {
                        memberid: result_billing[0].member_code,
                        courierpid: result_billing[0].carrier_id,
                        courierimage: result_billing[0].img_url
                      },
                      billingno: result_billing[0].billing_no,
                      orderlist: orderlist
                    }
                  };
                  resolve(data);
                } else {
                  resolve(false);
                }
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
    });
  },
  sendRelabelDataToServer: (db, billing_no, tracking) => {
    var sqlBilling = `SELECT user_id, mer_authen_level, member_code, carrier_id, billing_no, branch_id, img_url FROM billing WHERE billing_no= ? AND status='complete'`;
    var dataBilling = [billing_no];

    let sqlBillingItem = `SELECT bItem.tracking, bItem.size_id, bItem.size_price, bItem.parcel_type, bItem.cod_value FROM billing_item bItem WHERE bItem.billing_no=? AND bItem.tracking=?`;
    var dataBillItem = [billing_no, tracking];

    return new Promise(function (resolve, reject) {
      db.query(sqlBillingItem, dataBillItem, (error_item, result_items, fields) => {
        if (error_item == null) {
          if (result_items.length > 0) {
            db.query(sqlBilling, dataBilling, async (error_billing, result_billing, fields) => {
              if (error_billing == null) {
                if (result_billing.length > 0) {
                  var orderlist = [];

                  for (let item of result_items) {
                    let sizeItem = await getSizeInfo(db, item);

                    var data_item = {
                      productinfo: {
                        globalproductid: sizeItem.product_id,
                        productname: sizeItem.product_name,
                        methodtype: item.parcel_type.toUpperCase(),
                        paymenttype: item.parcel_type.toUpperCase() == "NORMAL" ? "99" : "60",
                        price: item.size_price.toString(),
                        codvalue: item.cod_value.toString()
                      },
                      consignmentno: item.tracking
                    };
                    orderlist.push(data_item);
                  }

                  var data = {
                    authen: {
                      merid: result_billing[0].branch_id,
                      userid: result_billing[0].user_id,
                      merauthenlevel: result_billing[0].mer_authen_level
                    },
                    memberparcel: {
                      memberinfo: {
                        memberid: result_billing[0].member_code,
                        courierpid: result_billing[0].carrier_id,
                        courierimage: result_billing[0].img_url
                      },
                      billingno: result_billing[0].billing_no,
                      orderlist: orderlist
                    }
                  };
                  resolve(data);
                } else {
                  resolve(false);
                }
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
    });
  },
  saveDataBilling: (db, billing, currentMember, total, newBillingNo) => {
    var dateTimestamp = new Date();
    var dateTimestamp2 = +dateTimestamp;
    var status = "drafting";

    var sqlUpdateBilling = `UPDATE billing SET status='cancel' WHERE billing_no=?`;
    var dataUpdateBilling = [billing.billing_no];

    var sqlSaveBilling = `INSERT INTO billing(user_id, mer_authen_level, member_code, carrier_id, billing_date, billing_no, branch_id, total, timestamp, img_url, status, ref_billing_no) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    var dataSaveBilling = [billing.user_id, billing.mer_authen_level, currentMember.memberCode, billing.carrier_id, new Date(), newBillingNo, billing.branch_id, total, dateTimestamp2, billing.img_url, status, billing.billing_no];

    return new Promise(function (resolve, reject) {
      db.query(sqlUpdateBilling, dataUpdateBilling, (errorUpdateBilling, resultUpdateBilling, fields) => {
        if (errorUpdateBilling == null) {
          if (resultUpdateBilling.affectedRows > 0) {
            db.query(sqlSaveBilling, dataSaveBilling, (errorSaveBilling, resultSaveBilling, fields) => {
              if (errorSaveBilling == null) {
                if (resultSaveBilling.affectedRows > 0) {
                  resolve(true);
                } else {
                  resolve(false);
                }
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
    });
  },
  saveDataBillingRelabel: (db, billing, total, newBillingNo) => {
    var dateTimestamp = new Date();
    var dateTimestamp2 = +dateTimestamp;
    var status = "drafting";

    var sqlSaveBilling = `INSERT INTO billing(user_id, mer_authen_level, member_code, carrier_id, billing_date, billing_no, branch_id, total, timestamp, img_url, status, ref_billing_no) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    var dataSaveBilling = [billing.user_id, billing.mer_authen_level, billing.member_code, billing.carrier_id, new Date(), newBillingNo, billing.branch_id, total, dateTimestamp2, billing.img_url, status, billing.billing_no];

    return new Promise(function (resolve, reject) {
      db.query(sqlSaveBilling, dataSaveBilling, (errorSaveBilling, resultSaveBilling, fields) => {
        if (errorSaveBilling == null) {
          if (resultSaveBilling.affectedRows > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  saveDataBillingItemRelabel: (db, billing_no, billingItemInfo, currentValue) => {
    let source = "RELABEL";
    var data = currentValue.billingItem;
    var address = currentValue.receiverInfo;
    var keyAddress = address.keyAddress;

    var sqlSaveBillingItem = `INSERT INTO billing_item(billing_no, tracking, zipcode, size_id, size_price, parcel_type, cod_value, source,created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`;
    var dataBillingItem = [billing_no, data.tracking, keyAddress.zipcode, data.sizeId, data.sizePrice, data.parcelType, data.codValue, source, new Date()];

    var sqlReceiver = `INSERT INTO billing_receiver_info(tracking, parcel_type, sender_name, sender_phone, sender_address, receiver_name, phone, receiver_address, district_id, district_name, amphur_id, amphur_name, province_id, province_name, zipcode, remark, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    var dataReceiver = [data.tracking, data.parcelType, billingItemInfo.sender_name, billingItemInfo.sender_phone, billingItemInfo.sender_address, address.receiverName, address.phone, address.receiverAddress, keyAddress.DISTRICT_ID, keyAddress.DISTRICT_NAME, keyAddress.AMPHUR_ID, keyAddress.AMPHUR_NAME, keyAddress.PROVINCE_ID, keyAddress.PROVINCE_NAME, keyAddress.zipcode, source, new Date()];

    return new Promise(function (resolve, reject) {
      db.query(sqlSaveBillingItem, dataBillingItem, (error_item, results_item, fields) => {
        if (error_item == null) {
          if (results_item.affectedRows > 0) {
            db.query(sqlReceiver, dataReceiver, (error_receiver, results_receiver, fields) => {
              if (error_receiver == null) {
                if (results_receiver.affectedRows > 0) {
                  resolve(true);
                } else {
                  resolve(false);
                }
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
    });
  },
  updateBillingNoItem: (db, newBillingNo, item, currentMember) => {
    var sqlSaveItem = `INSERT INTO billing_item(billing_no, tracking, zipcode, size_id, size_price, parcel_type, cod_value, source,created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`;
    var data = [newBillingNo, item.tracking, item.zipcode, item.size_id, item.size_price, item.parcel_type.toUpperCase(), item.cod_value, item.source, new Date()];

    var sqlUpdateReceiver = `UPDATE billing_receiver_info SET sender_name=?, sender_phone=?,sender_address=? WHERE tracking=?`;
    var dataReceiver = [currentMember.senderName, currentMember.senderPhone, currentMember.senderAddress, item.tracking];

    return new Promise(function (resolve, reject) {
      db.query(sqlSaveItem, data, (errorItem, resultItem, fields) => {
        if (errorItem == null) {
          if (resultItem.affectedRows > 0) {
            db.query(sqlUpdateReceiver, dataReceiver, (errorReceiver, resultReceiver, fields) => {
              if (errorReceiver == null) {
                if (resultReceiver.affectedRows > 0) {
                  resolve(true);
                } else {
                  resolve(false);
                }
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
    });
  },
  updateStatusBilling: (db, billingNo) => {
    var updateStatusBilling = `UPDATE billing SET status=? WHERE billing_no=? AND status=?`;
    var dataStatusBilling = ["complete", billingNo, "drafting"];

    return new Promise(function (resolve, reject) {
      db.query(updateStatusBilling, dataStatusBilling, (error, results, fields) => {
        if (error == null) {
          if (results.affectedRows > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  updateCancelBilling: (db, billingNo) => {
    var updateStatusBilling = `UPDATE billing SET status=? WHERE billing_no=? AND status=?`;
    var dataStatusBilling = ["cancel", billingNo, "complete"];

    return new Promise(function (resolve, reject) {
      db.query(updateStatusBilling, dataStatusBilling, (error, results, fields) => {
        if (error == null) {
          if (results.affectedRows > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  selectDataToExchangeUpdateBooking: (db, tracking) => {
    let sqlReceiver = `SELECT br.tracking,br.sender_name,br.sender_phone,br.sender_address,br.receiver_name,br.phone,br.receiver_address,d.DISTRICT_CODE,
    a.AMPHUR_CODE,p.PROVINCE_CODE,br.zipcode,br.remark,br.courirer_id,br.booking_date,g.GEO_ID,g.GEO_NAME
    FROM billing_receiver_info br 
    JOIN postinfo_district d ON br.district_id=d.DISTRICT_ID AND br.amphur_id=d.AMPHUR_ID AND br.province_id=d.PROVINCE_ID
    JOIN postinfo_amphur a ON br.amphur_id=a.AMPHUR_ID 
    JOIN postinfo_province p ON br.province_id=p.PROVINCE_ID 
    JOIN postinfo_geography g ON d.GEO_ID=g.GEO_ID 
    WHERE br.tracking=?`;
    let dataReceiver = [tracking];

    var sqlBillingItem = `SELECT b.billing_date, bItem.billing_no, bItem.tracking, bItem.size_price, bItem.parcel_type as bi_parcel_type,bItem.cod_value,s.alias_size,gSize.product_id,gSize.product_name
    FROM billing_item bItem 
    JOIN billing b ON bItem.billing_no=b.billing_no
    JOIN size_info s ON bItem.size_id=s.size_id 
    JOIN global_parcel_size gSize ON s.location_zone = gSize.area AND s.alias_size =gSize.alias_name AND bItem.parcel_type= gSize.type
    WHERE bItem.tracking=?`;
    var dataItem = [tracking];

    return new Promise(function (resolve, reject) {
      db.query(sqlReceiver, dataReceiver, (err_receiver, result_receiver) => {
        if (err_receiver == null) {
          if (result_receiver.length > 0) {
            db.query(sqlBillingItem, dataItem, (error_item, results_item, fields) => {
              if (error_item == null) {
                if (results_item.length > 0) {
                  var data = result_receiver[0];

                  var result = {
                    status: 200,
                    tracking: tracking,
                    result: {
                      manifestResponse: {
                        hdr: {
                          messageType: "SHIPMENT",
                          messageDateTime: m(data.booking_date).tz("Asia/Bangkok"),
                          messageVersion: "1.0",
                          messageLanguage: "en"
                        },
                        bd: {
                          shipmentItems: [
                            {
                              shipmentID: data.tracking,
                              deliveryConfirmationNo: "5320076806463210",
                              responseStatus: {
                                code: "200",
                                message: "SUCCESS",
                                messageDetails: [
                                  {
                                    messageDetail:
                                      "Shipment processed Successfully; Handover Method has been updated to Drop-Off; Return Shipping Service has been updated to PDO."
                                  }
                                ]
                              }
                            }
                          ],
                          responseStatus: {
                            code: "200",
                            message: "SUCCESS",
                            messageDetails: [
                              {
                                messageDetail: "All shipments processed successfully"
                              }
                            ]
                          }
                        }
                      }
                    },
                    productinfo: {
                      globalproductid: results_item[0].product_id,
                      productname: results_item[0].product_name,
                      methodtype: results_item[0].bi_parcel_type.toUpperCase(),
                      paymenttype: results_item[0].bi_parcel_type.toUpperCase() == "NORMAL" ? "99" : "60",
                      price: results_item[0].size_price.toString(),
                      codvalue: results_item[0].cod_value.toString()
                    },
                    destinationinfo: {
                      custname: data.receiver_name,
                      custphone: data.phone,
                      custzipcode: data.zipcode,
                      custaddr: data.receiver_address,
                      ordershortnote: data.remark == null || data.remark == "KEYIN" ? "" : data.remark,
                      districtcode: data.DISTRICT_CODE,
                      amphercode: data.AMPHUR_CODE,
                      provincecode: data.PROVINCE_CODE,
                      geoid: data.GEO_ID,
                      geoname: data.GEO_NAME,
                      sendername: data.sender_name,
                      senderphone: data.sender_phone,
                      senderaddr: data.sender_address == null ? "-" : data.sender_address
                    },
                    consignmentno: data.tracking,
                    transporter_id: data.courirer_id == null ? 7 : parseInt(data.courirer_id),
                    user_id: "0",
                    billing_no: results_item[0].billing_no,
                    billing_date: m(results_item[0].billing_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true)
                    // sendmaildate: momentTimezone(data.booking_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true)
                  };

                  if (data.booking_date !== null) {
                    result.sendmaildate = m(data.booking_date).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss", true);
                  }
                  resolve(result);
                } else {
                  resolve(false);
                }
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
    });
  }
};

/*******************************************************************************************************************************/
function removeCharacter(text) {
  var newText = "";
  for (i = 0; i < text.length; i++) {
    if (text[i] == "#") {
      newCha = text[i].replace('#', '');
      newText += newCha;
    } else if(text[i] == "<"){
      newCha = text[i].replace('<', ' ');
      newText += newCha;
    } else if(text[i] == "b"){
      newCha = text[i].replace('b', ' ');
      newText += newCha;
    } else if(text[i] == "r"){
      newCha = text[i].replace('r', ' ');
      newText += newCha;
    } else if(text[i] == ">"){
      newCha = text[i].replace('>', ' ');
      newText += newCha;
    } else {
      newText += text[i];
    }
  }
  return newText;
}

function getBillingItemInfo(db, data) {
  let sql = `SELECT tracking, source FROM billing_item WHERE tracking in (?)`;
  let dataToDb = [data];

  return new Promise(function (resolve, reject) {
    db.query(sql, dataToDb, (error, results, fields) => {
      if (error == null) {
        if (results.length > 0) {
          resolve(results);
        } else {
          resolve(null);
        }
      } else {
        resolve(false);
      }
    });
  });
}

function selectReceiverData(db, dataItem) {
  let sqlReceiver = `SELECT br.tracking,br.sender_name,br.sender_phone,br.sender_address,br.receiver_name,br.phone,br.receiver_address,d.DISTRICT_CODE,
                    a.AMPHUR_CODE,p.PROVINCE_CODE,br.zipcode,br.remark,br.courirer_id,br.booking_date,g.GEO_ID,g.GEO_NAME, br.booking_status
                    FROM billing_receiver_info br 
                    JOIN postinfo_district d ON br.district_id=d.DISTRICT_ID AND br.amphur_id=d.AMPHUR_ID AND br.province_id=d.PROVINCE_ID
                    JOIN postinfo_amphur a ON br.amphur_id=a.AMPHUR_ID 
                    JOIN postinfo_province p ON br.province_id=p.PROVINCE_ID 
                    JOIN postinfo_geography g ON d.GEO_ID=g.GEO_ID 
                    WHERE br.tracking=?`;
  let dataReceiver = [dataItem.tracking];
  return new Promise(function (resolve, reject) {
    db.query(sqlReceiver, dataReceiver, (error_receiver, results_receiver, fields) => {
      if (error_receiver == null) {
        if (results_receiver.length > 0) {
          dataItem.dataReceiver = results_receiver[0];
          resolve(dataItem);
        } else {
          resolve(dataItem);
        }
      } else {
        resolve(dataItem);
      }
    });
  });
}

function getSizeInfo(db, data) {
  var sqlSizeInfo = `SELECT * FROM size_info WHERE size_id=?`;
  var sqlGlobalSize = `SELECT * FROM global_parcel_size WHERE alias_name=? AND area=? AND type=?`;

  return new Promise(function (resolve, reject) {
    db.query(sqlSizeInfo, [data.size_id], (errSizeInfo, resultSizeInfo) => {
      if (errSizeInfo == null) {
        if (resultSizeInfo.length > 0) {
          let sizeInfo = resultSizeInfo[0];
          let zone = sizeInfo.zone;
          let dataGlobalSize = [sizeInfo.alias_size.toUpperCase(), sizeInfo.location_zone.toUpperCase(), data.parcel_type];
          db.query(sqlGlobalSize, dataGlobalSize, (errGlobalSize, resultGlobalSize) => {
            if (errGlobalSize == null) {
              if (resultGlobalSize.length > 0) {
                resultGlobalSize.forEach(e => {
                  if (zone == e.zone) {
                    item = e;
                  } else {
                    item = resultGlobalSize[0];
                  }
                });
                data.alias_size = sizeInfo.alias_size.toUpperCase();
                data.product_id = item.product_id;
                data.product_name = item.product_name;

                resolve(data);
              } else {
                resolve(false);
              }
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
  });
}

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
