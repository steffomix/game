var playerPool = require('./player-pool'),
    db = require('./db');

module.exports = Login;


function Login(connection) {

    var player = false,
        bruteLock = false,
        // fake user
        user = {
            name: 'user',
            pass: 'user'
        };


    /**
     * called from ConnectionPool
     * connection is already disconnected when this function is called
     */
    this.onDisconnect = function () {
        playerPool.removePlayer(user.name);
    };

    /**
     * login
     */
    connection.on('login', function (data) {
        data = data.d;

        if (!bruteLock && !player && data.user && data.pass) {
            // check login
            db.login(data.user, data.pass, function(user){
                if(user){
                    // try to add player to game
                    player = playerPool.addPlayer(user, connection);
                    if (player) {
                        // login success, player is in game
                        connection.emit('login', {
                            success: true,
                            user: {
                                name: user.name
                            }
                        });
                        player.initialize();
                    } else {
                        // user is already in game
                        connection.emit('login', {success: false, msg: 'User already in Game.'});
                    }
                } else {
                    // login data wrong
                    connection.emit('login', {success: false, msg: ''});
                }
            })
        }

        // lock for 3 sec. to prevent brute force
        // client should do also
        bruteLock = true;
        setTimeout(function () {
            bruteLock = false;
        }, 3000);

    });

    connection.on('logout', function () {
        player = false;
    })

}

