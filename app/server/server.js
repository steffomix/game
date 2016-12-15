//


var config = require('./config.js'),
    app = require('express')(),
    server = require('http').Server(app),
    express = require('express'),
    io = require('socket.io')(server);

app.use(express.static(config.server.publicHtml));
server.listen(config.server.port, config.server.host);

exports = module.exports = {
    app: app,
    server: server,
    socket: io
};
