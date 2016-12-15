//


    var config = require('./config.js'),
        express = require('express'),
        app = express(),
        server = require('http').Server(app),
        io = require('socket.io')(server);

    app.use(express.static(config.server.publicHtml));
    server.listen(config.server.port);

exports = module.exports = {
    app: app,
    server: server,
    socket: io
};
