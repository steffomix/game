/* 
 * Copyright (C) 16.11.16 Stefan Brinkmann <steffomix@gmail.com>
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


/**
 *
 */
self.require([__slaveModuleID__, 'logger', 'io', 'socketRequest'], function(slave, io, request, response){

    slave.onMessage = function(job){
        var cmd = job.cmd;
        var req = job.request;

        switch (cmd) {

            case 'logout':
                socket.close();
                break;

            case 'login':
            case 'getUserLocation':
                requestHandler[cmd](job);
                break;

            default:
                job.error('cmd ' + cmd + ' not supported');

        }
    }
});

/*
(function () {

    Logger.setHandler(Logger.createDefaultHandler({
        defaultLevel: Logger.DEBUG
    }));
    Logger.setLevel(Logger.DEBUG);
    var ioLogger = Logger.get('GameSocket');

    function Socket(so){
        this.send = function(cmd, data){
            if(!so.disconnected){
                so.send(cmd, data);
            }else{
                ioLogger.error('Socket is disconnected.', new Error().stack);
            }
        };
    }

    var socket; // socket

    __manageRequest__ = function(job) {

        var cmd = job.cmd;
        var req = job.request;

        switch (cmd) {

            case 'logout':
                socket.close();
                break;

            case 'login':
            case 'getUserLocation':
                requestHandler[cmd](job);
                break;

            default:
                job.error('cmd ' + cmd + ' not supported');

        }
    };

    var gameData = (function(){

    })();

    var requestHandler = (function(){


        function login(job) {
            var req = job.request,
                name = req.name,
                pass = req.pass;

            // todo game config io socket, domain and port
            ioLogger.debug('connect to game.com:4343');
            var con = io.connect('game.com:4343');

            con.on('login', function (data) {
                if (data.success === true) {
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

        function getUserLocation(job){
            socket.send
        }

        function generateWorld(x, y){
            var matrix = [];
            for (var iy = 0; iy < y; iy++) {
                matrix[iy] = [];
                for (var ix = 0; ix < x; ix++) {
                    socket.send('update tile', {
                        player: 1,
                        world: 1,
                        type: parseInt(Math.random() * 5),
                        z: 1,
                        x: ix,
                        y: iy,
                        data: {
                            notes: parseInt(Math.random() * 10000)
                        }
                    });
                    matrix[iy][ix] = parseInt(Math.random() * 1.3);
                }
            }
            return matrix;
        }

    })();

    var responseHandler = (function(){

    })();

})();
*/




