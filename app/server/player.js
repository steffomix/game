/**
 * Created by stefan on 04.12.16.
 */

var _ = require('underscore'),
    db = require('./db'),
    dispatcher = require('./event-dispatcher'),
    Location = require('./player-location');

exports = module.exports = Player;



function Player(socket) {
    this.socket = socket;
    this.user = {};
    this.location = _.extend(this, new Location());
    var self = this;

    /**
     * Init Player onLogin
     */
    this.initPlayer = function(){
        this.location.initLocation();
    };

    /**
     * called on floor changes or first game enter
     */
    this.onUpdateFloor = function(floor){
        self.socket.emit('onUpdateFloor', {
            x: location.x(),
            y: location.y(),
            floor: location.floor()
        })
    }

    /**
     * Called on tile changes
     */
    this.onTileUpdate = function(){

    }

    socket.on('login', function (data) {
        self.onLogin(data.user, data.pass);
    });
    socket.on('logout', function () {
        dispatcher.player.logout.trigger(self);
        self.playerData = {};
    });
    socket.on('disconnect', function () {
        this.removeAllListeners();
        dispatcher.player.disconnect.trigger(self);
    });
}


Player.prototype = {
    onLogin: function (name, pass) {
        var self = this,
            so = this.socket;
        this.user = {};

        db.Users.find({name: name}, function (err, user) {
            try {
                if (user.length && user[0].pass == pass) {
                    /**
                     * login success
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

                    // send success message with collected UserData
                    so.emit('login', {
                        success: true,
                        user: userData
                    });
                    dispatcher.player.login.trigger(self);
                    self.initPlayer();

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