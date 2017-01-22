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


define('server', ['config', 'logger', 'workerApp', 'io', 'gameEvents'],
    function (config, Logger, gameApp, io, events) {

        var connection,
            instance,
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

            events.server.send(send);
            events.server.connect(connect);
            events.server.disconnect(disconnect);

            events.server.login(function (data) {
                console.log('login', data);
                send('login', data);
            });

            events.server.logout(function () {
                send('logout');
            });

            events.server.register(function (data) {
                send('register', data);
            });

            events.server.chatMessage(function (data) {
                send('chatMessage', data);
            });

            connect();
        }

        function connect() {
            disconnect();
            connection = io();
            setupListener();
        }

        function disconnect() {
            try {
                connection.disconnect();
                connection = null;
            } catch (e) {
                //logger.warn('Server disconnected by client.', e);
            }
        }

        function send(cmd, data) {
            if (connection && connection.connected) {
                connection.emit(cmd, data);
            }
        }

        /**
         * setup handler for incoming messages
         */
        function setupListener() {

            connection.on('connect', function () {
                logger.info('Server: onConnect');
                gameApp.send(events.server.connect);
                //socket.send('interfaceConnect.connect');
            });
            connection.on('disconnect', function () {
                logger.info('Server: onDisconnect');
                gameApp.send(events.server.disconnect);
                //socket.send('interfaceConnect.disconnect');
            });

            connection.on('register', function (data) {
                logger.info('Server: onRegister', data);
                gameApp.send(events.server.register);
                //socket.send('interfaceLogin.register', data);
            });

            connection.on('login', function (data) {
                logger.info('Server: onLogin', data);
                gameApp.send(events.server.login, data);
                //socket.send('interfaceLogin.login', data);
            });

            connection.on('logout', function (data) {
                logger.info('Server: Logout by Server', data);
                gameApp.send(events.server.logout);
                //socket.send('interfaceLogin.logout', data || {});
            });

            connection.on('broadcastMessage', function (data) {
                var cmd = data.cmd;
                logger.info('Server: broadcastMessage', data);

                gameApp.send(events.server.broadcastMessage, data);
                /*
                 socket.send('interfaceChat.broadcastMessage', {
                 context: cmd,
                 name: data.name,
                 msg: data.msg || ''
                 });
                 */
            });

            connection.on('chatMessage', function (data) {
                logger.info('Server: chatMessage', data);
                gameApp(events.server.chatMessage, data);
                //socket.send('interfaceChat.chatMessage', data);
            });


        }
    });