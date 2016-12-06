/**
 * Created by stefan on 04.12.16.
 */

var _ = require('underscore'),
    dispatcher = require('./event-dispatcher'),
    worldManager,
    db;

dispatcher.global.appInit.once(function (core) {
    db = core.db;
    worldManager = core.worldManager;
});

exports = module.exports = Player;

function Player(socket) {
    var self = this;
    self.socket = socket;
    self.user = {};

    this.init = function(){
        worldManager.getWorld(this.user.id);
    };

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

                    // collect userData
                    _.each([
                        'id',
                        'name'
                    ], function (k) {
                        self.user[k] = user[0][k];
                    });

                    // send success message with collected UserData
                    so.emit('login', {
                        success: true,
                        user: self.user
                    });
                    dispatcher.player.login.trigger(self);
                    self.init();

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