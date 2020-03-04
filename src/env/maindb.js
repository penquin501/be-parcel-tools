var mysql = require('mysql');
var billing_connection = mysql.createPool({
    connectionLimit : 10,
    host: '104.155.237.79',
    user: 'userdevapi',
    password: 'PxnJcKJcmJm6Fdl5',
    database: 'database945ffm_dev_previous2',
    debug : false,
    timezone : '+07:00'
});
console.log("MAIN DB INIT");
// connection.connect();

module.exports = billing_connection;