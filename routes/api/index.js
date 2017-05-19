const express = require('express');
const body_parser = require('body-parser');
const http = require('http');
const Promise = require('promise');
var config = require('config');
const youtube = require('../../youtube');
var SpeedControl = require('../../speedcontrol');

var app = express.Router();

app.use(body_parser.json());

app.post("/speedcontrol-event", function(req, res) {
    var runData = req.body;
    if (config.get("speedcontrol").key != undefined && 
        req.get("API-Key") !== config.get("speedcontrol").key) {
        res.status(403).json("Wrong Key");
        console.log("Blocked faulty keydata from SpeedControl. The key was ", req.get("API-key"));
        return;
    }
    //TODO "Massage" run-data into a more convenient format.
    runData = youtube.simplify(runData);

    console.log(JSON.stringify(runData));
    if (config.has('youtube') && config.get('youtube').enable) {
        youtube.uploadToYoutube(runData);   
    }

    // One day I will include automatic submission to esavods.com
    // This is not that day. 
    // I want more data on what the script can return before I start thinking about parsing out the YT ID.

    res.status(200).json("OK");
})

app.get("/bigredbutton/:id", function(req, res) {
    res.json({status: "NOT IMPLEMENTED"});
});

var buttonInhibitor = {};
app.post("/bigredbutton/:id", function(req, res) {
    var pressData = req.body;
    if (config.sharedkey != undefined && pressData.key !== config.get("sharedkey")) {
        res.status(403).json("Wrong Key");
        return;
    }
    delete pressData.key;

    var speedcontrol = new SpeedControl(config.get('speedcontrol'));

    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1) {
        return res.status(403).json({
            message: "Bad Id.",
            id: req.params.id
        });
    }

    if (buttonInhibitor[id] == true) {
        return res.status(401).json({
            message: "To many presses in short time. Dropping.",
            id: id
        })
    }

    buttonInhibitor[id] = true;
    setTimeout(function() {
        buttonInhibitor[id] = false;
    }, 2000);

    speedcontrol.timers().then(function(timers) {
        if (id > timers.length) {
            return res.status(403).json({
                message: "Player does not exist in this run.",
                id: id,
                players: timers.length
            });
        }
        console.log(timers[id-1]);
        switch (timers[id-1].status) {
            case "waiting": return speedcontrol.start();
            case "running": return speedcontrol.split(id-1);
            case "finished":
                throw {code: 400, message: "You lazy b*stard. Reset the timer yourself."};
            default: throw {message: "Invalid runner state."};
        }
        
    }).catch(function(e) {
        res.status(e.code || 500).json(e.message);
    }).then( function(data) {
        res.json("OK");
    });
})

module.exports = app;
