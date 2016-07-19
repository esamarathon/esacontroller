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

app.post("/bigredbutton/:id", function(req, res) {
    var pressData = req.body;
    var speedcontrol = new SpeedControl(config.get('speedcontrol'));

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(403).json({
            message: "Bad Id.",
            id: req.params.id
        });
    }

    speedcontrol.timers().then(function(data) {
        console.log(data);
        return speedcontrol.split(id);
    }).then( function() {
            res.status(501).json({
                message: "NOT IMPLEMETED YET.",
                id: id
            })
        }
    );

    
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
    exec(command, function(error, stdout) {
        console.log("Executed command", command);
        if (error) {
            console.log(error)
        } else {
            console.log("with output: ", stdout);
        }
    });
}

function buildCommand(cmd, params, data) {
    params = format(params, data);
    return cmd + " " + params;
}

function simplify(data) {
    data.twitters = data.players.map(function(player) {
        return player.twitch.uri || "";
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


