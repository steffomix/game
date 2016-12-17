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
        self.onLogin(data.user, data.pass);
    });
    socket.on('register', function(data){
        self.onRegister(data.user, data.pass);
    });
    socket.on('disconnect', function () {
        this.removeAllListeners();
        dispatcher.player.disconnect.trigger(self);
    });

    /**
     * setup Player onLogin
     */
    this.setup = function(){
        this.location = new Location(this);

        socket.on('getFloor', function(data){

        });

        socket.on('chatMessage', function(data){
            dispatcher.player.chatMessage.trigger({
                player: self,
                msg: data
            });
        });
        socket.on('logout', function () {
            dispatcher.player.logout.trigger(self);
        });

    };

    this.setDown = function(){
        socket.removeAllListeners('chatMessage');
        socket.removeAllListeners('logout');
        self.user = {};
    }
}


Player.prototype = {
    sendUserLocation: function(){
        var lc = this.location;
        this.socket.emit('userLocation', {
            user: {
                id: this.user.id,
                name: this.user.name
            },
            location: {
                area_id: lc.area_id,
                world_id: lc.world_id,
                x: lc.x,
                y: lc.y,
                z: lc.z
            }

        });
    },
    onRegister: function(name, pass){
        var self = this;
        db.Users.find({name: name}, function(err, users){
            if(err || !users.length){
                db.Users.create({name: name, pass: pass}, function(err, user){
                    self.socket.emit('register', {success: !err});
                });
            }else{
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

};
