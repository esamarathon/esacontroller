const express = require('express');
const body_parser = require('body-parser');
const logic = require('./logic.js');

var app = express.Router();

app.use(body_parser.json());

module.exports = app;
