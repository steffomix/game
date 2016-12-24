/**
 * Created by stefan on 04.12.16.
 */

var config = require('./config'),
    _ = require('underscore'),
    db = require('./db'),
    dispatcher = require('./event-dispatcher'),
    Tick = require('./tick'),
    Player = require('./player');

exports = module.exports = new SocketManager();

var ticker = new Tick(dispatcher.global.emitGameState.trigger);
ticker.start();

function SocketManager() {
    var self = this,
        connections = {},
        logins = {};

    /**
     * connect
     */
    dispatcher.io.connect(function (socket) {
        try{
            connections[socket.id] = new Player(socket);
        }catch(e){
            console.warn('Connect Player failed', socket);
        }
    });

    /**
     * disconnect
     */
    dispatcher.player.disconnect(function (player) {
        try {
            var name = player.user.name;
            player.socket.removeAllListeners();
            delete connections[player.socket.id];
            if(logins[name]){
                delete logins[name];
                // broadcast only when user has logged in
                name && broadcastMessage({
                    cmd: 'userDisconnect',
                    name: name
                });
            }else{
                console.log('Disconnect non logged in user');
            }
            player.socket.disconnect();
        } catch (e) {
            console.warn('Delete Connection failed: ', e);
        }
    });

    /**
     * logout
     */
    dispatcher.player.logout(function(player){
        try{
            var name = player.user.name;
            delete logins[name];
            name && broadcastMessage({
                cmd: 'userLogout',
                name: name
            });
            player.setDown();
            player.socket.emit('logout');
        }catch(e){
            console.warn('Player logout failed ', player);
        }
    });
    /**
     * check if user is already logged in
     * setup player on success
     */
    dispatcher.player.login(function(player){
        try{
            var user = player.user,
                userData = {
                    id: user.id,
                    name: user.name
                },
                name = user.name;

            if(!logins[name]){
                logins[name] = player;
                setTimeout(function(){
                    player.setup();
                }, 0);
                broadcastMessage({
                    cmd: 'userLogin',
                    name: name
                });
                // send success message with collected UserData
                var u = player.user;
                player.socket.emit('login', {
                    success: true,
                    user: userData
                });
            }else{
                player.socket.emit('login', {
                    success: false,
                    user: userData,
                    msg: 'User "' + name + '" already logged in.'
                });
                // remove user from socket
                player.user = {};
            }
        }catch(e){
            console.warn('Player login failed ', player);
        }

    });

    dispatcher.player.chatMessage(function(data){
        chatMessage({
            cmd: 'chatMessage',
            name: data.player.user.name,
            msg: data.msg
        })
    });

    function chatMessage(data){
        _.each(connections, function (player) {
            try {
                player.socket.emit('chatMessage', data);
            } catch (e) {
                console.warn('Emit chatMessage failed. user may be disconnected.', e);
            }
        })
    }

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
                console.warn('Emit broadcastMessage failed. user may be disconnected.', e);
            }
        })
    }
}


