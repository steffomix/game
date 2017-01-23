//
var config = require('./config.js'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

app.use(express.static(config.server.staticHtml));
console.log('Server running on ' + config.server.ip + ':' + config.server.port);
server.listen(config.server.port, config.server.ip);

exports = module.exports = {
    app: app,
    server: server,
    socket: io
};
