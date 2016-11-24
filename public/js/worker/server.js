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


define('server', ['config', 'logger', 'io', 'commandRouter', 'workerSocket', 'underscore'],
    function (config, Logger, io, Router, workerSocket, _) {

        var instance,
            logger = Logger.getLogger('server');
        logger.setLevel(config.logger.server || 0);

        return getInstance();

        function getInstance () {
            if ( !instance ) {
                instance = new ServerSocket();
            }
            return instance;
        }

        function ServerSocket () {
            var connection,
                commands = {
                    'back': {
                        'connect': true
                    }
                },
                router = new Router('Server');

            this.addModule = router.addModule;
            this.removeModule = router.removeModule;

            workerSocket.addModule('server', this);

            this.send = function(cmd, data){
                if(connection && connection.connected){
                    connection.send(cmd, data);
                }
            };
            this.connect = function (host, port) {
                var uri = (host || config.server.host) + ':' + (port || config.server.port);

                logger.trace('connect: ', uri);
                connection = io.connect(uri);
                connection.on('updateGameCommands', function (commands) {
                    updateGameCommands(commands);
                });
                connection.on('newConnection', function (commands) {
                    updateGameCommands(commands);
                    socket.send('input.onConnect');
                });
            };



            function updateGameCommands (data) {
                logger.trace('Update Game Commands', data);
                commands = data;
            }


        }


    });