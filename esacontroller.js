'use strict';

const express = require('express');
var config = require('config');

var app = express();

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use("/api", require("./routes/api"));
app.use("/static", express.static(__dirname + '/static'));
app.use("/", require("./routes/gui"));



const listen_port = config.port || 3333;
app.listen(listen_port, function() {
	console.log(config);
    console.log("ESA Controller is listening on port", listen_port, ".")
})


