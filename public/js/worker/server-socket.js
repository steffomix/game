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


define('serverSocket', ['config', 'logger', 'io', 'underscore'],
    function (config, Logger, io, gameSocket, _) {

        var instance,
            logger = Logger.getLogger('serverSocket');
        logger.setLevel(config.logger.serverSocket || 0);

        return getInstance();

        function getInstance () {
            if ( !instance ) {
                instance = new ServerSocket();
            }
            return instance;
        }

        function ServerSocket () {
            var commands = {
                    'back': {
                        'connect': true
                    }
                },
                modules = {};

            /**
             *
             * @param name
             * @param module
             */
            this.addModule = function (name, module) {
                if ( modules[name] ) {
                    logger.warn('SocketManager addModule: Module "' + name + '" already set.');
                } else {
                    modules[name] = module;
                }
            };

            this.connect = function (host, port) {
                var uri = (host || config.server.host) + ':' + (port || config.server.port);

                logger.trace('connect: ', uri);
                serverSocket = io.connect(uri);
                serverSocket.on('updateGameCommands', function (commands) {
                    updateGameCommands(commands);
                });
                serverSocket.on('newConnection', function (commands) {
                    updateGameCommands(commands);
                    gameSocket.send('input.onConnect');
                });
            };


            function updateGameCommands (data) {
                logger.trace('Update Game Commands', data);
                commands = data;
            }


        }


    });