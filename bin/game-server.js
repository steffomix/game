#!/usr/bin/env node


var config = require('../conf/game.conf'),
    http = require('http').createServer(),
    server = require('socket.io').listen(http),
    orm = require('../db/orm'),
    game = require('../game/game'),
    debug = require('debug')('game-server.js:io');

http.listen(config.server.port);

// create Database if not exists and start server
// @todo hash password, remove login bypass
orm.connect(config.server.db, function (db) {
    // accept connections
    server.sockets.on('connection', function (connection) {

        console.log('New Connection ID ' + connection.id);
        connection.on('login', function (data) {

            return bypassLogin(connection, data.name);

            orm.Users.find({name: data.name}, function (err, user) {
                var p1 = data.pass,
                    p2 = user[0].pass;
                if (user.length && user[0].pass == data.pass) {
                    connection.removeAllListeners();
                    game.onPlayerConnect(connection, user[0]);
                } else {
                    connection.emit('login', {
                        success: false,
                        message: 'login failed'
                    });
                    connection.disconnect();
                }
            });
        })
    });
    game.start(server, db);
});


function bypassLogin(connection, name) {

    function login(user) {
        game.onPlayerConnect(connection, user);
        connection.emit('login', {
            success: true
        });
    }

    orm.Users.find({name: name}, function (err, rows) {
        if (!rows.length) {
            orm.Users.create({
                    name: name,
                    pass: name
                },
                function (err, newUser) {
                    login(newUser);
                })
        } else {
            login(rows[0]);
        }
    })
}




