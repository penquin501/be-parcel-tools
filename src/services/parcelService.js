// const parcel_connection = require("../env/parceldb.js");
const bodyParser = require("body-parser");
const request = require("request");
const moment = require("moment");
const m = require("moment-timezone");
moment.locale("th");

module.exports = {
  getBillingItemTracking: (db,tracking) => {
    let sql =
      "SELECT bi.billing_no,bi.tracking,bi.size_id,s.alias_size,bi.size_price,bi.parcel_type as bi_parcel_type, bi.cod_value,bi.zipcode as bi_zipcode," +
      "br.parcel_type as br_parcel_type,br.sender_name,br.sender_phone,br.sender_address,br.receiver_name,br.phone,br.receiver_address," +
      "d.DISTRICT_CODE,br.district_id,br.district_name,br.amphur_id,br.amphur_name,br.province_id,br.province_name,br.zipcode as br_zipcode," +
      "br.booking_status, br.status " +
      "FROM billing_item bi " +
      "LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking " +
      "LEFT JOIN postinfo_district d ON br.district_id=d.DISTRICT_ID AND br.amphur_id=d.AMPHUR_ID AND br.province_id=d.PROVINCE_ID " +
      "LEFT JOIN size_info s ON bi.size_id= s.size_id " +
      "WHERE bi.tracking=?";
    let data = [tracking];
    return new Promise(function(resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error == null) {
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
  getTrackingImgUrl: (db,tracking) => {
    let sql = "SELECT image_url FROM parcel_capture_data WHERE barcode=?";
    let data = [tracking];

    return new Promise(function(resolve, reject) {
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
  getBillingInfo: (db,billing) => {
    let sql = `SELECT b.member_code,b.billing_date,b.billing_no,b.branch_id,bInfo.branch_name,b.status 
    FROM billing b
    LEFT JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id
    WHERE billing_no=?`;
    let data = [billing];

    let sqlItem = `SELECT bi.tracking,s.alias_size,bi.size_price,bi.parcel_type,bi.cod_value,br.sender_name,br.sender_phone,br.sender_address,
    br.receiver_name,br.phone,br.receiver_address,br.district_name,br.amphur_name,br.province_name,br.zipcode,br.status 
    FROM billing_item bi
    LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
    LEFT JOIN size_info s ON bi.size_id=s.size_id
    WHERE bi.billing_no=?`;
    let dataItem = [billing];

    return new Promise(function(resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            db.query(sqlItem, dataItem, (err, resultsItem) => {
              if (resultsItem.length <= 0) {
                resolve(false);
              } else {
                var sTracking = 0;
                resultsItem.forEach(item => {
                  sTracking += item.size_price;
                });
                var dataResult = {
                  billingNo: results[0],
                  billingItem: resultsItem,
                  countTracking: resultsItem.length,
                  sTracking: sTracking
                };
                resolve(dataResult);
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
  getListTrackingNotMatch: (db) => {
    var current_date = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var weekAgo = moment(current_date).add(-2, "week").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    let sql = `SELECT bInfo.branch_name,b.branch_id,bi.tracking 
    FROM billing b 
    JOIN billing_item bi ON b.billing_no=bi.billing_no 
    JOIN billing_receiver_info br ON bi.tracking=br.tracking 
    JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id
    WHERE (b.billing_date >= ? AND b.billing_date < ?) AND (br.status != 'cancel' OR br.status is null) 
    and (bi.zipcode<>br.zipcode OR bi.parcel_type<>br.parcel_type OR (bi.parcel_type='COD' AND bi.cod_value=0) OR (bi.parcel_type='NORMAL' AND bi.cod_value > 0))`;
    let data=[weekAgo, current_date];

    return new Promise(function(resolve, reject) {
      db.query(sql,data, (error, results, fields) => {
        if (error === null) {
          if (results.length <= 0) {
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
  selectTrackingToCheck: (db,branch_id) => {
    let sql = `SELECT bi.tracking FROM billing b 
      Left JOIN billing_item bi ON b.billing_no=bi.billing_no 
      LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking 
      WHERE (bi.zipcode<>br.zipcode OR bi.parcel_type<>br.parcel_type OR 
        (bi.parcel_type='COD' AND bi.cod_value=0) OR (bi.parcel_type='NORMAL' AND bi.cod_value > 0)) AND 
        (br.status not in ('cancel','SUCCESS','success') OR br.status is null) AND b.branch_id=? LIMIT 1`;
    let data = [branch_id];

    return new Promise(function(resolve, reject) {
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
  selectBillingInfo: (db,billing_no) => {
    let sql = "SELECT billing_date,total FROM billing WHERE billing_no=?";
    let data = [billing_no];

    return new Promise(function(resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error === null) {
          resolve(results);
        }
      });
    });
  },

  parcelSizeList: (db,zone) => {
    let sql = "SELECT alias_size FROM size_info GROUP BY alias_size ORDER BY min(parcel_price) ASC";
    return new Promise(function(resolve, reject) {
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
  updateStatusBilling: (db,billing_no) => {
    let updateBilling = "UPDATE billing SET status='cancel' WHERE billing_no=?";

    let selectBillingItem = "SELECT tracking FROM billing_item WHERE billing_no=?";

    let updateStatusReceiver = "UPDATE billing_receiver_info SET status='cancel' WHERE tracking=?";

    let dataBilling = [billing_no];

    return new Promise(function(resolve, reject) {
      db.query(updateBilling,dataBilling,(error, results, fields) => {});
      db.query(selectBillingItem,dataBilling,(error, resListTracking, fields) => {
          for (i = 0; i < resListTracking.length; i++) {
            let dataTracking = [resListTracking[i].tracking];
            db.query(updateStatusReceiver,dataTracking,(error, results2, fields) => {});
          }
        }
      );
    });
  },
  updateStatusReceiver: (db,tracking) => {
    return new Promise(function(resolve, reject) {
      let sql = "UPDATE billing_receiver_info SET status='cancel' WHERE tracking=?";
      let data = [tracking];
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
  selectParcelSize: (db,billingNo) => {
    return new Promise(function(resolve, reject) {
      let sql = `SELECT b.size_price FROM billing_item b 
        JOIN billing_receiver_info br ON b.tracking=br.tracking
        WHERE b.billing_no=? AND (br.status!='cancel' OR br.status is null)`;
      let data = [billingNo];
      db.query(sql, data, (error, results, fields) => {
        if (results.length <= 0) {
          resolve(0);
        } else {
          resolve(results);
        }
      });
    });
  },
  updateBillingInfo: (db,current_total, billing_no) => {
    let sqlTotal = "UPDATE billing SET total=? WHERE billing_no=?";
    let dataTotal = [current_total, billing_no];

    let sqlStatus = "UPDATE billing SET status=? WHERE billing_no=?";
    let dataStatus = ["cancel", billing_no];
    return new Promise(function(resolve, reject) {
      if (current_total == 0) {
        db.query(sqlStatus,dataStatus,(error, results, fields) => {
            resolve(results);
          });
      } else {
        db.query(sqlTotal,dataTotal,(error, results, fields) => {
            resolve(results);
          });
      }
    });
  },
  updateReceiverInfo: (db,tracking, receiver_name, phone, address) => {
    let sql =
      "UPDATE billing_receiver_info SET receiver_name=?,phone=?,receiver_address=? WHERE tracking=?";
    let data = [receiver_name, phone, address, tracking];
    return new Promise(function(resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  addressInfo: (db,district_code) => {
    let sql = `SELECT d.DISTRICT_ID,d.DISTRICT_NAME,a.AMPHUR_ID,a.AMPHUR_NAME,p.PROVINCE_ID,p.PROVINCE_NAME,z.zipcode 
      FROM postinfo_district d 
      JOIN postinfo_zipcodes z ON d.DISTRICT_CODE=z.district_code 
      JOIN postinfo_amphur a ON d.AMPHUR_ID=a.AMPHUR_ID 
      JOIN postinfo_province p ON d.PROVINCE_ID=p.PROVINCE_ID 
      WHERE d.DISTRICT_CODE=?`;
    let data = [district_code];
    return new Promise(function(resolve, reject) {
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
  updateCheckerInfo: (db,billing_no,tracking,size_id,size_price,cod_value,receiver_name,phone,address,parcel_type,district_id,district_name,amphur_id,amphur_name,province_id,province_name,zipcode) => {
    let sqlBillingItem = "UPDATE billing_item SET zipcode=?,size_id=?,size_price=?,parcel_type=?,cod_value=? WHERE tracking=?";
    let dataBillingItem = [zipcode,size_id,size_price,parcel_type,cod_value,tracking];

    let sqlReceiver = "UPDATE billing_receiver_info SET parcel_type=?,receiver_name=?,phone=?,receiver_address=?,district_id=?,district_name=?,amphur_id=?,amphur_name=?,province_id=?,province_name=?,zipcode=? WHERE tracking=?";
    let dataReceiver = [parcel_type,receiver_name,phone,address,district_id,district_name,amphur_id,amphur_name,province_id,province_name,zipcode,tracking];

    let sqlSizeItem = "SELECT size_price FROM billing_item WHERE billing_no=?";
    let dataSizeItem = [billing_no];

    let total = 0;
    return new Promise(function(resolve, reject) {
      db.query(sqlBillingItem,dataBillingItem,(error1, resultsItem, fields) => {
          if (error1 === null) {
            if (resultsItem.affectedRows > 0) {
              db.query(sqlReceiver,dataReceiver,(error2, resultsReceiver, fields) => {
                  if (error2 === null) {
                    if (resultsReceiver.affectedRows > 0) {
                      db.query(sqlSizeItem,dataSizeItem,(error, resultsSizeItem, fields) => {
                          for (i = 0; i < resultsSizeItem.length; i++) {
                            total += resultsSizeItem[i].size_price;
                          }
                          resolve(total);
                        }
                      );
                    } else {
                      console.log("resultsReceiver", resultsReceiver);
                      resolve(false);
                    }
                  } else {
                    console.log("error2", error2);
                    resolve(false);
                  }
                }
              );
            } else {
              console.log("resultsItem", resultsItem);
              resolve(false);
            }
          } else {
            console.log("error1", error1);
            resolve(false);
          }
        }
      );
    });
  },
  updateBilling: (db,billing_no, current_total) => {
    let sql = "UPDATE billing SET total=? WHERE billing_no=?";
    let data = [current_total, billing_no];
    return new Promise(function(resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  updateResendBilling: (db,billing_no, status) => {
    let sql = "UPDATE billing SET status='booked',prepare_raw_data=null WHERE billing_no=? AND status=?;";
    let data = [billing_no, status];
    return new Promise(function(resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if(error==null){
          resolve(results);
        } else {
          resolve(false);
        }
        
      });
    });
  },
  updateMemberBilling: (db,billing_no, member_code) => {
    let sql = "UPDATE billing SET member_code=? WHERE billing_no=?";
    let data = [member_code, billing_no];
    return new Promise(function(resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if(error==null){
          if(results.affectedRows>0){
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
  updateSenderInfo: (db, sender_name,sender_phone,sender_address,tracking) => {
    let sql = "UPDATE billing_receiver_info SET sender_name=?,sender_phone=?,sender_address=? WHERE tracking=?";
    let data = [sender_name,sender_phone,sender_address,tracking];
    return new Promise(function(resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if(error==null){
          if(results.affectedRows>0){
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
  saveLogQlChecker: (db,branch_id,user_id,billing_no,error_code,error_maker,cs_name,tracking,operation_key) => {
    let sql = `INSERT INTO log_ql_checker(branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key, record_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let data = [branch_id,user_id,billing_no,error_code,error_maker,cs_name,tracking,operation_key,new Date()];
    return new Promise(function(resolve, reject) {
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
  findOperator: (db,tracking) => {
    let sql = "SELECT operator_id FROM parcel_keyin_data_temp WHERE barcode=?";
    let data = [tracking];
    return new Promise(function(resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        if (error === null) {
          resolve(results);
        }
      });
    });
  },
  insertLog: (db,billing_no,previous_value,current_value,reason,module_name,user,ref,remark) => {
    let sql =
      "INSERT INTO log_parcel_tool(billing_no, time_to_system, previous_value, current_value,reason, module_name, user, ref,remark) VALUES (?,?,?,?,?,?,?,?,?)";
    let data = [billing_no,new Date(),previous_value,current_value,reason,module_name,user,ref,remark];
    return new Promise(function(resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  saveTracking: (db,tracking) => {
    let sqlCheck = "SELECT tracking FROM test_dhl_response WHERE tracking=?";
    let dataCheck = [tracking];

    let sql = "INSERT INTO test_dhl_response(tracking) VALUES (?)";
    let data = [tracking];
    return new Promise(function(resolve, reject) {
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
  getDailyData: (db,date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    console.log("getDailyData", current_date, nextDay);
    var sqlBilling = `SELECT bi.tracking,bi.billing_no,bi.cod_value,br.receiver_name,br.phone,br.receiver_address,br.district_name,br.amphur_name,br.province_name,br.zipcode
    FROM billing b
    JOIN billing_item bi ON b.billing_no=bi.billing_no
    JOIN billing_receiver_info br ON bi.tracking=br.tracking
    WHERE (b.billing_date>=? AND b.billing_date<?)`;
    var data = [current_date, nextDay];
    return new Promise(function(resolve, reject) {
      db.query(sqlBilling, data, (error, results, fields) => {
        console.log(error);
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
  getDailyDataUnbook: (db,date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sqlBilling = `SELECT bi.tracking,bi.billing_no,bi.cod_value,br.receiver_name,br.phone,br.receiver_address,br.district_name,br.amphur_name,br.province_name,br.zipcode
    FROM billing b
    JOIN billing_item bi ON b.billing_no=bi.billing_no
    JOIN billing_receiver_info br ON bi.tracking=br.tracking
    WHERE (b.billing_date>=? AND b.billing_date<?) AND (br.booking_status != 100 OR br.booking_status is null)`;
    var data = [current_date, nextDay];
    return new Promise(function(resolve, reject) {
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
  reportBranch: (db,date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT b.branch_id,bInfo.branch_name,b.billing_no,br.sender_name,b.status,b.billing_date,br.booking_status
    FROM billing b 
    JOIN billing_item bi ON b.billing_no=bi.billing_no 
    JOIN billing_receiver_info br ON bi.tracking=br.tracking 
    JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id 
    WHERE (b.billing_date>=? AND b.billing_date<?) AND (br.status != 'cancel' OR br.status is null) AND (b.status!='cancel' OR b.status is null)`;
    var data = [current_date, nextDay];

    return new Promise(function(resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          resolve(results);
        } else {
          resolve(false);
        }
      });
    });
  },
  dailyReport: (db,date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT b.branch_id,bInfo.branch_name,b.billing_no,br.sender_name,b.status,b.billing_date,br.booking_status
    FROM billing b 
    JOIN billing_item bi ON b.billing_no=bi.billing_no 
    JOIN billing_receiver_info br ON bi.tracking=br.tracking 
    JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id 
    WHERE (b.billing_date>=? AND b.billing_date<?) AND (br.status != 'cancel' OR br.status is null) AND b.status NOT IN ('cancel','SUCCESS')`;
    var data = [current_date, nextDay];

    return new Promise(function(resolve, reject) {
      db.query(sql, data, (err, results) => {
        if (err === null) {
          resolve(results);
        } else {
          resolve(false);
        }
      });
    });
  },
  dailyListTracking: (db,billing_no) => {
    var sql = `SELECT bi.tracking,s.alias_size,bi.size_price,bi.parcel_type as bi_parcel_type,bi.zipcode as bi_zipcode,bi.cod_value,
    br.parcel_type as br_parcel_type,br.sender_name,br.sender_phone,br.sender_address,br.receiver_name,br.phone,br.receiver_address,
    br.district_name,br.amphur_name,br.province_name,br.zipcode as br_zipcode,br.status,br.sending_date,br.booking_status,br.booking_date,bi.source 
    FROM billing_item bi 
    JOIN billing_receiver_info br ON bi.tracking = br.tracking 
    JOIN size_info s ON bi.size_id = s.size_id
    WHERE bi.billing_no=?`;
    var data = [billing_no];
    return new Promise(function(resolve, reject) {
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
  summaryBooking: (db,date_check) => {
    var current_date = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sqlListTracking = `SELECT bi.tracking,br.booking_status FROM billing b
    LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no
    LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
    WHERE (b.billing_date>=? AND b.billing_date<?) AND (br.status != 'cancel' OR br.status is null)`;
    var dataListTracking = [current_date, nextDay];

    return new Promise(function(resolve, reject) {
      db.query(sqlListTracking,dataListTracking,(err, results) => {
          if (err == null) {
            resolve(results);
          } else {
            resolve(false);
          }
        });
    });
  },
  listErrorMaker: (db) => {
    var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql ="SELECT branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key, record_date FROM log_ql_checker WHERE (record_date >= ? AND record_date < ?)";
    var data = [today, nextDay];

    return new Promise(function(resolve, reject) {
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
  bookingReport: (db,tracking) => {
    var sql = `SELECT tracking, status, send_record_at, prepare_json, response_record_at, res_json FROM booking_tracking_batch WHERE tracking=? ORDER BY id DESC LIMIT 10`;
    var data = [tracking];
    return new Promise(function(resolve, reject) {
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
  log_parcel_tool: (db,ref) => {
    var sql = "SELECT billing_no, time_to_system, previous_value, current_value,reason, module_name, user, ref,remark FROM log_parcel_tool WHERE ref=?";
    var data = [ref];
    return new Promise(function(resolve, reject) {
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
  log_daily_tool: (db,date_check) => {
    var date_check = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD");
    var nextDay = moment(current_date).add(1, "day").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = "SELECT billing_no, time_to_system, previous_value, current_value,reason, module_name, user, ref,remark FROM log_parcel_tool WHERE (time_to_system>=? AND time_to_system<?)";
    var data = [date_check, nextDay];

    return new Promise(function(resolve, reject) {
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
  updateStatusManual: (db,tracking) => {
    var sql = `UPDATE billing_receiver_info SET status='booked',booking_status=100 WHERE tracking=?`;
    var data = [tracking];

    return new Promise(function(resolve, reject) {
      db.query(sql, data, (err, results) => {
        resolve(results);
      });
    });
  },
  selectDataItem: (db,tracking) => {
    var sqlItem = `SELECT * FROM billing_item WHERE tracking=?`;
    var dataItem = [tracking];

    return new Promise(function(resolve, reject) {
      db.query(sqlItem, dataItem, (err_item, results_item) => {
        if (err_item == null) {
          resolve(results_item);
        } else {
          resolve(false);
        }
      });
    });
  },
  selectDataReceiver: (db,tracking) => {
    var sqlReceiver = `SELECT * FROM billing_receiver_info WHERE tracking=?`;
    var dataReceiver = [tracking];

    return new Promise(function(resolve, reject) {
      db.query(sqlReceiver,dataReceiver,(err_receiver, results_receiver) => {
          if (err_receiver == null) {
            resolve(results_receiver);
          } else {
            resolve(false);
          }
        }
      );
    });
  },
  
};
