const connection = require("../env/parceldb.js");
const bodyParser = require("body-parser");
const request = require("request");
const moment = require("moment");
const m = require("moment-timezone");
moment.locale("th");

module.exports = {
  branchInfo: (db) => {
    let sql =`SELECT id, branch_id,prefix_branch,branch_name,status FROM branch_info ORDER BY id ASC`;
    return new Promise(function(resolve, reject) {
      db.query(sql, (error, results, fields) => {
            resolve(results);
        })
    });
  },
  addBranchInfo:(db,branch_id,prefix_branch,branch_name,status)=>{
    var sqlBranchInfo = "SELECT branch_id FROM branch_info WHERE branch_id=?";
    var dataBranchInfo=[branch_id];

    var sql = "INSERT INTO branch_info(branch_id, prefix_branch, branch_name, status) VALUES (?,?,?,?)";
    var data=[branch_id,prefix_branch,branch_name,status];

    return new Promise(function(resolve, reject) {
      db.query(sqlBranchInfo,dataBranchInfo, (err_branch, results_branch) => {
        if(err_branch==null){
          if(results_branch.length<=0){
            db.query(sql,data, (err, results) => {
              if(err==null){
                if(results.affectedRows>0){
                  resolve(true);
                } else {
                  resolve(false);
                }

              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  editBranchInfo:(db,branch_id,prefix_branch,branch_name,status)=>{
    var sqlBranchInfo = "SELECT branch_id FROM branch_info WHERE branch_id=?";
    var dataBranchInfo=[branch_id];

    var sql = "UPDATE branch_info SET prefix_branch=?,branch_name=?,status=? WHERE branch_id=?";
    var data=[prefix_branch,branch_name,status,branch_id];

    return new Promise(function(resolve, reject) {
      db.query(sqlBranchInfo,dataBranchInfo, (err_branch, results_branch) => {
        if(err_branch==null){
          if(results_branch.length > 0){
            db.query(sql,data, (err, results) => {
              if(err==null){
                if(results.affectedRows>0){
                  resolve(true);
                } else {
                  resolve(false);
                }
              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  branchInfoById: (db,branchId) => {
    let sql =`SELECT id, branch_id,prefix_branch,branch_name,status FROM branch_info WHERE branch_id=?`;
    let data = [branchId];
    return new Promise(function(resolve, reject) {
      db.query(sql,data, (error, results, fields) => {
            resolve(results);
        })
    });
  },
}