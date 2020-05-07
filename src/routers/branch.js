const app = require("express").Router();
const settingService = require("../services/settingService.js");

app.get("/branch-info", (req, res) => {

    settingService.branchInfo().then(function(data) {
        res.json({status:'success',data:data});
    });
});

app.post("/add-branch", (req, res) => {
    let branch_id = req.body.branch_id;
    let prefix_branch = req.body.prefix_branch;
    let branch_name = req.body.branch_name;
    let status='active';
    settingService.add_branch_info(branch_id,prefix_branch,branch_name,status).then(function(data) {
      res.json({status:'success'});
    });
  });

app.post("/edit-branch", (req, res) => {
    let branch_id = req.body.branch_id;
    let prefix_branch = req.body.prefix_branch;
    let branch_name = req.body.branch_name;
    let status='active';
    settingService.add_branch_info(branch_id,prefix_branch,branch_name,status).then(function(data) {
      res.json({status:'success'});
    });
});

module.exports = app;
