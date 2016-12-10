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


define('server', ['config', 'logger', 'io', 'workerSlaveSocket', 'workerRouter', 'serverRouter'],
    function (config, Logger, io, socket, workerRouter, serverRouter) {

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

            workerRouter.addModule('server', this, {
                send: function (job) {
                    var cmd = job.data.cmd,
                        data = job.data;
                    send(cmd, data);
                },
                connect: function (job) {
                    connect(job.data.host, job.data.port);
                },
                disconnect: function () {
                    connection.disconnect();
                    logger.warn('Server disconnected by client.');
                },
                login: function (job) {
                    send('login', job.data);
                },
                chatMessage: function(job){
                    send('chatMessage', job.data);
                }
            });

            function send(cmd, data) {
                if (connection && connection.connected) {
                    connection.emit(cmd, data);
                }
            }

            function disconnect() {
                try {
                    connection.disconnect();
                    connection = null;
                    logger.warn('Server disconnected by client.');
                } catch (e) {
                    logger.warn('Server connection disconnect failed: ' + e);
                }
            }

            function connect(host, port) {
                var uri = (host || config.server.host) + ':' + (port || config.server.port);

                logger.info('connect: ', uri);
                connection = io.connect(uri);

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
                })

                connection.on('onUpdateFloor', function(data){
                    logger.info('Servdr: onUpdateFloor', data);
                    socket.send('game.onUpdateFloor', data);
                });

                connection.on('command', function (data) {
                    logger.info('onCommand', data);
                    serverRouter.command(data.cmd, data.data);
                })
            }

        }
    });