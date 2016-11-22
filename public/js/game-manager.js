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


define('gameManager',
    ['config', 'logger', 'workerMaster', 'jquery', 'gameLayer', 'hudLayer', 'inputLayer', 'dialogLayer'],
    function (config, Logger, WorkerMaster, $, gameLayer, hudLayer, inputLayer, dialogLayer) {

        var instance,
            layer = {
                game: gameLayer,
                hud: hudLayer,
                input: inputLayer,
                dialog: dialogLayer
            },
            logger = Logger.getLogger('gameManager').setLevel(config.logger.gameManager || 0);

        /**
         * GameManager
         * @constructor
         */
        function GameManager () {

            var gameSocket = new WorkerMaster('socketManager', 'GameSocket', socketManagerReady, onSocketMessage);
            gameLayer.init(this);
            hudLayer.init(this);
            inputLayer.init(this);
            dialogLayer.init(this);

            /**
             * send message through gameSocket to worker
             */
            this.socketSend = gameSocket.send;
            this.socketRequest = gameSocket.request;
            this.socketCreate = gameSocket.socket;

            function socketManagerReady (job) {
                logger.trace('SocketManager ready', job);
                connect();
            }

            this.connect = function() {

                $('.window, .input, .hud, .game').each(function (e) {
                    $(this).hide();
                });
                $('#window-connect, #game-container').show();

            }

            function onSocketMessage (cmd, data) {
                var c = cmd.split('.'),
                    c1 = c.shift();
                try {
                    switch (c1) {
                        case 'game':
                        case 'hud':
                        case 'input':
                        case 'dialog':
                            var c2 = c.shift();
                            if ( layer[c1][c2] ) {
                                layer[c1][c2].apply(gameLayer[c1][c2], [c.join('.')].concat(data));
                            } else {
                                logger.error('Command ' + cmd + ' not supported');
                            }
                            break;

                        default:
                            logger.error('Command ' + cmd + ' not supported');
                    }
                } catch (e) {
                    logger.trace('Forward Message to screen "' + cmd + '" failed: ', e, data);
                }
            }


        }


        function getInstance () {
            if ( !instance ) {
                instance = new GameManager();

            }
            return instance;
        }

        return getInstance();
    });


