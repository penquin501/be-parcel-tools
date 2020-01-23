const parcel_connection = require("../env/parceldb.js");
const bodyParser = require("body-parser");
const request = require("request");
const moment = require("moment");
moment.locale("th");

module.exports = {
  getBillingItemTracking: tracking => {
    return new Promise(function(resolve, reject) {
      let sql =
        "SELECT bi.billing_no,bi.tracking,bi.size_id,s.alias_size,bi.size_price,bi.parcel_type as bi_parcel_type, bi.cod_value,bi.zipcode as bi_zipcode," +
        "br.parcel_type as br_parcel_type,br.sender_name,br.sender_phone,br.sender_address,br.receiver_name,br.phone,br.receiver_address," +
        "br.district_name,br.amphur_name,br.province_name,br.zipcode as br_zipcode " +
        "FROM billing_item bi " +
        "JOIN billing_receiver_info br ON bi.tracking=br.tracking " +
        "JOIN size_info s ON bi.size_id= s.size_id " +
        "WHERE bi.tracking='" +
        tracking +
        "'";
      parcel_connection.query(sql, (error, results, fields) => {
        if (results.length == 0) {
          resolve(false);
        } else {
          resolve(results);
        }
      });
    });
  },
  getTrackingImgUrl: tracking => {
    return new Promise(function(resolve, reject) {
      let sql =
        "SELECT image_url FROM parcel_capture_data WHERE barcode='" +
        tracking +
        "'";
      parcel_connection.query(sql, (error, results, fields) => {
        if (results.length == 0) {
          resolve(false);
        } else {
          resolve(results);
        }
      });
    });
  },
  getBillingInfo: (billing) => {
    let sql = "SELECT billing_no,status FROM billing WHERE billing_no=?";
    let data = [billing];

    let sqlItem = "SELECT count(tracking) as cTracking FROM billing_item WHERE billing_no=?";
    let dataItem = [billing];

    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql, data, (err, results) => {
        
        if (err === null) {
          if (results.length == 0) {
            resolve(false);
          } else {
            parcel_connection.query(sqlItem, dataItem, (err, resultsItem) => {
              
              var dataResult={
                billingNo:results[0].billing_no,
                billingStatus: results[0].status,
                countTracking:resultsItem[0].cTracking
              }
              resolve(dataResult);
            })
            
          }
        } else {
          console.log(err);
        }
      });
    });
  },
  getListTrackingNotMatch: () => {
    return new Promise(function(resolve, reject) {
      let sql =
        "SELECT bi.tracking FROM billing_item bi " +
        "JOIN billing_receiver_info br ON bi.tracking=br.tracking " +
        "WHERE bi.zipcode != br.zipcode OR bi.parcel_type != br.parcel_type";
      parcel_connection.query(sql, (error, results, fields) => {
        if (results.length == 0) {
          resolve(false);
        } else {
          resolve(results);
        }
      });
    });
  },

  parcelSizeList: zone => {
    return new Promise(function(resolve, reject) {
      let sql =
        "SELECT alias_size FROM size_info GROUP BY alias_size ORDER BY min(parcel_price) ASC";
      parcel_connection.query(sql, (error, results, fields) => {
        if (results.length == 0) {
          resolve(false);
        } else {
          resolve(results);
        }
      });
    });
  },
  updateStatusBilling: billing_no => {
    let updateBilling ="UPDATE billing SET status='cancel' WHERE billing_no=?";

    let selectBillingItem ="SELECT tracking FROM billing_item WHERE billing_no=?";

    let updateStatusReceiver="UPDATE billing_receiver_info SET status='cancel' WHERE tracking=?";

    let dataBilling=[billing_no];
    // let dataBilling=[billing_no];
    return new Promise(function(resolve, reject) {
      // parcel_connection.query(updateBilling,dataBilling, (error, results, fields) => {});
      parcel_connection.query(selectBillingItem,dataBilling, (error, resListTracking, fields) => {
        
        for(i=0;i<resListTracking.length;i++){
          let dataTracking=[resListTracking[i].tracking];
          parcel_connection.query(updateStatusReceiver,dataTracking, (error, results2, fields) => {})
        }

      });
    });
  },
  updateStatusReceiver: tracking => {
    return new Promise(function(resolve, reject) {
      let sql =
        "UPDATE billing_receiver_info SET status='cancel' WHERE tracking='" +
        tracking +
        "'";
      parcel_connection.query(sql, (error, results, fields) => {resolve(results)});
    });
  },
  updateReceiverInfo: (tracking, receiver_name, phone, address) => {
    return new Promise(function(resolve, reject) {
      let sql =
        "UPDATE billing_receiver_info SET receiver_name='" +
        receiver_name +
        "',phone='" +
        phone +
        "',receiver_address='" +
        address +
        "' WHERE tracking='" +
        tracking +
        "'";
      parcel_connection.query(sql, (error, results, fields) => {});
    });
  },
  insertLog: (billing_no,previous_value,current_value,module_name,user,ref) => {
    // var dateTimeString = moment(new Date()).format("YYYY-MM-DD HH:mm:ss", true);
    let sql ="INSERT INTO log_parcel_tool(billing_no, time_to_system, previous_value, current_value, module_name, user, ref) VALUES ('?,?,?,?,?,?,?)";
    let data=[billing_no,new Date(),previous_value,current_value,module_name,user,ref];
    return new Promise(function(resolve, reject) {
      parcel_connection.query(sql,data, (error, results, fields) => {
        resolve(results);
      });
    });
  }
};
