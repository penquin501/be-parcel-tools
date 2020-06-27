const express = require("express");
const router = express.Router();
const settingService = require("../services/settingService.js");

module.exports = function(app, appCtx) {
  const db = appCtx.db;
  const amqpChannel = appCtx.amqpChannel;

  router.get("/size-info", (req, res) => {
    settingService.branchInfo(db).then(function(data) {
      res.json({ status: "success", data: data });
    });
  });

  router.post("/add-size", (req, res) => {
    let branch_id = parseInt(req.body.branch_id);
    let prefix_branch = req.body.prefix_branch;
    let branch_name = req.body.branch_name;
    let status = req.body.branch_status;

    var valid=true;
    var resultList = [];
    valid = isGenericValid(req.body,"branch_id",valid,resultList,branch_id);
    valid = isGenericValid(req.body,"prefix_branch",valid,resultList,prefix_branch);
    valid = isGenericValid(req.body,"branch_name",valid,resultList,branch_name);
    valid = isGenericValid(req.body,"branch_status",valid,resultList,status);

    if(branch_id==0){
      res.json({ status: "error_wrong_branch_id"});
    } else if(!valid){
      res.json({ status: "data_not_complete"});
    } else {
      settingService.addBranchInfo(db,branch_id, prefix_branch, branch_name, status).then(function(data) {
        if (data) {
          res.json({ status: "success" });
        } else {
          res.json({ status: "cannot_create_branch"});
        }
      });
    }
    
  });

  router.get("/get-size-info/:sizeId", (req, res) => {
    let branchId=req.params.branchId;
    settingService.branchInfoById(db,branchId).then(function(data) {
      res.json({ status: "success", data: data });
    });
  });

  router.post("/edit-size", (req, res) => {
    let branch_id = parseInt(req.body.branch_id);
    let prefix_branch = req.body.prefix_branch;
    let branch_name = req.body.branch_name;
    let status = req.body.branch_status;

    var valid=true;
    var resultList = [];
    valid = isGenericValid(req.body,"branch_id",valid,resultList,branch_id);
    valid = isGenericValid(req.body,"prefix_branch",valid,resultList,prefix_branch);
    valid = isGenericValid(req.body,"branch_name",valid,resultList,branch_name);
    valid = isGenericValid(req.body,"branch_status",valid,resultList,status);

    if(branch_id==0){
      res.json({ status: "error_wrong_branch_id"});
    } else if(!valid){
      res.json({ status: "data_not_complete"});
    } else {
      settingService.editBranchInfo(db,branch_id,prefix_branch,branch_name,status).then(function(data) {
        if (data) {
          res.json({ status: "success" });
        } else {
          res.json({ status: "cannot_edit_branch"});
        }
      });
    }
  });

  function isGenericValid(data,key,defaultValue,resultList = null,check_tracking) {
    var out = [];

    if (resultList != null) {
      out = resultList;
    }
    if (data[key] == "") {
      // out.push("" + check_tracking + " empty");
      console.log("" + check_tracking + " " + key + " empty");
      return false;
    }
    if (data[key] == null) {
      // out.push("" + check_tracking + " missing");
      console.log("" + check_tracking + " " + key + " missing");
      return false;
    }
    if (data[key] == undefined) {
      // out.push("" + check_tracking + " missing");
      console.log("" + check_tracking + " " + key + " missing");
      return false;
    }
    // console.log(out);
    return defaultValue;
  }

  app.use("/size", router);
};