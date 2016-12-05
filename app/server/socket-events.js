/**
 * Created by stefan on 04.12.16.
 */

var dispatcher = require('./event-dispatcher'),
    Player = require('./player'),
    manager,
    db;

dispatcher.global.appInit.once(function (core) {
    db = core.db;
    manager = new Manager();
});

Connection.prototype = {

    disconnect: function () {
        dispatcher.socket.disconnect.trigger(this);
    },

    login: function (io, name, pass) {
        db.Users.find({name: name}, function (err, user) {
            try {

                if (user.length && user[0].pass == pass) {
                    io.removeAllListeners();

                    // collect userData
                    var userData = {};
                    ['id', 'name'].forEach(function (k) {
                        userData[k] = user[0][k];
                    });

                    // send success message with collected UserData
                    io.emit('login', {
                        success: true,
                        user: userData
                    });
                    dispatcher.socket.login.trigger(this);
                } else {

                    io.emit('login', {
                        success: false,
                        message: ''
                    });
                }
            } catch (e) {
                io.emit('login', {
                    success: false,
                    message: e
                });
                // todo Logger
                console.warn('Login User failed: ', e, new Error().stack)
            }
        });
    }

};

function Connection(so, id) {
    var self = this,
        player = new Player(this, db, dispatcher);

    this.so = function () {
        return so;
    };

    this.id = function () {
        return id;
    };

    so.on('login', function (data) {
        self.login(so, data.user, data.pass);
    });

}


function Manager() {
    var self = this,
        nextConnectionId = 0,
        connections = {};

    dispatcher.io.connect(function (so) {
        var id = nextConnectionId++;
        connections[id] = new Connection(so, id);
    });
}


