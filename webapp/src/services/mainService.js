const billing_connection = require('../env/maindb.js');
const bodyParser = require('body-parser');
const request = require('request');
const moment = require('moment');
moment.locale('th')

module.exports = {
    checkStatusParcelRef: (tracking) => {
        return new Promise(function(resolve, reject) {
            let sql = "SELECT mb.payment_method,mb.orderstatus, mb.parcel_ref,md.sendmaildate,md.send_booking "+
            "FROM merchant_billing mb "+
            "JOIN merchant_billing_delivery md ON mb.takeorderby =md.takeorderby and mb.payment_invoice=md.payment_invoice "+
            "WHERE mb.parcel_ref='"+tracking+"'"
            billing_connection.query(sql, (error, results, fields) => {
                if(results.length==0){
                    resolve(false);
                } else {
                    resolve(results);
                }
            });
        })
    },
    checkStatusBilling: (billing) => {
        let sql = "SELECT mb.payment_method,mb.orderstatus,mb.parcel_ref,md.sendmaildate,md.send_booking "+
            "FROM merchant_billing mb "+
            "JOIN merchant_billing_delivery md ON mb.takeorderby = md.takeorderby AND mb.payment_invoice=md.payment_invoice "+
            "WHERE mb.parcel_bill_no=?"
        let data=[billing];
        return new Promise(function(resolve, reject) {
            billing_connection.query(sql,data, (err, results) => {
                var check_pass=true;
                if(err===null){
                    if(results.length==0){
                        resolve(true);
                    } else {
                        for(i=0;i<results.length;i++){
                            if(parseInt(results[i].orderstatus)!=102) {
                                check_pass=false;
                            }
                            if(parseInt(results[i].orderstatus)!=103){
                                check_pass=false;
                            }
                        }
                        resolve(check_pass);
                    }
                }
            });
        })
    },
}