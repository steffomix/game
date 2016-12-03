#!/usr/bin/env node

var config = require('./config.js'),
    httpServer = require('./http-server').httpServer,
    server = require('socket.io')(httpServer),
    orm = require('./db/orm'),
    game = require('./game');

var Ev = require('events').EventEmitter

var e = new Ev();

e.addListener('test', function(a, b, c){

});

e.emit('test', 1,4,8);


// create Database if not exists and start server
// @todo hash password, remove login bypass
orm.connect(config.server.db, function (db) {
    // accept connections
    server.sockets.on('connection', function (connection) {

        console.log('New Connection ID ' + connection.id);
        connection.on('login', function (data) {

            orm.Users.find({name: data.user}, function (err, user) {
                try {
                    // check password
                    var p1 = data.pass,
                        p2 = user[0].password;

                    if (user.length && user[0].pass == data.pass) {
                        connection.removeAllListeners();

                        // collect userData
                        var userData = {};
                        ['id', 'name'].forEach(function (k) {
                            userData[k] = user[0][k];
                        });

                        // try to add user to game
                        var rejectMessage = game.onPlayerConnect(connection, userData);

                        // todo on login check for ban etc...
                        if (!rejectMessage) {
                            // send message
                            connection.emit('login', {
                                success: true,
                                user: userData
                            });
                        } else {
                            connection.emit('login', {
                                success: false,
                                message: rejectMessage
                            });
                        }

                        // send success message with collected UserData
                        connection.emit('login', {
                            success: true,
                            user: userData
                        });
                    } else {

                        connection.emit('login', {
                            success: false,
                            message: 'login failed'
                        });
                    }

                }catch(e){
                    connection.emit('login', {
                        success: false,
                        message: 'login failed'
                    });
                    // todo Logger
                    console.warn('Login User failed: ', e, new Error().stack)
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




