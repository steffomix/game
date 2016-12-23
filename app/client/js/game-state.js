/*
 * Copyright (C) 19.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'gameSocket', 'gameRouter'],
    function (config, Logger, socket, router) {

        var instance,
            data = {},
            logger = Logger.getLogger('gameState');
        logger.setLevel(config.logger.gameState || 0);


        function getInstance() {
            if (!instance) {
                instance = gameState();
            }
            return instance;
        }

        function sendState(){
            socket.send('server.sendGameState', data);
        }



        function gameState() {
            var _state = {},
                _received = received(),
                _response = response();

            function received(){
                return {
                    floors: {},
                    locations: {}
                }
            }

            function response(){
                return {

                }
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


            return {
                clearResponse: function(){
                    _response = response();
                },
                clearReceived: function(){
                    _received = received();
                },
                get state(){
                    return _state;
                },
                get received(){
                    return _received;
                },
                get response(){
                    return _response;
                }
            }
        }
        return getInstance();

    });