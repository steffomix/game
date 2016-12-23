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

define(['config', 'logger', 'gameSocket', 'gameRouter', 'gameState', 'backbone', 'underscore', 'tick', 'eventDispatcher', 'interfaceApp', 'playerManager'],
    function (config, Logger, socket, gameState, gameRouter, Backbone, _, Tick, dispatcher, App, playerManager) {

        var instance,
            logger = Logger.getLogger('gameApp');
        logger.setLevel(config.logger.gameApp || 0);

        var serverTicker = new Tick(serverTick), // low frequency ticker for network only
            gameTicker = new Tick(frameTick); // high frequency ticker for render and animation transitions
        serverTicker.fps = config.server.fps;
        gameTicker.fps = config.game.fps;

        /**
         * init listener and dispatcher
         */
        dispatcher.server.connect(function(){
            gameTicker.start();
        });
        dispatcher.server.login(function (user) {
            gameState.state.player = playerManager.addPlayer(user);
            serverTicker.start();
        });
        dispatcher.server.logout(function(){
            serverTicker.stop();
            playerManager.reset();
        });

        new (Backbone.View.extend(_.extend(new App(), {

            el: $('#game-stage'),
            events: {
                'mousemove #game-stage': 'onMouseMove'
            },
            initialize: function(){

            },
            onMouseMove: function(e){

            }

        })))();

        function serverTick(){
            gameState.clearResponse();
            dispatcher.server.tick.trigger(gameState.received);
            socket.send('server.sendGameState', gameState.response);
        }

        function frameTick(){
            dispatcher.game.tick.trigger()
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


        function getInstance() {
            if (!instance) {
                instance = gameState();
            }
            return instance;
        }
        return getInstance();


    });