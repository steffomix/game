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


define('socketBackend', ['config', 'socket', 'logger', 'socketManager', 'underscore', 'io'],
    function (config, socket, Logger, socketManager, _, io) {

    var instance,
        socketManager,
        logger = Logger.getLogger('socketBackend');
        logger.setLevel(config.logger.socketBackend || 0);

    return getInstance();

    function getInstance () {
        if ( !instance ) {
            instance = new SocketBackend();
        }
        return instance;
    }

    function SocketBackend () {

        if ( instance ) {
            logger.error('Instance already created');
        }

        this.init = function(manager){
            socketManager = manager;
        };

        this.connect = function (host, port) {
            var host = host || config.server.host,
                port = port || config.server.port,
                uri = host  + ':' +  port;

            logger.trace('connect: ', uri);
            var sock = io.connect(uri);
            //if ( sock.connected ) {
                socket = sock;
                sock.on('updateGameCommands', function(commands){
                    socketManager.updateGameCommands(commands);
                });
                sock.on('newConnection', function(commands){
                    socketManager.updateGameCommands(commands);
                    socketManager.manage('front.login', host, port);
                });
            //}
        };


        this.login = function(name, pass) {
            var req = job.request;
            name = req.name;
            pass = req.pass;

            // todo game config io socket, domain and port


            con.on('login', function (data) {
                if ( data.success === true ) {
                    logger.trace('Response Login success: ', data.user);

                    socket = new Socket(con);
                    con.off('login');

                    job.response({
                            success: true,
                            user: data
                        }
                    );
                } else {
                    loginFailed();
                }
            });

            logger.trace('Request User Login:', name);
            con.emit('login', {name: name, pass: pass});
        }

        function logout () {

        }

    }


});