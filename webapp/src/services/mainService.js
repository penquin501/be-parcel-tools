const billing_connection = require("../env/maindb.js");
const bodyParser = require("body-parser");
const request = require("request");
const moment = require("moment");
moment.locale("th");

module.exports = {
  checkStatusParcelRef: tracking => {
    let sql =
      "SELECT mb.payment_method,mb.orderstatus, mb.parcel_ref,md.sendmaildate,md.send_booking " +
      "FROM merchant_billing mb " +
      "JOIN merchant_billing_delivery md ON mb.takeorderby =md.takeorderby and mb.payment_invoice=md.payment_invoice " +
      "WHERE mb.parcel_ref=?";
    let data = [tracking];
    return new Promise(function(resolve, reject) {
      billing_connection.query(sql, data, (error, results, fields) => {
        if (results.length == 0) {
          resolve(false);
        } else {
          resolve(results);
        }
      });
    });
  },
  checkStatusBilling: billing => {
    let sql =
      "SELECT mb.payment_method,mb.orderstatus,mb.parcel_ref,md.sendmaildate,md.send_booking " +
      "FROM merchant_billing mb " +
      "JOIN merchant_billing_delivery md ON mb.takeorderby = md.takeorderby AND mb.payment_invoice=md.payment_invoice " +
      "WHERE mb.parcel_bill_no=?";
    let data = [billing];
    return new Promise(function(resolve, reject) {
      billing_connection.query(sql, data, (err, results) => {
        var check_pass = true;
        if (err === null) {
          if (results.length == 0) {
            resolve(true);
          } else {
            for (i = 0; i < results.length; i++) {
              if (results[i].send_booking == 1) {
                check_pass = false;
              }
            }
            resolve(check_pass);
          }
        }
      });
    });
  },
  updateStatusCancelTracking: tracking => {
    let sqlBilling =
      "UPDATE merchant_billing SET payment_status='02',orderstatus='101' WHERE parcel_ref=?";
    let dataBilling = [tracking];

    let sqlBillingDelivery =
      "UPDATE merchant_billing_delivery SET sendmaildate=null WHERE mailcode=?";
    let dataBillingDelivery = [tracking];
    return new Promise(function(resolve, reject) {
      billing_connection.query(sqlBilling, dataBilling, (err, results) => {
        resolve(results);
      });
      billing_connection.query(sqlBillingDelivery,dataBillingDelivery,(err, results2) => {
          resolve(results2);}
      );
    });
  },
  updateBillingReceiverInfo: (tracking, receiver_name, phone, address) => {
    let sqlBilling =
      "UPDATE merchant_billing SET ordername=?,orderaddr=?,orderphoneno=? WHERE parcel_ref=?";
    let dataBilling = [receiver_name, address, phone, tracking];

    return new Promise(function(resolve, reject) {
      billing_connection.query(sqlBilling, dataBilling, (err, results) => {
        resolve(results);
      });
    });
  },
  updateStatusCancelTracking: tracking => {
    let sqlBilling =
      "UPDATE merchant_billing SET payment_status='02',orderstatus='101' WHERE parcel_ref=?";
    let dataBilling = [tracking];

    let sqlBillingDelivery =
      "UPDATE merchant_billing_delivery SET sendmaildate=null WHERE mailcode=?";
    let dataBillingDelivery = [tracking];
    return new Promise(function(resolve, reject) {
      billing_connection.query(sqlBilling, dataBilling, (err, results) => {
        resolve(results);
      });
      billing_connection.query(
        sqlBillingDelivery,
        dataBillingDelivery,
        (err, results2) => {
          resolve(results2);
        }
      );
    });
  },
  updateStatusCancelBilling: billing_no => {
    let sqlUpdateBilling =
      "UPDATE merchant_billing SET payment_status='02',orderstatus='101' WHERE parcel_bill_no=?";
    let dataUpdateBilling = [billing_no];

    let sqlListTracking =
      "SELECT parcel_ref FROM merchant_billing WHERE parcel_bill_no=?";
    let dataBilling = [billing_no];

    return new Promise(function(resolve, reject) {
      billing_connection.query(sqlUpdateBilling, dataUpdateBilling,(err, results) => {
          billing_connection.query(sqlListTracking,dataBilling,(err, results2) => {
              let sqlUpdateDelivery ="UPDATE merchant_billing_delivery SET sendmaildate=null WHERE mailcode=?";
              if (results2.length > 0) {
                for (i = 0; i < results2.length; i++) {
                  let dataUpdateDelivery = [results2[i].parcel_ref];
                  billing_connection.query(sqlUpdateDelivery,dataUpdateDelivery,(err, results3) => {
                      resolve(results3);
                    }
                  );
                }
              }
            }
          );
        }
      );
    });
  }
};
