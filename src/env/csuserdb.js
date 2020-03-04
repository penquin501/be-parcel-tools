var mysql = require('mysql');
var user_connection = mysql.createPool({
    connectionLimit : 10,
    host: '139.59.105.225',
    user: 'dev_penquin',
    password: 'sunteen2019',
    database: 'database945ffm',
    debug : false,
    timezone : '+07:00'
});
console.log("SLAVE DB INIT");
// connection.connect();

module.exports = user_connection; 