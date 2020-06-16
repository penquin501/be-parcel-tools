const express = require("express");
const router = express.Router();
const settingService = require("../services/settingService.js");

module.exports = function(app, appCtx) {
  const db = appCtx.db;
  const amqpChannel = appCtx.amqpChannel;

  router.get("/branch-info", (req, res) => {
    settingService.branchInfo().then(function(data) {
      res.json({ status: "success", data: data });
    });
  });

  router.post("/add-branch", (req, res) => {
    let branch_id = req.body.branch_id;
    let prefix_branch = req.body.prefix_branch;
    let branch_name = req.body.branch_name;
    let status = "active";
    settingService.add_branch_info(branch_id, prefix_branch, branch_name, status).then(function(data) {
        if (!data) {
          res.json({ status: "error" });
        } else {
          res.json({ status: "success" });
        }
      });
  });

  // router.post("/edit-branch", (req, res) => {
  //     let branch_id = req.body.branch_id;
  //     let prefix_branch = req.body.prefix_branch;
  //     let branch_name = req.body.branch_name;
  //     let status='active';
  //     settingService.add_branch_info(branch_id,prefix_branch,branch_name,status).then(function(data) {
  //       res.json({status:'success'});
  //     });
  // });
  app.use("/branch", router);
};

// module.exports = app;
