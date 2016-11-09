/* 
 * Copyright (C) 09.11.16 Stefan Brinkmann <steffomix@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');

var config = require('config');

// This line is from the Node.js HTTPS documentation.
var options = {
    key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
    cert: fs.readFileSync('test/fixtures/keys/agent2-cert.cert')
};

// Create a service (the app object is just a callback).
var app = express();

// Create an HTTP service.
http.createServer(app).listen(81);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);
