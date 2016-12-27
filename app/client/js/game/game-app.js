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

        function GameState() {
        }

        GameState.prototype = {
            mainPlayer: ''
        };

        function Received() {
            this.floors = [];
            this.mobiles = [];
        }


        function Response() {

        }

        /**
         * Game Data Heartbeat
         * Receive and send server data, update game data.
         * Ticks every 0.5 second
         */
        function GameApp() {
            var _state = new GameState(),
                _received = new Received(),
                _response = new Response(),
                serverTicker = new Tick(serverTick),
                trigger = dispatcher.server.tick.claimTrigger(this),
                game = {
                    get state() {
                        // current gameState
                        return _state;
                    },
                    get received() {
                        // data received from server
                        // is cleared (recreated) after each serverTick
                        return _received;
                    },
                    get response() {
                        // data to be send to server
                        // is leared after each serverTick
                        return _response;
                    }
                };

            this.gameState = function(){
                return game;
            };

            serverTicker.fps = config.server.fps;
            dispatcher.server.login(function () {
                serverTicker.start();
            });
            dispatcher.server.logout(function () {
                serverTicker.stop();
            });

            function serverTick() {
                // broadcast and collect server data
                trigger(game);
                _received = new Received();

                socket.send('server.sendGameState', _response);
                _response = new Response();
            }

            router.addModule('game', this, {
                updateFloor: function (job) {
                    _received.floors.push(job.data);
                },
                // receive locations from all players on current floor
                playerLocations: function (job) {
                    _.each(job.data, function (v, k) {
                        _received.mobiles[k] = v;
                    });
                }
            });
        }

        return getInstance();

        function getInstance() {
            if (!instance) {
                instance = new GameApp();
            }
            return instance;
        }


    });