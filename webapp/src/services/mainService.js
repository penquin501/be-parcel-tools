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
}