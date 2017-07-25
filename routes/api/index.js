const express = require('express');
const body_parser = require('body-parser');
const logic = require('./logic.js');

var app = express.Router();

app.use(body_parser.json());

app.post("/speedcontrol-event", logic.speedcontrol_event);

app.get("/bigredbutton/:id", logic.unimplemented);

app.post("/bigredbutton/:id", logic.bigredbutton);



module.exports = app;
