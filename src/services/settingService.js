const connection = require("../env/parceldb.js");
const bodyParser = require("body-parser");
const request = require("request");
const moment = require("moment");
const m = require("moment-timezone");
moment.locale("th");

module.exports = {
  branchInfo: db => {
    let sql = `SELECT id, branch_id,prefix_branch,branch_name,status FROM branch_info ORDER BY branch_id ASC`;
    return new Promise(function(resolve, reject) {
      db.query(sql, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  addBranchInfo: (db, branch_id, prefix_branch, branch_name, status) => {
    var sqlBranchInfo = "SELECT branch_id FROM branch_info WHERE branch_id=?";
    var dataBranchInfo = [branch_id];

    var sql = "INSERT INTO branch_info(branch_id, prefix_branch, branch_name, status) VALUES (?,?,?,?)";
    var data = [branch_id, prefix_branch, branch_name, status];

    return new Promise(function(resolve, reject) {
      db.query(sqlBranchInfo, dataBranchInfo, (err_branch, results_branch) => {
        if (err_branch == null) {
          if (results_branch.length <= 0) {
            db.query(sql, data, (err, results) => {
              if (err == null) {
                if (results.affectedRows > 0) {
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
  editBranchInfo: (db, branch_id, prefix_branch, branch_name, status) => {
    var sqlBranchInfo = "SELECT branch_id FROM branch_info WHERE branch_id=?";
    var dataBranchInfo = [branch_id];

    var sql = "UPDATE branch_info SET prefix_branch=?,branch_name=?,status=? WHERE branch_id=?";
    var data = [prefix_branch, branch_name, status, branch_id];

    return new Promise(function(resolve, reject) {
      db.query(sqlBranchInfo, dataBranchInfo, (err_branch, results_branch) => {
        if (err_branch == null) {
          if (results_branch.length > 0) {
            db.query(sql, data, (err, results) => {
              if (err == null) {
                if (results.affectedRows > 0) {
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
  branchInfoById: (db, branchId) => {
    let sql = `SELECT id, branch_id,prefix_branch,branch_name,status FROM branch_info WHERE branch_id=?`;
    let data = [branchId];
    return new Promise(function(resolve, reject) {
      db.query(sql, data, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  sizeInfo: db => {
    let sql = `SELECT * FROM size_info ORDER BY size_id ASC`;
    return new Promise(function(resolve, reject) {
      db.query(sql, (error, results, fields) => {
        if (error == null) {
          if (results.length > 0) {
            resolve(results);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
  sizeInfoById: (db, sizeId) => {
    let sqlSizeInfo = `SELECT * FROM size_info WHERE size_id=?`;
    let dataSizeInfo = [sizeId];

    let sqlGlobalSize = `SELECT * FROM global_parcel_size WHERE alias_name=? AND area=? AND zone=?`;

    return new Promise(function(resolve, reject) {
      db.query(sqlSizeInfo, dataSizeInfo, (error_size_info, results_size_info, fields) => {
        if (error_size_info == null) {
          if (results_size_info.length > 0) {
            db.query(sqlGlobalSize, [results_size_info[0].alias_size, results_size_info[0].location_zone, results_size_info[0].zone], (error_global_size, results_global_size, fields) => {
              if (error_global_size == null) {
                if (results_global_size.length > 0) {
                  var data_size = {
                    size_info: results_size_info,
                    global_size: results_global_size
                  };
                  resolve(data_size);
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
  addSizeInfo: (db, location_zone, parcel_price, parcel_cost, alias_size, sold_to_account_id, pickup_account_id, customer_account_id, zone) => {
    var sqlSizeInfo = "SELECT * FROM size_info WHERE alias_size=? AND location_zone=? AND zone=?";
    var dataSizeInfo = [alias_size, location_zone, zone];

    var size_name = "??????????????? size " + alias_size.toUpperCase();

    var sqlSaveSizeInfo = `INSERT INTO size_info(size_name, location_zone, parcel_price, parcel_cost, alias_size, sold_to_account_id, pickup_account_id, customer_account_id, zone) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    var dataSaveSizeInfo = [size_name, location_zone.toLowerCase(), parcel_price, parcel_cost, alias_size.toLowerCase(), sold_to_account_id, pickup_account_id, customer_account_id, zone];

    return new Promise(function(resolve, reject) {
      db.query(sqlSizeInfo, dataSizeInfo, (error_size_info, results_size_info) => {
        if (error_size_info == null) {
          if (results_size_info.length <= 0) {
            db.query(sqlSaveSizeInfo, dataSaveSizeInfo, (error_save_size_info, results_save_size_info) => {
              if (error_save_size_info == null) {
                if (results_save_size_info.affectedRows > 0) {
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
  addGlobalSize: (db, location_zone, alias_size, global_product_id_normal, global_product_id_cod, zone) => {
    var sqlGlobalSizeNormal = "SELECT * FROM global_parcel_size WHERE product_id=?";
    var dataGlobalSizeNormal = [global_product_id_normal];

    var sqlGlobalSizeCod = "SELECT * FROM global_parcel_size WHERE product_id=?";
    var dataGlobalSizeCod = [global_product_id_cod];

    var product_name_normal = "????????????????????????????????? size " + alias_size.toUpperCase();
    var product_name_cod = "???????????????????????????????????????????????????????????? size " + alias_size.toUpperCase();

    var sqlSaveGlobalSizeNormal = "INSERT INTO global_parcel_size(product_id, alias_name, product_name, area, type, zone) VALUES (?, ?, ?, ?, ?, ?)";
    var dataSaveGlobalSizeNormal = [global_product_id_normal, alias_size.toLowerCase(), product_name_normal, location_zone.toUpperCase(), "NORMAL", zone];

    var sqlSaveGlobalSizeCod = "INSERT INTO global_parcel_size(product_id, alias_name, product_name, area, type, zone) VALUES (?, ?, ?, ?, ?, ?)";
    var dataSaveGlobalSizeCod = [global_product_id_cod, alias_size.toLowerCase(), product_name_cod, location_zone.toUpperCase(), "COD", zone];

    return new Promise(function(resolve, reject) {
      db.query(sqlGlobalSizeNormal, dataGlobalSizeNormal, (error_global_normal, results_global_normal, fields) => {
        if (error_global_normal == null) {
          if (results_global_normal.length <= 0) {
            db.query(sqlGlobalSizeCod, dataGlobalSizeCod, (error_global_cod, results_global_cod, fields) => {
              if (error_global_cod == null) {
                if (results_global_cod.length <= 0) {
                  db.query(sqlSaveGlobalSizeNormal, dataSaveGlobalSizeNormal, (error_save_global_normal, results_save_global_normal, fields) => {
                    if (error_save_global_normal == null) {
                      if (results_save_global_normal.affectedRows > 0) {
                        db.query(sqlSaveGlobalSizeCod, dataSaveGlobalSizeCod, (error_save_global_cod, results_save_global_cod, fields) => {
                          if (error_save_global_cod == null) {
                            if (results_save_global_cod.affectedRows > 0) {
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
  editSizeInfo: (db, data_size_id, location_zone, parcel_price, parcel_cost, alias_size, sold_to_account_id, pickup_account_id, customer_account_id) => {
    var sqlSizeInfo = "SELECT * FROM size_info WHERE size_id=?";
    var dataSizeInfo = [data_size_id];

    var sqlUpdateSizeInfo = "UPDATE size_info SET parcel_price=?, parcel_cost=?, sold_to_account_id=?, pickup_account_id=?, customer_account_id=? WHERE size_id=?";
    var dataUpdateSizeInfo = [parcel_price, parcel_cost, sold_to_account_id, pickup_account_id, customer_account_id, data_size_id];

    return new Promise(function(resolve, reject) {
      db.query(sqlSizeInfo, dataSizeInfo, (err_size_info, results_size_info) => {
        if (err_size_info == null) {
          if (results_size_info.length > 0) {
            db.query(sqlUpdateSizeInfo, dataUpdateSizeInfo, (err_update_size_info, results_update_size_info) => {
              if (err_update_size_info == null) {
                if (results_update_size_info.affectedRows > 0) {
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
  editGlobalSize: (db, location_zone, alias_size, global_product_id_normal, global_product_id_cod, zone) => {
    var sqlGlobalSizeNormal = "SELECT * FROM global_parcel_size WHERE alias_name=? AND area=? AND type=? AND zone=?";
    var dataGlobalSizeNormal = [alias_size.toLowerCase(), location_zone.toUpperCase(), "NORMAL", zone];

    var sqlGlobalSizeCod = "SELECT * FROM global_parcel_size WHERE alias_name=? AND area=? AND type=? AND zone=?";
    var dataGlobalSizeCod = [alias_size.toLowerCase(), location_zone.toUpperCase(), "COD", zone];

    var sqlUpdateGlobalSizeNormal = "UPDATE global_parcel_size SET product_id=? WHERE alias_name=? AND area=? AND type=? AND zone=?";
    var dataUpdateGlobalSizeNormal = [global_product_id_normal, alias_size.toLowerCase(), location_zone.toUpperCase(), "NORMAL", zone];

    var sqlUpdateGlobalSizeCod = "UPDATE global_parcel_size SET product_id=? WHERE alias_name=? AND area=? AND type=? AND zone=?";
    var dataUpdateGlobalSizeCod = [global_product_id_cod, alias_size.toLowerCase(), location_zone.toUpperCase(), "COD", zone];

    return new Promise(function(resolve, reject) {
      db.query(sqlGlobalSizeNormal, dataGlobalSizeNormal, (err_global_normal, results_global_normal) => {
        if (err_global_normal == null) {
          if (results_global_normal.length > 0) {
            db.query(sqlGlobalSizeCod, dataGlobalSizeCod, (err_global_cod, results_global_cod) => {
              if (err_global_cod == null) {
                if (results_global_cod.length > 0) {
                  db.query(sqlUpdateGlobalSizeNormal, dataUpdateGlobalSizeNormal, (err_update_global_normal, results_update_global_normal) => {
                    if (err_update_global_normal == null) {
                      if (results_update_global_normal.affectedRows > 0) {
                        db.query(sqlUpdateGlobalSizeCod, dataUpdateGlobalSizeCod, (err_update_global_cod, results_update_global_cod) => {
                          if (err_update_global_cod == null) {
                            if (results_update_global_cod.affectedRows > 0) {
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
  provinceInfo: db => {
    let sql = `SELECT * FROM postinfo_province ORDER BY PROVINCE_ID ASC`;
    return new Promise(function(resolve, reject) {
      db.query(sql, (error, results, fields) => {
        resolve(results);
      });
    });
  },
  checkGlobalParcelSize: (db, data) => {
    let sqlCheckGlobalSize = `SELECT * FROM global_parcel_size WHERE product_id = ?`;

    let saveGlobalSize = `INSERT INTO global_parcel_size(product_id, alias_name, product_name, area, type, zone) VALUES (?, ?, ?, ?, ?, ?)`;
    let dataGlobalSize = [data.productid, data.size_name.toLowerCase(), data.productname, data.area.toUpperCase(), data.box_type.toUpperCase(), parseInt(data.pricing_zone)];

    let updateGlobalSize = `UPDATE global_parcel_size SET alias_name = ?, product_name = ?, area = ?, type = ?, zone = ? WHERE product_id = ?`;
    let dataUpdateGlobalSize = [data.size_name.toLowerCase(), data.productname, data.area.toUpperCase(), data.box_type.toUpperCase(), parseInt(data.pricing_zone), data.productid];

    return new Promise(function (resolve, reject) {
      db.query(sqlCheckGlobalSize, [data.productid], (error, results, fields) => {
        if (error == null) {
          if (results.length > 0) {
            /* update */
            db.query(updateGlobalSize, dataUpdateGlobalSize, (errorUpdate, resultsUpdate, fields) => {
              if (errorUpdate == null) {
                if (resultsUpdate.affectedRows > 0) {
                  resolve(true);
                } else {
                  console.log("error update global size = %s", data.productid);
                  resolve(null);
                }
              } else {
                console.log("error connect db, update global size ", errorUpdate);
                resolve(false);
              }
            });
          } else {
            /* save */
            db.query(saveGlobalSize, dataGlobalSize, (errorSave, resultSave, fields) => {
              if (errorSave == null) {
                if (resultSave.affectedRows > 0) {
                  resolve(true);
                } else {
                  console.log("error save global size = %s", data.productid);
                  resolve(null);
                }
              } else {
                console.log("error connect db, save global size ", errorSave);
                resolve(false);
              }
            });
          }
        } else {
          console.log("error connect db ", error);
          resolve(false);
        }
      });
    });
  },
  checkSizeInfo: (db, data) => {
    let sqlCheckSizeInfo = `SELECT * FROM size_info WHERE alias_size=? AND location_zone=? AND zone=?`;
    let dataCheckSizeInfo = [data.size_name.toLowerCase(), data.area.toLowerCase(), parseInt(data.pricing_zone)];

    let size_name = "??????????????? SIZE " + data.size_name.toUpperCase();
    let saveSizeInfo = `INSERT INTO size_info(size_name, location_zone, parcel_price, parcel_cost, alias_size, sold_to_account_id, pickup_account_id, customer_account_id, zone) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let dataSizeInfo = [size_name, data.area.toLowerCase(), parseInt(data.delivery_fee), parseInt(data.cost), data.size_name.toLowerCase(), data.soldto, data.pickup, data.customer, parseInt(data.pricing_zone)];

    let updateSizeInfo = `UPDATE size_info SET size_name=?, location_zone=?, parcel_price=?, parcel_cost=?, sold_to_account_id=?, pickup_account_id=?, customer_account_id=?, zone=? 
    WHERE alias_size=? AND location_zone=? AND zone=?`;
    let dataUpdateSizeInfo = [size_name, data.area.toLowerCase(), parseInt(data.delivery_fee), parseInt(data.cost), data.soldto, data.pickup, data.customer, parseInt(data.pricing_zone), data.size_name.toLowerCase(), data.area.toLowerCase(), parseInt(data.pricing_zone)];

    return new Promise(function (resolve, reject) {
      db.query(sqlCheckSizeInfo, dataCheckSizeInfo, (error, results, fields) => {
        if (error == null) {
          if (results.length > 0) {
            /* update */
            db.query(updateSizeInfo, dataUpdateSizeInfo, (errorUpdate, resultsUpdate, fields) => {
              if (errorUpdate == null) {
                if (resultsUpdate.affectedRows > 0) {
                  resolve(true);
                } else {
                  console.log("error update size info = %s %s %s", data.size_name.toLowerCase(), data.area.toLowerCase(), data.pricing_zone);
                  resolve(null);
                }
              } else {
                console.log("error connect db, update size info ", errorUpdate);
                resolve(false);
              }
            });
          } else {
            /* save */
            db.query(saveSizeInfo, dataSizeInfo, (errorSave, resultSave, fields) => {
              if (errorSave == null) {
                if (resultSave.affectedRows > 0) {
                  resolve(true);
                } else {
                  console.log("error save size info = %s %s %s", data.size_name.toLowerCase(), data.area.toLowerCase(), data.pricing_zone);
                  resolve(null);
                }
              } else {
                console.log("error connect db, save size info ", errorSave);
                resolve(false);
              }
            });
          }
        } else {
          console.log("error connect db ", error);
          resolve(false);
        }
      });
    });
  },
};
