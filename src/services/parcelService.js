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
    let sql = "SELECT billing_no,status FROM billing WHERE billing_no=?";
    let data = [billing];

    let sqlItem =
      "SELECT count(tracking) as cTracking FROM billing_item WHERE billing_no=?";
    let dataItem = [billing];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (err, results) => {
        if (err === null) {
          if (results.length == 0) {
            resolve(false);
          } else {
            parcel_connection.query(sqlItem, dataItem, (err, resultsItem) => {
              var dataResult = {
                billingNo: results[0].billing_no,
                billingStatus: results[0].status,
                countTracking: resultsItem[0].cTracking
              };
              resolve(dataResult);
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
    let sql = "SELECT total FROM billing WHERE billing_no=?";
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
      let sql =
        "UPDATE billing_receiver_info SET status='cancel' WHERE tracking=?";
      let data = [tracking];
      parcel_connection.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  selectParcelSize: billingNo => {
    return new Promise(function(resolve, reject) {
      let sql =
        "SELECT b.size_price FROM billing_item b " +
        "JOIN billing_receiver_info br ON b.tracking=br.tracking " +
        "WHERE b.billing_no=? AND (br.status!='cancel' OR br.status is null)";
      let data = [billingNo];
      parcel_connection.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  updateBillingInfo: (current_total, billing_no) => {
    return new Promise(function(resolve, reject) {
      let sql = "UPDATE billing SET total=? WHERE billing_no=?";
      let data = [current_total, billing_no];
      parcel_connection.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
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
  updateCheckerInfo: (
    tracking,
    size_id,
    size_price,
    cod_value,
    receiver_name,
    phone,
    address,
    parcel_type,
    district_id,
    district_name,
    amphur_id,
    amphur_name,
    province_id,
    province_name,
    zipcode
  ) => {
    let sqlBillingItem =
      "UPDATE billing_item SET zipcode=?,size_id=?,size_price=?,parcel_type=?,cod_value=? WHERE tracking=?";
    let dataBillingItem = [
      zipcode,
      size_id,
      size_price,
      parcel_type,
      cod_value,
      tracking
    ];

    let sqlReceiver =
      "UPDATE billing_receiver_info SET parcel_type=?,receiver_name=?,phone=?,receiver_address=?,district_id=?,district_name=?,amphur_id=?,amphur_name=?,province_id=?,province_name=?,zipcode=? WHERE tracking=?";
    let dataReceiver = [
      parcel_type,
      receiver_name,
      phone,
      address,
      district_id,
      district_name,
      amphur_id,
      amphur_name,
      province_id,
      province_name,
      zipcode,
      tracking
    ];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(
        sqlBillingItem,
        dataBillingItem,
        (error, resultsItem, fields) => {
          if (resultsItem.affectedRows > 0) {
            parcel_connection.query(
              sqlReceiver,
              dataReceiver,
              (error, resultsReceiver, fields) => {
                resolve(resultsReceiver);
              }
            );
          }
        }
      );
    });
  },
  saveLogQlChecker: (
    branch_id,
    user_id,
    billing_no,
    error_code,
    error_maker,
    cs_name,
    tracking,
    operation_key
  ) => {
    let sql =
      "INSERT INTO log_ql_checker(branch_id, user_id, billing_no, error_code, error_maker, cs_name, tracking, operation_key, record_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let data = [
      branch_id,
      user_id,
      billing_no,
      error_code,
      error_maker,
      cs_name,
      tracking,
      operation_key,
      new Date()
    ];
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
  insertLog: (
    billing_no,
    previous_value,
    current_value,
    module_name,
    user,
    ref
  ) => {
    let sql =
      "INSERT INTO log_parcel_tool(billing_no, time_to_system, previous_value, current_value, module_name, user, ref) VALUES (?,?,?,?,?,?,?)";
    let data = [
      billing_no,
      new Date(),
      previous_value,
      current_value,
      module_name,
      user,
      ref
    ];
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
  dailyReport: () => {
    var today = moment().tz("Asia/Bangkok").format("YYYY-MM-DD");
    console.log("daily report =>",today);
    var sql = "SELECT bInfo.branch_name,b.billing_no,br.sender_name,count(bi.tracking) as cTracking,b.status, b.id "+
    "FROM billing b "+
    "LEFT JOIN billing_item bi ON b.billing_no=bi.billing_no "+
    "LEFT JOIN billing_receiver_info br ON bi.tracking=br.tracking "+
    "LEFT JOIN branch_info bInfo ON b.branch_id=bInfo.branch_id "+
    "WHERE Date(b.billing_date) = ? AND b.status NOT IN ('cancel','SUCCESS') "+
    "GROUP BY b.member_code,b.branch_id,bInfo.branch_name,b.billing_no,br.sender_name,b.status, b.id "+
    "ORDER BY b.branch_id, b.id ASC";
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
};
