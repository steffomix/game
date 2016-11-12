#!/usr/bin/env node

var config = require('../conf/game.conf'),
    http = require('http').createServer(),
    server = require('socket.io').listen(http),
    orm = require('../db/orm'),
    game = require('../game/game'),
    debug = require('debug')('game-server.js:io');

http.listen(config.server.port);

orm.connect(config.server.db, function(db){
    server.sockets.on('connection', function (connection) {
        console.log('connect');
        connection.on('login', function (data) {
            var name = data.name || 'guest';
            var pass = data.pass || '';
            if (name === login.name && pass === login.pass) {
                connection.removeAllListeners();
                game.onPlayerConnect(connection, data.name);
            } else {
                connection.emit('login', {
                    success: false,
                    message: 'login failed'
                });
                connection.disconnect();
            }
        })
    });
    game.start(server, db);
});





