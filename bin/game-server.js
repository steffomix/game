#!/usr/bin/env node

var config = require('./config');


var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');

// This line is from the Node.js HTTPS documentation.
var options = {
    key: config.ssl.key,
    cert: config.ssl.cert
};

// Create a service (the app object is just a callback).
var app = express();

// Create an HTTP service.
http.createServer(app).listen(81);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);