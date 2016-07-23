'use strict';

const express = require('express');
var app = express();
const body_parser = require('body-parser');
const http = require('http');
const Promise = require('promise');

const exec = require('child_process').exec;
const format = require('string-template');
var config = require('config');
var SpeedControl = require('./speedcontrol');

app.use(body_parser.json());

app.post("/speedcontrol-event", function(req, res) {
    var runData = req.body;
    if (req.get("API-Key") !== config.get("speedcontrol").key) {
        res.status(403).json("Wrong Key");
        console.log("Blocked faulty keydata from SpeedControl. The key was ", req.get("API-key"));
        return;
    }
    //TODO "Massage" run-data into a more convenient format.
    runData = simplify(runData);

    console.log(JSON.stringify(runData));
    if (config.has('youtube') && config.get('youtube.enable')) {
        uploadToYoutube(runData);   
    }

    // One day I will include automatic submission to esavods.com
    // This is not that day. 
    // I want more data on what the script can return before I start thinking about parsing out the YT ID.

    res.status(200).json("OK");
})

var buttonInhibitor = {};
app.post("/bigredbutton/:id", function(req, res) {
    var pressData = req.body;
    if (pressData.key !== config.get("sharedkey")) {
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

const listen_port = config.get('port');
app.listen(listen_port, function() {
    console.log("ESA Controller is listening on port", listen_port, ".")
})

function uploadToYoutube(run) {
    const conf = config.get('youtube');
    const youtube_metadata = {
        title: format(conf.templates.title, run),
        description: format(conf.templates.description, run),
        keywords: format(conf.templates.keywords, run),
        start: Math.floor(run.start-(conf.buffers.beginning || 15)),
        end: Math.floor(run.end+(conf.buffers.end || 15))
    };
    const command = buildCommand(conf.command, conf.parameters, youtube_metadata)
    setTimeout(function() {
        exec(command, function(error, stdout) {
            console.log("Executed command", command);
            if (error) {
                console.log(error)
            } else {
                console.log("with output: ", stdout);
            }
        }); 
    }, conf.delay);
}

function buildCommand(cmd, params, data) {
    params = format(params, data);
    return cmd + " " + params;
}

function simplify(data) {
    data.twitters = data.players.map(function(player) {
        if (player.twitch) {
            return player.twitch.uri || "";
        } else {
            return "";
        }
    });

    data.players = data.players.map(function(player) {
        return player.names.international || "some dude";
    })

    data.playersString = data.players.reduce(function(total, player, i, array) {
        if (i == array.length-1 && array.length > 1) return total + " and " + player;
        if (i > 0) total += ", ";
        return total + player;
    }, "");

    return data;
}


