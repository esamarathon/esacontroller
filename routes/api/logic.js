const http = require('http');
const Promise = require('promise');
var config = require('config');
const youtube = require('../../youtube');
var SpeedControl = require('../../speedcontrol');

function getRunData(eventData) {
   var runData = eventData.oldrun;
    if (typeof(eventData.data) !== "undefined" && typeof(eventData.data.end) !== "undefined") {
        runData.end = eventData.data.end;
    } 
    return runData;
}

function speedcontrol_event(req, res) {
    var eventData = req.body;
    if (config.get("speedcontrol").key != undefined && 
        req.get("API-Key") !== config.get("speedcontrol").key) {
        res.status(403).json("Wrong Key");
        console.log("Blocked faulty keydata from SpeedControl. The key was ", req.get("API-key"));
        return;
    }
    if (eventData.event == "runStarted") {
        var runData = getRunData(eventData);
    } else {
        res.status(200).json("OK");
        return;
    }

    if (typeof(runData) === 'undefined' || typeof(runData.start) === 'undefined' || runData.start <= 0) {
        console.log("Run invalid. Start time is nonsensical." );
        res.status(400).json("Non-sensical run data.");
        return;
    }

    //TODO "Massage" run-data into a more convenient format.
    runData = youtube.simplify(runData);


    console.log(JSON.stringify(runData));
    if (config.has('youtube') && config.get('youtube').enable) {
        youtube.uploadToYoutube(runData)
        .catch(function(error) {
            console.log("Error occured:", error);
            res.status(400).json(error);
        }).then(function() {
            console.log("Success!")
        });   
    }

    // One day I will include automatic submission to esavods.com
    // This is not that day. 
    // I want more data on what the script can return before I start thinking about parsing out the YT ID.

    res.status(200).json("OK");
}

var buttonInhibitor = {};
function bigredbutton(req, res) {
    var pressData = req.body;
    if (config.sharedkey != undefined && pressData.key !== config.get("sharedkey")) {
        console.log("Wrong key for bigredbutton");
        res.status(403).json("Wrong Key");
        return;
    }
    delete pressData.key;

    var speedcontrol = new SpeedControl(config.get('speedcontrol'));

    let id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1) {
        console.log("bigredbutton was sent a bad Id.");
        return res.status(403).json({
            message: "Bad Id.",
            id: req.params.id
        });
    }

    if (buttonInhibitor[id] == true) {
        console.log("bigredbutton was sent presses too fast for a single button. Slow down!");
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
        if (timers.length === 1) {
            id = 1;
        }
            
        if (id > timers.length) {
            console.log("bigredbutton: Player does not exits in this run.");
            return res.status(403).json({
                message: "Player does not exist in this run.",
                id: id,
                players: timers.length
            });
        }
        console.log(timers);
        console.log(timers[id-1]);
        switch (timers[id-1].status) {
            case "waiting": return speedcontrol.start();
            case "running": return speedcontrol.split(id-1);
            case "finished":
                throw {code: 400, message: "You lazy b*stard. Reset the timer yourself."};
            default: throw {message: "Invalid runner state."};
        }
        
    }).catch(function(e) {
        console.log("Failed to contact SpeedControl.");
        res.status(e.code || 500).json(e.message);
    }).then( function(data) {
        console.log("Successfull call to BigRedButton for id " + id + ".");
        res.json("OK");
    });
}

function unimplemented(req, res) {
    res.json({status: "NOT IMPLEMENTED"});
}

module.exports = {
	getRunData: getRunData,
	bigredbutton: bigredbutton,
	speedcontrol_event: speedcontrol_event,
	unimplemented: unimplemented
}
