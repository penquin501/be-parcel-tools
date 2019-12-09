const express = require("express");
const request = require('request');
const app = express();
const moment = require('moment');
const port = process.env.PORT || 3200;
moment.locale('th')
app.use(express.json());

const mainServices = require('./services/mainService.js.js');
const parcelServices = require('./services/parcelService.js.js');

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next()
})

app.get("/", function (req, res) {
  res.json({ 'hello': 'World' });
});

app.get("/check/info/tracking", function (req, res) {
    let tracking = req.query.tracking;
    parcelServices.getTrackingImgUrl(tracking).then(function(dataImg){
        parcelServices.getBillingItemTracking(tracking).then(function(data){
            if(data.length==0 || data==false){
                res.json({status:'ERR_NO_DATA_PARCEL'});
            } else {
                mainServices.checkStatusParcelRef(tracking).then(function(data2){
                    // if(data2.length==0 || data2==false){
                    //     res.json({status:'ERR_NO_DATA_BILLING'});
                    // } else {
                        res.json(
                            { 
                                status:'SUCCESS',
                                imgCapture:dataImg,
                                billingInfo: data,
                                statusParcel: data2
                            }
                            );
                    // }
                })
            }
            
        })
    })
});

app.post("/save/cancel/tracking",function(req, res) {
    let tracking = req.body.tracking;
    let billing_no = req.body.billing_no;
    let previous_value = req.body.previous_value;
    let current_value = '101';
    let module_name = 'cancel_tracking';
    let user = req.body.user;
    parcelServices.insertLog(billing_no, previous_value, current_value, module_name, user, tracking).then(function(data){})
    parcelServices.updateStatusReceiver(tracking).then(function(data){})
    res.json({status:'SUCCESS'});
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));