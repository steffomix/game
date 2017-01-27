var playerPool = require('./player-pool'),
    db = require('./db'),
    User = require('./model/model-user'),
    Message = require('./message');

module.exports = Connection;


function Connection(connection) {

    /**
     * @type {Player}
     */
    var player = false;

    /**
     * @type {boolean}
     */
    var bruteLock = false;


    /**
     * called from ConnectionPool
     * connection is already disconnected when this function is called
     */
    this.onDisconnect = function () {
        player && playerPool.removePlayer(player);
    };


    this.onStorage = function () {
        player && player.onStorage();
    };

    function login(e) {
        var msg = new Message(connection),
            data = msg.parse(e);
        if (!data) {
            return;
        }

        try {
            if (!bruteLock && !player && data.user && data.pass) {
                // check login
                db.login(data.user, data.pass, function (user) {
                    if (user) {
                        // try to add player to game
                        player = playerPool.addPlayer(user, connection);
                        if (player) {
                            // login success, player is in game
                            msg.create({
                                success: true,
                                user: {
                                    name: user.name
                                }
                            })
                                .emit('login');
                            // activate player
                            player.initialize();
                        } else {
                            // user is already in game
                            msg.emit('login', {success: false, msg: 'User already in Game.'});
                        }
                    } else {
                        // login data wrong
                        msg.emit('login', {success: false, msg: ''});
                    }
                })
            }

            // lock for 3 sec. to prevent brute force
            // client should do also
            bruteLock = true;
            setTimeout(function () {
                bruteLock = false;
            }, 3000);

        } catch (e) {
            console.error('Connection.onLogin', data);
        }
    }

    /**
     * login
     */
    connection.on('login', login);

    connection.on('logout', function () {
        player.onStorage();
        playerPool.logoutPlayer(player);
        player = null;
    });

    connection.on('register', function (data) {
        if (!data.d) {
            return;
        }
        try {
            var usr = data.d.usr,
                pwd = data.d.pwd;
            if (usr && pwd) {
                model = User({name: usr, pwd: pwd});
                model.create(function (user) {
                    if (user) {
                        login({d: model, t: new Date().getTime()});

                    }
                })
            }

        } catch (e) {
            console.error()
        }
    })

}

