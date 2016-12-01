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


define('server', ['config', 'logger', 'io', 'workerSlaveSocket', 'workerRouter', 'serverRouter', 'underscore'],
    function (config, Logger, io, socket, workerRouter, serverRouter, _) {

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
            var connection;

            workerRouter.addModule('server', this, {
                send: function(job){
                    var cmd = job.data.cmd,
                        data = job.data;
                    send(cmd, data);
                },
                connect: function(job){
                    connect(job.data.host, job.data.port, job.data.callback);
                },
                disconnect: disconnect,
                login: function(job){
                    send('login', job.data);
                }
            });

            function send(cmd, data){
                if(connection && connection.connected){
                    connection.emit(cmd, data);
                }
            }

            function disconnect(){
                try{
                    connection.disconnect();
                    connenction = null;
                }catch(e){
                    logger.warn('Server connection disconnect failed: ' + e);
                }
            }

            function connect(host, port, callback) {
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

                connection.on('login', function(data){
                    logger.info('Server: onLogin', data);
                    socket.send('interfaceLogin.login', data);
                })

                connection.on('command', function(data){
                    logger.info('onCommand', data);
                    serverRouter.route(data.cmd, data.data);
                })
            }

        }
    });