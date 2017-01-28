var playerPool = require('./player-pool'),
    modelUser = require('./model/model-user'),
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
        if(player) {
            player.onStorage();
            playerPool.removePlayer(player);
        }
        return player;
    };

    this.getPlayer = function(){
        return player;
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
            if (!bruteLock && !player && data.user && data.pwd) {
                // check login
                modelUser.login(data.user, data.pwd, function (user) {
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
            console.error('Connection.onLogin', e, data);
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
        var data = new Message().parse(data);
        try {
            var name = data.name,
                pwd = data.pwd;
            if (name && pwd) {
                modelUser.register(name, pwd, function(user){
                    var msg;
                    if(user){
                        msg = {success: true};
                    }else{
                        msg = {success: false, msg: 'Name already in Use'};
                    }
                    new Message(connection).create(msg).emit('register');
                });
            }
        } catch (e) {
            console.error()
        }
    })

}

