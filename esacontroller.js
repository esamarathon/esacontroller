'use strict';

const express = require('express');
var config = require('config');


var app = express();
app.use("/api", require("./routes/api"));



const listen_port = config.port || 3333;
app.listen(listen_port, function() {
    console.log("ESA Controller is listening on port", listen_port, ".")
})


