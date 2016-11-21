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


define('socketBackend', ['logger', 'underscore', 'io'], function (Logger, _, io) {

    // Logger.setHandler(Logger.createDefaultHandler({defaultLevel: Logger.DEBUG}));
    // Logger.setLevel(Logger.DEBUG);
    var instance,
        logger = Logger.get('Socket Backend');

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

        var manager,
            config,
            socket;

        this.init = init;

        function init (mng, conf) {
            manager = mng;
            config = conf;
        }

        this.connect = function (data) {
            logger.debug('connect: ' + data);
            var host = data.host || config.server.host,
                port = data.port || config.server.port;

            var sock = io.connect(host + ':' + port);
            //if ( sock.connected ) {
                socket = sock;
                sock.on('updateGameCommands', function(commands){
                    manager.updateGameCommands(commands);
                });
                sock.on('newConnection', function(commands){
                    manager.updateGameCommands(commands);
                    manager.manage('front.login', host, port);
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
                    ioLogger.debug('Response Login success: ', data.user);

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

            ioLogger.debug('Request User Login:', name);
            con.emit('login', {name: name, pass: pass});
        }

        function logout () {

        }

    }


});