/*
 * Copyright (C) 17.11.16 Stefan Brinkmann <steffomix@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


define('server', ['config', 'logger', 'io', 'workerSlaveSocket', 'workerRouter'],
    function (config, Logger, io, socket, router) {

        var instance,
            logger = Logger.getLogger('server');
        logger.setLevel(config.logger.server || 0);

        return getInstance();

        function getInstance() {
            if (!instance) {
                instance = new ServerSocket();
            }
            return instance;
        }

        function ServerSocket() {
            var connection;

            router.addModule('server', this, {
                send: function (job) {
                    var cmd = job.data.cmd,
                        data = job.data;
                    send(cmd, data);
                },
                connect: function (job) {
                    connect();
                },
                disconnect: function () {
                    connection.disconnect();
                    logger.warn('Server disconnected by client.');
                },
                login: function (job) {
                    send('login', job.data);
                },
                logout: function(job){
                    send('logout');
                },
                register: function(job){
                    send('register', job.data);
                },
                chatMessage: function(job){
                    send('chatMessage', job.data);
                },
                sendGameState: function(job){
                    send('gameState', job.data);

                }
            });

            function send(cmd, data) {
                if (connection && connection.connected) {
                    connection.emit(cmd, data);
                }
            }

            function disconnect() {
                try{
                    send('logout');
                }catch(e){
                    // ignore
                }
                try {
                    logger.warn('Server disconnected by client.');
                    connection.disconnect();
                    connection = null;
                    socket.send('interfaceConnect.disconnect');
                } catch (e) {
                    // ignore
                }
            }

            function connect() {
                disconnect();
                connection = io();
                setupListener();
            }

            function setupListener(){

                connection.on('connect', function () {
                    logger.info('Server: onConnect');
                    socket.send('interfaceConnect.connect');
                });
                connection.on('disconnect', function () {
                    logger.info('Server: onDisconnect');
                    socket.send('interfaceConnect.disconnect');
                });

                connection.on('login', function (data) {
                    logger.info('Server: onLogin', data);
                    socket.send('interfaceLogin.login', data);
                });

                connection.on('register', function(data){
                    logger.info('Server: onRegister', data);
                    socket.send('interfaceLogin.register', data);
                });

                connection.on('logout', function(data){
                    logger.info('Server: Logout by Server', data);
                    socket.send('interfaceLogin.logout', data || {});
                });

                connection.on('broadcastMessage', function (data) {
                    var cmd = data.cmd;
                    logger.info('Server: broadcastMessage', data);
                    socket.send('interfaceChat.broadcastMessage', {
                        context: cmd,
                        name: data.name,
                        msg: data.msg || ''
                    });
                });

                connection.on('chatMessage', function(data){
                    logger.info('Server: chatMessage', data);
                    socket.send('interfaceChat.chatMessage', data);
                });

                connection.on('onUpdateFloor', function(data){
                    logger.info('Server: onUpdateFloor', data);
                    router.command('cache.onUpdateFloor', data);
                });

                connection.on('onUpdateTile', function(data){
                    logger.info('Server: onUpdateTile', data);
                    router.command('cache.onUpdateTile', data);
                });

                connection.on('playerLocations', function(data){
                    // logger.info('Server: userLocation', data);
                    socket.send('game.playerLocations', data);
                });

                connection.on('command', function (data) {
                    logger.info('Server: onCommand ' + data.cmd, data.data);
                    router.command(data.cmd, data.data);
                });
            }
        }
    });