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


define('gameSocket', ['config', 'logger', 'workerMaster', 'underscore'],
    function (config, Logger, WorkerMaster, _) {

        var instance,
            listener = {},
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
            var gameSocket = new WorkerMaster('gameCache', 'GameCache', socketManagerReady, routeMessage),
                modules = {},
                socketReady = false;

            /**
             *
             * @param name
             * @param module
             */
            this.addModule = function (name, module) {
                logger.trace('GameSocket addModule: ' + name);
                if ( listener[name] ) {
                    logger.error('GameSocket: Module' + name + ' already set.');
                } else {
                    modules[name] = module;
                }
            };

            /**
             *
             * @param cmd
             * @param data
             */
            this.send = function (cmd, data) {
                if ( socketReady ) {
                    gameSocket.send(cmd, data);
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
                    gameSocket.request(cmd, data, cb, ct);
                } else {
                    resendMessage(this.request, cmd, data, cb, ct);
                }
            };

            /**
             *
             * @param cmd
             * @param data
             * @param cb
             * @param ct
             */
            this.socket = function (cmd, data, cb, ct) {
                if ( socketReady ) {
                    gameSocket.socket(cmd, data, cb, ct);
                } else {
                    resendMessage(this.socket, cmd, data, cb, ct);
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
                logger.warn('GameSocket not ready yet. Resend Message in 1sec.');
                setTimeout(function (cmd, data, cb, ct) {
                    fn(cmd, data, cb, ct);
                }, 1000, cmd, data, cb, ct);
            }

            /**
             *
             * @param job
             */
            function socketManagerReady (job) {
                socketReady = true;
            }

        }

        /**
         *
         * @param cmd
         * @param data
         */
        function routeMessage (cmd, data) {
            var c = cmd.split('.'),
                c1 = c.shift();
            try {
                if ( modules[c1] ) {
                    var obj = modules[c1],
                        c2 = c.shift(),
                        fn = modules[c1][c2];
                    // isFunction check from underscore
                    if ( !!(fn && fn.constructor && fn.call && fn.apply) ) {
                        fn.apply(obj, data);
                    }
                } else {
                    logger.error('Command "' + cmd + '" not supported');
                }
            } catch (e) {
                logger.error('Route Message "' + cmd + '" throw error:' + e, data);
            }
        }

    });
