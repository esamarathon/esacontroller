'use strict';

const Promise = require('promise');
const body_parser = require('body-parser');
const format = require('string-template');
const http = require('http');

/*const http = require('http-debug').http
http.debug = 2;*/


const SpeedControl = function(config) {
	this.host = config.host || 'speedcontrol.esamarathon.com';
	this.port = config.port || '9090'
}

SpeedControl.prototype.call = function(options) {
    options.headers = options.headers || {};
    options.host = this.host;
    options.port = this.port;
    options.headers['Content-Type'] = 'application/json';

    return new Promise(function (fulfill, reject) {
        var req = http.request(options, function(response) {
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                var parsed = JSON.parse(body);
                fulfill(parsed);
            });
        });
        req.on('error', (e) => {
            console.log("error", e);
            reject(e);
        });
        req.end();
    });
};

SpeedControl.prototype.query = function(path) {
    const options = {
        method: 'GET',
        path: path,
    };
    return this.call(options);
}


SpeedControl.prototype.command = function(path, params) {
    const options = {
        method: 'PUT',
        path: path,
        body: JSON.stringify(params)
    };

    return this.call(options);
}

SpeedControl.prototype.timers = function(first_argument) {
    return this.query("/speedcontrol/timers")
};

SpeedControl.prototype.start = function() {
	return this.command("/speedcontrol/timer/start", {});
};

SpeedControl.prototype.split = function(id) {
    return this.command("/speedcontrol/timer/" + id + "/split", {})
}

SpeedControl.prototype.reset = function() {
    return this.command("/speedcontrol/timer/reset", {})
}


module.exports = SpeedControl;
