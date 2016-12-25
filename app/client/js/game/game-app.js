/*
 * Copyright (C) 17.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'gameSocket', 'gameRouter', 'tick', 'eventDispatcher', 'gamePlayerManager'],
    function (config, Logger, socket, router, Tick, dispatcher, playerManager) {

        var instance,
            logger = Logger.getLogger('gameApp');
        logger.setLevel(config.logger.gameApp || 0);

        function getInstance() {
            if (!instance) {
                instance = new GameApp().game;
            }
            return instance;
        }

        /**
         * Game Data Heartbeat
         * Receive and send server data, update game data.
         * Ticks every 0.5 second
         */
        function GameApp() {
            var self = this,
                _state = {},
                _received = clearReceived(),
                _response = clearResponse(),
                serverTicker = new Tick(serverTick);

            window.game = this.game = {
                get state() {
                    return _state;
                },
                get received() {
                    return _received;
                },
                get response() {
                    return _response;
                }
            };

            serverTicker.fps = config.server.fps;
            dispatcher.server.login(function () {
                serverTicker.start();
            });
            dispatcher.server.logout(function () {
                serverTicker.stop();
            });

            function serverTick() {
                clearResponse();
                dispatcher.server.tick.trigger(self.game);
                //socket.send('server.sendGameState', _response);
            }

            router.addModule('game', this, {
                updateFloor: function (job) {
                    _received.floors = job.data;
                },
                // receive locations from all players on current floor
                playerLocations: function (job) {
                    _received.locations = job.data;
                }
            });


            function clearReceived() {
                return {
                    floors: {},
                    locations: {}
                }
            }

            function clearResponse() {
                return {}
            }
        }

        return getInstance();


    });