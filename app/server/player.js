/**
 * Created by stefan on 04.12.16.
 */

var _ = require('underscore'),
    db = require('./db'),
    dispatcher = require('./event-dispatcher'),
    Location = require('./player-location');

exports = module.exports = Player;


function Player(socket) {
    var self = this;
    this.socket = socket;
    this.user = {};

    socket.on('login', function (data) {
        console.log('Login: ', data.user);
        self.onLogin(data.user, data.pass);
    });
    socket.on('register', function (data) {
        console.log('Register new User: ', data.user);
        self.onRegister(data.user, data.pass);
    });
    socket.on('disconnect', function () {
        console.log('Disconnect: ', self.user.name);
        this.removeAllListeners();
        dispatcher.player.disconnect.trigger(self);
    });

    /**
     * setup Player onLogin
     */
    this.setup = function () {
        this.location = new Location(this);

        socket.on('logout', function () {
            console.log('Logout: ', self.user.name);
            socket.emit('logout');
            dispatcher.player.logout.trigger(self);
            setDown();
        });
        socket.on('chatMessage', function (data) {
            console.log('Chat ' + self.user.name + ': ' + data);
            dispatcher.player.chatMessage.trigger({
                player: self,
                msg: data
            });
        });
        socket.on('getFloor', function (data) {

        });
        socket.on('gameState', function (data) {
            //console.log('Receive Gamestate', data);
        });

    };

    function setDown() {
        _.each(['logout', 'chatMessage', 'getFloor', 'gameState'], socket.removeAllListeners, socket);
        self.user = {};
    }
}


Player.prototype = {
    onRegister: function (name, pass) {
        var self = this;
        db.Users.find({name: name}, function (err, users) {
            if (err || !users.length) {
                // create user
                db.Users.create({name: name, pass: pass}, function (err, user) {
                    // create world of user
                    if (!err) {
                        db.Worlds.create({user_id: user.id}, function (err, world) {
                            // create location of user
                            db.PlayerLocations.create({
                                user_id: user.id,
                                world_id: world.id,
                                area_id: 1,
                                x: 0,
                                y: 0,
                                z: 0
                            }, function (err, location) {
                                if (!err) {
                                    self.socket.emit('register', {
                                        success: !err,
                                        user: {
                                            id: user.id,
                                            name: user.name,
                                            world_id: location.world_id,
                                            area_id: 1,
                                            x: 0,
                                            y: 0,
                                            z: 0
                                        }
                                    });
                                } else {
                                    self.socket.emit('register', {
                                        success: false,
                                        msg: err
                                    });
                                }

                            })
                        })
                    } else {
                        self.socket.emit('register', {
                            success: false,
                            msg: err
                        });
                    }
                });

            } else {
                self.socket.emit('register', {success: false, msg: 'Username already exists'});
            }
        })

    },

    onLogin: function (name, pass) {
        var self = this,
            so = this.socket;
        this.user = {};

        db.Users.find({name: name}, function (err, user) {
            try {
                if (user.length && user[0].pass == pass) {
                    /**
                     * attach player to connection
                     */
                    self.user = user[0];

                    // collect userData for message
                    var userData = {};
                    _.each([
                        'id',
                        'name'
                    ], function (k) {
                        userData[k] = user[0][k];
                    });


                    dispatcher.player.login.trigger(self);

                } else {
                    /**
                     * login fail
                     */
                    so.emit('login', {
                        success: false,
                        message: ''
                    });
                }
            } catch (e) {
                /**
                 * login error
                 */
                so.emit('login', {
                    success: false,
                    message: e
                });
                // todo Logger
                console.warn('Login User failed: ', e, new Error().stack)
            }
        });
    }
}
