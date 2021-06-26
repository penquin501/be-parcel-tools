const express = require("express");
const router = express.Router();
const moment = require("moment");
// const m = require("moment-timezone");
const request = require("request");
const os = require('os');

const MY_AMQP_PREFIX = process.env.MY_AMQP_PREFIX || "parcel";
var QUEUE_HEALTH = MY_AMQP_PREFIX + ".queue.health.tools." + os.hostname();

module.exports = function (app, appCtx) {
    const db = appCtx.db;
    const channel = appCtx.amqpChannel;
    var healthzCheck = 0;

    router.get("/", async function (req, res) {
        getHealthz();
        let connectdb = await connectSql(db);
        if (connectdb.code == 'ECONNREFUSED') {
            return res.status(500).send("Internal server error");
        } else {
            return res.json({ statusCode: res.statusCode, healthzCheck: healthzCheck });
        }
    });
    /****************************************************************************************************************/
    channel.assertQueue(QUEUE_HEALTH, { exclusive: true });
    console.log("Started");
    console.log(QUEUE_HEALTH);
    channel.consume(QUEUE_HEALTH, async function (msg) {
        task = JSON.parse(msg.content.toString());
        console.log("task", task);
        try {
            console.log("result = %s, health = %d", task.ts, healthzCheck);
            healthzCheck = task.ts;

            channel.ack(msg);
        } catch (error) {
            throw new Error('Internal server error', error);
            // throw new HttpException('Internal server error', 500);
        }
    });

    setInterval(async () => {
        console.log("healthz setInterval");
        await channel.sendToQueue(QUEUE_HEALTH, Buffer.from(JSON.stringify({ ts: new Date().getTime() })));
    }, 5000);
    /****************************************************************************************************************/
    function getHealthz() {
        const FIVE_MINUTE = 5 * 1000; /* ms */
        const now = new Date().getTime();
        const last = healthzCheck;

        console.log("getHealthz now = %s", now);
        console.log("getHealthz last = %s", last);
        const result = now - last;
        console.log("getHealthz result = %s", result);

        if (now - last > FIVE_MINUTE * 1.5 && healthzCheck != 0) {
            throw new Error('Internal server error', 500);
        }
        return {
            ts: last
        };
    }

    app.use("/healthz", router);
};

function connectSql(db) {
    let sql = `SELECT 1`;

    return new Promise(function (resolve, reject) {
        db.query(sql, (error, result, fields) => {
            if (error == null) {
                resolve(true);
            } else {
                console.log(error);
                resolve(error);
            }
        });
    });
}