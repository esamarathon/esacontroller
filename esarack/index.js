'use strict';

const Promise = require('promise');
const body_parser = require('body-parser');
//const format = require('string-template');
const http = require('http');

const ESARack = function(config) {
    this.hosts = config.racks;
    this.port = config.port || '8080';
}

ESARack.prototype.call = function(rack, options, body) {
    options.headers = options.headers || {};
    options.host = this.hosts[rack] || 'localhost';
    options.port = this.port;
    options.headers['Content-Type'] = 'application/json';

    console.log({rack: rack, options: options, body: body});

    return new Promise(function (fulfill, reject) {
        var req = http.request(options, function(response) {
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                try {
                var parsed = JSON.parse(body);
                fulfill(parsed);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', (e) => {
            console.log("error", e);
            reject(e);
        });

        if (!!body) {
            req.write(body);
        }
        
        req.end();
    });
};

ESARack.prototype.query = function(rack, path) {
    const options = {
        method: 'GET',
        path: path,
    };
    return this.call(rack, options);
}


ESARack.prototype.command = function(rack, path, params) {
    const options = {
        method: 'POST',
        path: path,
    };

    return this.call(rack, options, JSON.stringify(params));
}

module.exports = ESARack;
