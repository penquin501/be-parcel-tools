const express = require("express");
const router = express.Router();
const settingService = require("../services/settingService.js");

module.exports = function(app, appCtx) {
  const db = appCtx.db;
  const amqpChannel = appCtx.amqpChannel;

  router.get("/list-province", (req, res) => {
    settingService.provinceInfo(db).then(function(data) {
      if (data == false) {
        res.json({ status: "error_no_data" });
      } else {
        res.json({ status: "success", data: data });
      }
    });
  });

  app.use("/general", router);
};
