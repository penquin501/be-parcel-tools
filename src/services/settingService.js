const connection = require("../env/parceldb.js");
const bodyParser = require("body-parser");
const request = require("request");
const moment = require("moment");
const m = require("moment-timezone");
moment.locale("th");

module.exports = {
  branchInfo: () => {
    let sql =`SELECT id, branch_id,prefix_branch,branch_name,status FROM branch_info ORDER BY id ASC`;
    return new Promise(function(resolve, reject) {
        connection.query(sql, (error, results, fields) => {
            resolve(results);
        })
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
}