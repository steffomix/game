/* 
 * Copyright (C) 20.11.16 Stefan Brinkmann <steffomix@gmail.com>
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


define('gameSocket', ['config', 'logger', 'workerMaster', 'commandRouter'],
    function (config, Logger, WorkerMaster, CommandRouter) {

        var instance,
            commandWhiteList = {
                'server.connect': true,
                'server.login': true
            },
            logger = Logger.getLogger('gameSocket');

        logger.setLevel(config.logger.gameSocket || 0);

        return getInstance();

        function getInstance () {
            if ( !instance ) {
                instance = new GameSocket();
            }
            return instance;
        }

        /**
         *
         * @constructor
         */
        function GameSocket () {
            var socket,
                socketReady = false,
                router = new CommandRouter('GameSocket', commandWhiteList),
                socketMaster = new WorkerMaster(
                    // initial script
                    'gameCache',
                    // human readable name
                    'WorkerManager',
                    // worker ready to rumble callback
                    function (sock) {
                        socket = sock;
                        socketReady = true;
                    },
                    // onMessage callback
                    router.route
                );

            this.addModule = router.addModule;
            this.route = router.route;

            /**
             *
             * @param cmd
             * @param data
             */
            this.send = function (cmd, data) {
                if ( socketReady ) {
                    socket.send(cmd, data);
                } else {
                    resendMessage(this.send, cmd, data);
                }
            };

            /**
             *
             * @param cmd
             * @param data
             * @param cb
             * @param ct
             */
            this.request = function (cmd, data, cb, ct) {
                if ( socketReady ) {
                    socket.request(cmd, data, cb, ct);
                } else {
                    resendMessage(this.request, cmd, data, cb, ct);
                }
            };

            /**
             * Send a Message as normal.
             * The Job received from Worker is a socket to the Main-thread.
             * The response Job from the Worker to the Main thread is the other side of the socket.
             *
             * @param cmd
             * @param data
             * @param cb
             * @param ct
             */
            this.socket = function (cmd, data, cb, ct) {
                if ( socketReady ) {
                    socketMaster.socket(cmd, data, cb, ct);
                } else {
                    resendMessage(socket, cmd, data, cb, ct);
                }
            };

            /**
             *
             * @param fn
             * @param cmd
             * @param data
             * @param cb
             * @param ct
             */
            function resendMessage (fn, cmd, data, cb, ct) {
                logger.warn('GameSocket not ready yet. Resend Command in 1sec.: ', cmd, data);
                setTimeout(function (cmd, data, cb, ct) {
                    if ( socketReady ) {
                        logger.info('Resend Command from unready gameSocket: ', cmd, data);
                        fn(cmd, data, cb, ct);
                    } else {
                        resendMessage(cmd, data, cb, ct);
                    }

                }, 1000, cmd, data, cb, ct);
            }

        }
    });
