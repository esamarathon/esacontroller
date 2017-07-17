const exec = require('child_process').exec;
const format = require('string-template');
var config = require('config');

/***
    Split out to separate Youtube package later
***/
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
    }, conf.delay || 0);
}

/***
    Split out to separate Youtube package later
***/
function buildCommand(cmd, params, data) {
    params = format(params, data);
    return cmd + " " + params;
}

/***
    Split out to separate Youtube package later
***/
function simplify(data) {
    if (typeof(data.players) === 'undefined') return data;

    const concat = function(join, final) {
        return function(total, part, i, array) {
            if (i == array.length-1 && array.length > 1) return total + final + part;
            if (i > 0) total += join;
            return total + part;
        }
    }
    
    data.twitches = data.players.map(function(player) {
        if (player.twitch) {
            return {twitch: player.twitch.uri || "",
                    name:   player.names.international
                   };
        } else {
            return "";
        }
    }).filter(function(player) {
        if (player.twitch === "") {
            return false;
        }
        return true;
    }).map(function(player) {
        return player.name + " " + player.twitch;
    }).reduce(concat("\\n", "\\n"), "");
    
    data.players = data.players.map(function(player) {
        return player.names.international || "some dude";
    })
    data.playersString = data.players.reduce(concat(", ", " and "), "");

    return data;
}

module.exports = {
    uploadToYoutube: uploadToYoutube,
    buildCommand: buildCommand,
    simplify: simplify
}
