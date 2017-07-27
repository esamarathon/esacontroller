const express = require('express');
const body_parser = require('body-parser');
const logic = require('./logic.js');

var app = express.Router();

app.use(body_parser.json());

var speedcontrol_repeat_filter = false;
app.post("/speedcontrol-event", function(req, res) {
    if (speedcontrol_repeat_filter === true) {
        console.log("Speed filter triggered. Slow down the marathon.", req);
        res.status(409).json("Speed filter triggered. Slow down the marathon.");
    }

    speedcontrol_repeat_filter = true;
    setTimeout(function() {
        console.log("Resetting SpeedControl filter.")
        speedcontrol_repeat_filter = false;
    }, 30*1000);

    console.log(req.body);
    logic.speedcontrol_event(req, res)
});

app.get("/bigredbutton/:id", logic.unimplemented);

app.post("/bigredbutton/:id", logic.bigredbutton);



module.exports = app;
