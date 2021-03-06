const express = require("express");
const request = require("request");
const { resolve } = require("path");
const router = express.Router();
const settingService = require("../services/settingService.js");

module.exports = function(app, appCtx) {
  const db = appCtx.db;
  const amqpChannel = appCtx.amqpChannel;

  router.get("/size-info", (req, res) => {
    settingService.sizeInfo(db).then(function(data) {
      if (data == false) {
        res.json({ status: "error_no_data" });
      } else {
        res.json({ status: "success", data: data });
      }
    });
  });

  router.post("/add-size", (req, res) => {
    let data_size_id = req.body.data_size_id;
    let location_zone = req.body.location_zone;
    let parcel_price = req.body.parcel_price;
    let parcel_cost = req.body.parcel_cost;
    let alias_size = req.body.alias_size;
    let sold_to_account_id = req.body.sold_to_account_id;
    let pickup_account_id = req.body.pickup_account_id;
    let customer_account_id = req.body.customer_account_id;
    let zone = req.body.zone;
    let global_product_id_normal = req.body.global_product_id_normal;
    let global_product_id_cod = req.body.global_product_id_cod;

    var valid = true;
    var resultList = [];
    // valid = isGenericValid(req.body,"data_size_id",valid,resultList,data_size_id);
    valid = isGenericValid(req.body, "location_zone", valid, resultList, location_zone);
    valid = isGenericValid(req.body, "parcel_price", valid, resultList, parcel_price);
    valid = isGenericValid(req.body, "parcel_cost", valid, resultList, parcel_cost);
    valid = isGenericValid(req.body, "alias_size", valid, resultList, alias_size);
    valid = isGenericValid(req.body, "sold_to_account_id", valid, resultList, sold_to_account_id);
    valid = isGenericValid(req.body, "pickup_account_id", valid, resultList, pickup_account_id);
    valid = isGenericValid(req.body, "customer_account_id", valid, resultList, customer_account_id);
    valid = isGenericValid(req.body, "zone", valid, resultList, zone);
    valid = isGenericValid(req.body, "global_product_id_normal", valid, resultList, global_product_id_normal);
    valid = isGenericValid(req.body, "global_product_id_cod", valid, resultList, global_product_id_cod);

    if (!valid) {
      res.json({ status: "data_not_complete" });
    } else if (data_size_id !== 0) {
      res.json({ status: "error_size_id_to_create" });
    } else if (parcel_price == 0) {
      res.json({ status: "error_wrong_parcel_price" });
    } else {
      settingService.addSizeInfo(db, location_zone, parcel_price, parcel_cost, alias_size, sold_to_account_id, pickup_account_id, customer_account_id, zone).then(function(data_size_info) {
        if (data_size_info) {
          settingService.addGlobalSize(db, location_zone, alias_size, global_product_id_normal, global_product_id_cod, zone).then(function(data_global_size) {
            if (data_global_size) {
              res.json({ status: "success" });
            } else {
              res.json({ status: "cannot_create_global_size" });
            }
          });
        } else {
          res.json({ status: "cannot_create_size_info" });
        }
      });
    }
  });

  router.get("/get-size-info/:sizeId", (req, res) => {
    let sizeId = req.params.sizeId;
    settingService.sizeInfoById(db, sizeId).then(function(data) {
      if (data == false) {
        res.json({ status: "error_no_data" });
      } else {
        res.json({ status: "success", data: data });
      }
    });
  });

  router.post("/edit-size", (req, res) => {
    let data_size_id = req.body.data_size_id;
    let location_zone = req.body.location_zone;
    let parcel_price = req.body.parcel_price;
    let parcel_cost = req.body.parcel_cost;
    let alias_size = req.body.alias_size;
    let sold_to_account_id = req.body.sold_to_account_id;
    let pickup_account_id = req.body.pickup_account_id;
    let customer_account_id = req.body.customer_account_id;
    let zone = req.body.zone;
    let global_product_id_normal = req.body.global_product_id_normal;
    let global_product_id_cod = req.body.global_product_id_cod;

    var valid = true;
    var resultList = [];
    valid = isGenericValid(req.body, "data_size_id", valid, resultList, data_size_id);
    valid = isGenericValid(req.body, "location_zone", valid, resultList, location_zone);
    valid = isGenericValid(req.body, "parcel_price", valid, resultList, parcel_price);
    valid = isGenericValid(req.body, "parcel_cost", valid, resultList, parcel_cost);
    valid = isGenericValid(req.body, "alias_size", valid, resultList, alias_size);
    valid = isGenericValid(req.body, "sold_to_account_id", valid, resultList, sold_to_account_id);
    valid = isGenericValid(req.body, "pickup_account_id", valid, resultList, pickup_account_id);
    valid = isGenericValid(req.body, "customer_account_id", valid, resultList, customer_account_id);
    valid = isGenericValid(req.body, "zone", valid, resultList, zone);
    valid = isGenericValid(req.body, "global_product_id_normal", valid, resultList, global_product_id_normal);
    valid = isGenericValid(req.body, "global_product_id_cod", valid, resultList, global_product_id_cod);

    if (data_size_id == 0) {
      res.json({ status: "error_wrong_size_id" });
    } else if (!valid) {
      res.json({ status: "data_not_complete" });
    } else {
      settingService.editSizeInfo(db, data_size_id, location_zone, parcel_price, parcel_cost, alias_size, sold_to_account_id, pickup_account_id, customer_account_id).then(function(data_size_info) {
        if (data_size_info) {
          settingService.editGlobalSize(db, location_zone, alias_size, global_product_id_normal, global_product_id_cod, zone).then(function(data_global_size) {
            if (data_global_size) {
              res.json({ status: "success" });
            } else {
              res.json({ status: "cannot_edit_global_size" });
            }
          });
        } else {
          res.json({ status: "cannot_edit_size" });
        }
      });
    }
  });

  router.get("/sync-global-size", (req, res) => {
    var url945api = "https://www.945api.com";
    request(
      {
        url: url945api + "/parcel/global-product",
        method: "GET"
      },
      async (err, res2, body) => {
        if (err == null) {
          let data = JSON.parse(res2.body);
          if (data.status !== undefined) {
            if (data.status == "SUCCESS") {
              let resultGlobal = [];
              let resultSizeInfo = [];
              for (let item of data.listProduct) {
                resultGlobal.push(await settingService.checkGlobalParcelSize(db, item));
                resultSizeInfo.push(await settingService.checkSizeInfo(db, item));
              }
              if (data.listProduct.length == resultGlobal.length) {
                let sizeInfo = await settingService.sizeInfo(db);
                return res.json({ status: "SUCCESS", globalSize: data.listProduct, sizeInfo: sizeInfo });
              } else {
                return res.json({ status: "ERROR_SAVE/UPDATE_SIZE" });
              }
            } else {
              return res.json({ status: "ERROR_LIST_GLOBAL_SIZE_API" });
            }
          } else {
            return res.json({ status: "ERROR_GLOBAL_SIZE_API" });
          }
        } else {
          return res.json({ status: "ERROR_CONNECT_GLOBAL_SIZE_API" });
        }
      });
  });

  function isGenericValid(data, key, defaultValue, resultList = null, check_tracking) {
    var out = [];

    if (resultList != null) {
      out = resultList;
    }
    if (data[key] == "") {
      console.log("" + check_tracking + " " + key + " empty");
      return false;
    }
    if (data[key] == null) {
      console.log("" + check_tracking + " " + key + " missing");
      return false;
    }
    if (data[key] == undefined) {
      console.log("" + check_tracking + " " + key + " missing");
      return false;
    }
    return defaultValue;
  }

  app.use("/size", router);
};
