const parcel_connection = require("../env/parceldb.js");
const bodyParser = require("body-parser");
const request = require("request");
const moment = require("moment");
const m = require("moment-timezone");
moment.locale("th");

module.exports = {
  getBillingItemTracking: tracking => {
    let sql =
      "SELECT bi.billing_no,bi.tracking,bi.size_id,s.alias_size,bi.size_price,bi.parcel_type as bi_parcel_type, bi.cod_value,bi.zipcode as bi_zipcode," +
      "br.parcel_type as br_parcel_type,br.sender_name,br.sender_phone,br.sender_address,br.receiver_name,br.phone,br.receiver_address," +
      "d.DISTRICT_CODE,br.district_id,br.district_name,br.amphur_id,br.amphur_name,br.province_id,br.province_name,br.zipcode as br_zipcode," +
      "br.booking_status, br.status "+
      "FROM billing_item bi " +
      "LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking " +
      "LEFT JOIN postinfo_district d ON br.district_id=d.DISTRICT_ID AND br.amphur_id=d.AMPHUR_ID AND br.province_id=d.PROVINCE_ID " +
      "LEFT JOIN size_info s ON bi.size_id= s.size_id " +
      "WHERE bi.tracking=?";
    let data = [tracking];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
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
  getTrackingImgUrl: tracking => {
    let sql = "SELECT image_url FROM parcel_capture_data WHERE barcode=?";
    let data = [tracking];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
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
  getBillingInfo: billing => {
    let sql = `SELECT b.member_code,b.billing_date,b.billing_no,b.branch_id,bInfo.branch_name,b.status 
    FROM billing b
    LEFT JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id
    WHERE billing_no=?`;
    let data = [billing];

    let sqlCountItem = `SELECT count(tracking) as cTracking, sum(size_price) as sTracking FROM billing_item WHERE billing_no=?`;
    let dataCountItem = [billing];

    let sqlItem = `SELECT bi.tracking,s.alias_size,bi.size_price,bi.parcel_type,bi.cod_value,br.sender_name,br.sender_phone,br.sender_address,
    br.receiver_name,br.phone,br.receiver_address,br.district_name,br.amphur_name,br.province_name,br.zipcode,br.status 
    FROM billing_item bi
    LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
    LEFT JOIN size_info s ON bi.size_id=s.size_id
    WHERE bi.billing_no=?`;
    let dataItem = [billing];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length <= 0) {
            resolve(false);
          } else {
            parcel_connection.query(sqlItem, dataItem, (err, resultsItem) => {

              if(resultsItem.length<=0){
                resolve(false);
              } else {
                parcel_connection.query(sqlCountItem, dataCountItem, (err, resultsCountItem) => {
                  var dataResult = {
                    billingNo: results[0],
                    billingItem: resultsItem,
                    countTracking: resultsCountItem[0]
                  };
                  resolve(dataResult);
                })
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
  getListTrackingNotMatch: () => {
    let sql =
      "SELECT bInfo.branch_name,b.branch_id,count(bi.tracking) as cTracking FROM billing b " +
      "JOIN billing_item bi ON b.billing_no=bi.billing_no " +
      "LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking " +
      "LEFT JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id " +
      "WHERE (bi.zipcode<>br.zipcode OR bi.parcel_type<>br.parcel_type OR (bi.parcel_type='COD' AND bi.cod_value=0) OR (bi.parcel_type='NORMAL' AND bi.cod_value > 0)) AND (br.status not in ('cancel','SUCCESS','success') OR br.status is null)" +
      "GROUP by b.branch_id,bInfo.branch_name";

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, (error, results, fields) => {
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
  selectTrackingToCheck: branch_id => {
    let sql =
      "SELECT bi.tracking FROM billing b " +
      "Left JOIN billing_item bi ON b.billing_no=bi.billing_no " +
      "LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking " +
      "WHERE (bi.zipcode<>br.zipcode OR bi.parcel_type<>br.parcel_type OR (bi.parcel_type='COD' AND bi.cod_value=0) OR (bi.parcel_type='NORMAL' AND bi.cod_value > 0)) AND (br.status not in ('cancel','SUCCESS','success') OR br.status is null) AND b.branch_id=? LIMIT 1";
    let data = [branch_id];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
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
  selectBillingInfo: billing_no => {
    let sql = "SELECT billing_date,total FROM billing WHERE billing_no=?";
    let data = [billing_no];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
        if (error === null) {
          resolve(results);
        }
      });
    });
  },

  parcelSizeList: zone => {
    let sql =
      "SELECT alias_size FROM size_info GROUP BY alias_size ORDER BY min(parcel_price) ASC";
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, (error, results, fields) => {
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
  updateStatusBilling: billing_no => {
    let updateBilling = "UPDATE billing SET status='cancel' WHERE billing_no=?";

    let selectBillingItem =
      "SELECT tracking FROM billing_item WHERE billing_no=?";

    let updateStatusReceiver =
      "UPDATE billing_receiver_info SET status='cancel' WHERE tracking=?";

    let dataBilling = [billing_no];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(
        updateBilling,
        dataBilling,
        (error, results, fields) => {}
      );
      parcel_connection.query(
        selectBillingItem,
        dataBilling,
        (error, resListTracking, fields) => {
          for (i = 0; i < resListTracking.length; i++) {
            let dataTracking = [resListTracking[i].tracking];
            parcel_connection.query(
              updateStatusReceiver,
              dataTracking,
              (error, results2, fields) => {}
            );
          }
        }
      );
    });
  },
  updateStatusReceiver: tracking => {
    return new Promise(function(resolve, reject) {
      let sql = "UPDATE billing_receiver_info SET status='cancel' WHERE tracking=?";
      let data = [tracking];
      parcel_connection.query(sql, data, (error, results, fields) => {
        if(error===null){
          if(results.affectedRows>0){
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
  selectParcelSize: billingNo => {
    return new Promise(function(resolve, reject) {
      let sql =
        `SELECT b.size_price FROM billing_item b 
        JOIN billing_receiver_info br ON b.tracking=br.tracking
        WHERE b.billing_no=? AND (br.status!='cancel' OR br.status is null)`;
      let data = [billingNo];
      parcel_connection.query(sql, data, (error, results, fields) => {
        if(results.length<=0){
          resolve(0);
        } else {
          resolve(results);
        }
      });
    });
  },
  updateBillingInfo: (current_total, billing_no) => {
    let sqlTotal = "UPDATE billing SET total=? WHERE billing_no=?";
    let dataTotal = [current_total, billing_no];

    let sqlStatus = "UPDATE billing SET status=? WHERE billing_no=?";
    let dataStatus = ['cancel', billing_no];
    return new Promise(function(resolve, reject) {
      if(current_total==0) {
        parcel_connection.query(sqlStatus, dataStatus, (error, results, fields) => {
          resolve(results);
        });
      } else {
        parcel_connection.query(sqlTotal, dataTotal, (error, results, fields) => {
          resolve(results);
        });
      }
      
    });
  },
  updateReceiverInfo: (tracking, receiver_name, phone, address) => {
    let sql =
      "UPDATE billing_receiver_info SET receiver_name=?,phone=?,receiver_address=? WHERE tracking=?";
    let data = [receiver_name, phone, address, tracking];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  addressInfo: district_code => {
    let sql =
      "SELECT d.DISTRICT_ID,d.DISTRICT_NAME,a.AMPHUR_ID,a.AMPHUR_NAME,p.PROVINCE_ID,p.PROVINCE_NAME,z.zipcode " +
      "FROM postinfo_district d " +
      "JOIN postinfo_zipcodes z ON d.DISTRICT_CODE=z.district_code " +
      "JOIN postinfo_amphur a ON d.AMPHUR_ID=a.AMPHUR_ID " +
      "JOIN postinfo_province p ON d.PROVINCE_ID=p.PROVINCE_ID " +
      "WHERE d.DISTRICT_CODE=?";
    let data = [district_code];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
        if (error === null) {
          resolve(results);
        } else {
          console.log(error);
          resolve(false);
        }
      });
    });
  },
  updateCheckerInfo: (billing_no,tracking,size_id,size_price,cod_value,receiver_name,phone,address,parcel_type,district_id,district_name,amphur_id,amphur_name,province_id,province_name,zipcode) => {
    let sqlBillingItem = "UPDATE billing_item SET zipcode=?,size_id=?,size_price=?,parcel_type=?,cod_value=? WHERE tracking=?";
    let dataBillingItem = [zipcode,size_id,size_price,parcel_type,cod_value,tracking];

    let sqlReceiver ="UPDATE billing_receiver_info SET parcel_type=?,receiver_name=?,phone=?,receiver_address=?,district_id=?,district_name=?,amphur_id=?,amphur_name=?,province_id=?,province_name=?,zipcode=? WHERE tracking=?";
    let dataReceiver = [parcel_type,receiver_name,phone,address,district_id,district_name,amphur_id,amphur_name,province_id,province_name,zipcode,tracking];

    let sqlSizeItem="SELECT size_price FROM billing_item WHERE billing_no=?"
    let dataSizeItem=[billing_no];

    let total=0;
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sqlBillingItem,dataBillingItem,(error1, resultsItem, fields) => {
          if (error1 === null) {
            if (resultsItem.affectedRows > 0) {
              parcel_connection.query(sqlReceiver,dataReceiver,(error2, resultsReceiver, fields) => {
                  if (error2 === null) {
                    if (resultsReceiver.affectedRows > 0) {
                      parcel_connection.query(sqlSizeItem,dataSizeItem,(error, resultsSizeItem, fields) => {
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
  updateBilling:(billing_no,current_total)=>{
    let sql = "UPDATE billing SET total=? WHERE billing_no=?";
    let data = [current_total,billing_no];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  saveLogQlChecker: (branch_id,user_id,billing_no,error_code,error_maker,cs_name,tracking,operation_key) => {
    let sql =
      "INSERT INTO log_ql_checker(branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key, record_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let data = [branch_id,user_id,billing_no,error_code,error_maker,cs_name,tracking,operation_key,new Date()];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
        if (error === null) {
          resolve(results);
        } else {
          console.log(error);
          resolve(false);
        }
      });
    });
  },
  findOperator: tracking => {
    let sql = "SELECT operator_id FROM parcel_keyin_data_temp WHERE barcode=?";
    let data = [tracking];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
        if (error === null) {
          resolve(results);
        }
      });
    });
  },
  selectPreviousTotal: billing_no => {
    let sql = "SELECT total FROM billing WHERE billing_no =?";
    let data = [billing_no];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
        if (error === null) {
          resolve(results);
        }
      });
    });
  },
  insertLog: (billing_no,previous_value,current_value,reason,module_name,user,ref,remark) => {
    let sql =
      "INSERT INTO log_parcel_tool(billing_no, time_to_system, previous_value, current_value,reason, module_name, user, ref,remark) VALUES (?,?,?,?,?,?,?,?,?)";
    let data = [billing_no,new Date(),previous_value,current_value,reason,module_name,user,ref,remark];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  saveTracking: tracking => {
    let sqlCheck = "SELECT tracking FROM test_dhl_response WHERE tracking=?";
    let dataCheck = [tracking];

    let sql = "INSERT INTO test_dhl_response(tracking) VALUES (?)";
    let data = [tracking];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sqlCheck, dataCheck, (error, results, fields) => {
        if (error === null) {
          if (results.length > 0) {
            resolve(false);
          } else {
            parcel_connection.query(sql, data, (error, results, fields) => {
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
  getBookingLog: () => {
    var current_date = m(new Date()).tz("Asia/Bangkok").format("YYYY-MM-DD", true);
    var sqlBilling = "SELECT bb.tracking, bb.status, bi.tracking, bi.billing_no,bi.cod_value,br.receiver_name,br.phone,br.receiver_address,"+
    "d.DISTRICT_NAME,a.AMPHUR_NAME,p.PROVINCE_NAME,br.zipcode "+
    "FROM booking_tracking_batch bb "+
    "LEFT JOIN billing_item bi ON bb.tracking=bi.tracking "+
    "LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking "+
    "LEFT JOIN postinfo_district d ON br.district_id=d.DISTRICT_ID AND br.amphur_id=d.AMPHUR_ID AND br.province_id=d.PROVINCE_ID "+
    "LEFT JOIN postinfo_amphur a ON br.amphur_id=a.AMPHUR_ID "+
    "LEFT JOIN postinfo_province p ON br.province_id=p.PROVINCE_ID "+
    "WHERE Date(bb.send_record_at)=?";
    var data = [current_date];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sqlBilling, data, (error, results, fields) => {
        if (error === null) {
          if(results.length<=0){
            resolve(null);
          } else {
            resolve(results);
          }
          
        } else {
          console.log("getBookingLog error=>", error);
          resolve(null);
        }
      });
    });
  },
  getDailyData: (date_check) => {
    var current_date = m(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD", true);
    var sqlBilling = `SELECT bi.tracking,bi.billing_no,bi.cod_value,br.receiver_name,br.phone,br.receiver_address,d.DISTRICT_NAME,a.AMPHUR_NAME,p.PROVINCE_NAME,br.zipcode
    FROM billing b
    LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no
    LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
    LEFT JOIN postinfo_district d ON br.district_id=d.DISTRICT_ID AND br.amphur_id=d.AMPHUR_ID AND br.province_id=d.PROVINCE_ID
    LEFT JOIN postinfo_amphur a ON br.amphur_id=a.AMPHUR_ID
    LEFT JOIN postinfo_province p ON br.province_id=p.PROVINCE_ID
    WHERE Date(b.billing_date)=?`;
    var data = [current_date];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sqlBilling, data, (error, results, fields) => {
        if (error === null) {
          if(results.length<=0){
            resolve(null);
          } else {
            resolve(results);
          }
          
        } else {
          console.log("getBookingLog error=>", error);
          resolve(null);
        }
      });
    });
  },
  getDailyDataUnbook: (date_check) => {
    var current_date = m(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD", true);
    var sqlBilling = `SELECT bi.tracking,bi.billing_no,bi.cod_value,br.receiver_name,br.phone,br.receiver_address,d.DISTRICT_NAME,a.AMPHUR_NAME,p.PROVINCE_NAME,br.zipcode
    FROM billing b
    LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no
    LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
    LEFT JOIN postinfo_district d ON br.district_id=d.DISTRICT_ID AND br.amphur_id=d.AMPHUR_ID AND br.province_id=d.PROVINCE_ID
    LEFT JOIN postinfo_amphur a ON br.amphur_id=a.AMPHUR_ID
    LEFT JOIN postinfo_province p ON br.province_id=p.PROVINCE_ID
    WHERE Date(b.billing_date)=? AND (br.booking_status != 100 OR br.booking_status is null)`;
    var data = [current_date];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sqlBilling, data, (error, results, fields) => {
        if (error === null) {
          if(results.length<=0){
            resolve(null);
          } else {
            resolve(results);
          }
          
        } else {
          console.log("getBookingLog error=>", error);
          resolve(null);
        }
      });
    });
  },
  dailyReport: () => {
    // var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD");
    var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var weekAgo = moment().add(-1, "week").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT a.branch_name,a.billing_no,a.sender_name,a.cTracking,a.status,a.billing_date,b.cTrackingNotSuccess FROM
        (SELECT bInfo.branch_name,b.billing_no,br.sender_name,count(bi.tracking) as cTracking,b.status,b.billing_date
            FROM billing b 
            LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no 
            LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking 
            LEFT JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id 
            WHERE (b.billing_date > ? AND b.billing_date <= ?) AND b.status NOT IN ('cancel','SUCCESS')
            GROUP BY b.member_code,b.branch_id,bInfo.branch_name,b.billing_no,br.sender_name,b.status,b.id,b.billing_date 
            ORDER BY b.branch_id, b.id ASC) a
    LEFT JOIN (
                SELECT bi.billing_no,count(bi.tracking) as cTrackingNotSuccess 
                FROM billing_item bi
                LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking 
                WHERE br.booking_status is null AND (br.status !='cancel' OR br.status is null)
                GROUP By bi.billing_no
              ) b
    ON a.billing_no=b.billing_no`;
    var data=[today,weekAgo];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql,data, (err, results) => {
        if(err===null){
          if(results.length<=0){
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
  dailyListTracking: (billing_no) => {

    var sql = "SELECT bi.tracking,s.alias_size,bi.size_price,bi.parcel_type as bi_parcel_type,bi.zipcode as bi_zipcode,bi.cod_value,"+
    "br.parcel_type as br_parcel_type,br.sender_name,br.sender_phone,br.sender_address,br.receiver_name,br.phone,br.receiver_address,"+
    "br.district_name,br.amphur_name,br.province_name,br.zipcode as br_zipcode,br.status,br.sending_date,br.booking_status,br.booking_date,bi.source "+
    "FROM billing_item bi "+
    "LEFT JOIN billing_receiver_info br ON bi.tracking = br.tracking "+
    "LEFT JOIN size_info s ON bi.size_id = s.size_id "+
    "WHERE bi.billing_no=?";
    var data=[billing_no];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql,data, (err, results) => {
        if(err===null){
          if(results.length<=0){
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
  summaryBooking:()=>{
    // var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD");
    var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var weekAgo = moment().add(-1, "week").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sqlNotBooking = `SELECT bi.tracking FROM billing b
    LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no
    LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
    WHERE (b.billing_date > ? AND b.billing_date <= ?) AND (br.booking_status != 100 OR br.booking_status is null) AND (br.status != 'cancel' OR br.status is null)`;
    var dataNotBooking=[today,weekAgo];

    var sqlBooked = `SELECT bi.tracking FROM billing b
    LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no
    LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
    WHERE (b.billing_date > ? AND b.billing_date <= ?) AND br.booking_status = 100 AND (br.status != 'cancel' OR br.status is null)`;
    var dataBooked=[today,weekAgo];

    var sqlTotal = `SELECT bi.tracking FROM billing b
    LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no
    LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
    WHERE (b.billing_date > ? AND b.billing_date <= ?) AND (br.status != 'cancel' OR br.status is null)`;
    var dataTotal=[today,weekAgo];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sqlNotBooking,dataNotBooking,(err_not_book, res_not_book) => {
          if (err_not_book == null) {
            if (res_not_book.length <= 0) {
              resolve(false);
            } else {
              parcel_connection.query(sqlBooked,dataBooked,(err_booked, res_booked) => {
                  if (err_booked == null) {
                    if (res_booked.length <= 0) {
                      resolve(false);
                    } else {
                      parcel_connection.query(sqlTotal,dataTotal,(err, res_total) => {
                        if(err==null){
                          if(res_total.length<=0){
                            resolve(false);
                          } else {
                            var data = {
                              cNotBook: res_not_book.length,
                              cBooked: res_booked.length,
                              total: res_total.length
                            };
                            resolve(data);
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
            }
          } else {
            resolve(false);
          }
        });
    });
  },
  listErrorMaker:()=>{
    var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = "SELECT branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key, record_date FROM log_ql_checker WHERE Date(record_date) >= ?";
    var data=[today];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql,data, (err, results) => {
        if(err===null){
          if(results.length<=0){
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
  bookingReport:(tracking)=>{

    var sql = "SELECT tracking, status, send_record_at, prepare_json, response_record_at, res_json FROM booking_tracking_batch WHERE tracking=?";
    var data=[tracking];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql,data, (err, results) => {
        if(err===null){
          if(results.length<=0){
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
  log_parcel_tool:(ref)=>{

    var sql = "SELECT billing_no, time_to_system, previous_value, current_value,reason, module_name, user, ref,remark FROM log_parcel_tool WHERE ref=?";
    var data=[ref];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql,data, (err, results) => {
        if(err===null){
          if(results.length<=0){
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
  log_daily_tool:(date_check)=>{
    var date_check = moment(date_check).tz("Asia/Bangkok").format("YYYY-MM-DD");
    var sql = "SELECT billing_no, time_to_system, previous_value, current_value,reason, module_name, user, ref,remark FROM log_parcel_tool WHERE Date(time_to_system)=?";
    var data=[date_check];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql,data, (err, results) => {
        if(err===null){
          if(results.length<=0){
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
  add_branch_info:(branch_id,prefix_branch,branch_name,status)=>{
    var sqlBranchInfo = "SELECT branch_id FROM branch_info WHERE branch_id=?";
    var dataBranchInfo=[branch_id];

    var sql = "INSERT INTO branch_info(branch_id, prefix_branch, branch_name, status) VALUES (?,?,?,?)";
    var data=[branch_id,prefix_branch,branch_name,status];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sqlBranchInfo,dataBranchInfo, (err, resultsBranch) => {
        if(resultsBranch<=0){
          parcel_connection.query(sql,data, (err, results) => {
              resolve(results);
          });
        } else {
          resolve(false);
        }
      });
    });
  },
  reportBranch:()=>{
    // var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD");
    var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    var weekAgo = moment().add(-1, "week").tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    var sql = `SELECT a.branch_id,a.branch_name,a.cTracking,b.cNotBooking,c.cBooked
    FROM
    (
        SELECT b.branch_id,bb.branch_name,count(bi.tracking) as cTracking FROM billing b
      LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no
      LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
      LEFT JOIN branch_info bb ON b.branch_id=bb.branch_id
      WHERE (b.billing_date > ? AND b.billing_date <= ?) AND (br.status != 'cancel' OR br.status is null)
      GROUP BY b.branch_id,bb.branch_name
    ) a
    LEFT JOIN 
    (
      SELECT b.branch_id,count(bi.tracking) as cNotBooking FROM billing b
      LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no
      LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
      WHERE (b.billing_date > ? AND b.billing_date <= ?) AND 
        (br.booking_status != 100 OR br.booking_status is null) AND (br.status != 'cancel' OR br.status is null)
        GROUP BY b.branch_id
    ) b ON a.branch_id=b.branch_id
    LEFT JOIN 
    (
      SELECT b.branch_id,count(bi.tracking) as cBooked FROM billing b
      LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no
      LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking
      WHERE (b.billing_date > ? AND b.billing_date <= ?) AND br.booking_status = 100 AND (br.status != 'cancel' OR br.status is null)
        GROUP BY b.branch_id
    ) c ON a.branch_id=c.branch_id
    ORDER BY a.branch_id`
    var data=[today,weekAgo,today,weekAgo,today,weekAgo];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql,data, (err, results) => {
        resolve(results);
      });
    })
  }
};
