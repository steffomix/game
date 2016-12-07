/**
 * Created by stefan on 04.12.16.
 */

var _ = require('underscore'),
    db = require('./db'),
    dispatcher = require('./event-dispatcher'),
    Player = require('./player');

exports = module.exports = new SocketManager();

function SocketManager() {
    var self = this,
        connections = {};

    /**
     * connect
     */
    dispatcher.io.connect(function (socket) {
        connections[socket.id] = new Player(socket);
    });
    /**
     * disconnect
     */
    dispatcher.player.disconnect(function (player) {
        try {
            var pName = player.user.name;
            delete connections[player.socket.id];
            // broadcast only when user has logged in
            pName && broadcastMessage({
                cmd: 'userDisconnect',
                name: pName
            });
        } catch (e) {
            console.warn('Delete Connection: ', e);
        }
    });
    /**
     * logout
     */
    dispatcher.player.logout(function(player){
        broadcastMessage({
            cmd: 'userLogout',
            name: player.user.name
        });
    });
    /**
     * login
     */
    dispatcher.player.login(function(player){
        broadcastMessage({
            cmd: 'userLogin',
            name: player.user.name
        });
    });

    /**
     * broadcast message
     *
     * @param data {object} {cmd: string, ...}
     */
    function broadcastMessage(data) {
        _.each(connections, function (player) {
            try {
                player.socket.emit('broadcastMessage', data);
            } catch (e) {
                console.warn('Emit broadcastMessage userDisconnected', e);
            }
        })
    }
}


