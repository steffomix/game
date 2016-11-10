#!/usr/bin/env node

var config = require('../conf/game.conf'),
    http = require('http').createServer(),
    server = require('socket.io').listen(http),
    Socket = require('../game/socket').Socket,
    game = require('../game/game'),
    debug = require('debug')('game-server.js:io');

http.listen(config.server.port);

// login pass from database for only one try
var login = {
    name: '123',
    pass: '123'
};

server.sockets.on('connection', function (connection) {
    console.log('connect');
    connection.on('login', function (data) {
        var name = data.name || 'guest';
        var pass = data.pass || '';
        if(name === login.name && pass === login.pass){
            connection.removeAllListeners();
            connection.emit('login', {
                success: true
            });
            new Socket(connection, server, game);
        }else{
            connection.emit('login', {
                success: false
            });
            connection.disconnect();
        }
        // always delete login pass
        login = {};
    })
});