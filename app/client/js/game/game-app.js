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

define(['config', 'logger', 'gameSocket', 'gameRouter', 'gameState', 'backbone', 'underscore', 'tick', 'eventDispatcher', 'interfaceApp', 'gamePixi', 'gameFloorManager', 'gamePlayerManager'],
    function (config, Logger, socket, router, gameState, Backbone, _, Tick, dispatcher, App, gamePixi, floorManager, playerManager) {

        var logger = Logger.getLogger('gameApp');
        logger.setLevel(config.logger.gameApp || 0);

        var serverTicker = new Tick(tick); // low frequency ticker for network only
        serverTicker.fps = config.server.fps;

        /**
         * init listener and dispatcher
         */
        dispatcher.server.login(function (user) {
            playerManager.addMainPlayer(user);
            serverTicker.start();
        });
        dispatcher.server.logout(function(){
            serverTicker.stop();
            playerManager.reset();
        });

        /**
         * link to router
         */
        router.addModule('game', this, {
            updateFloor: function (job) {
                floorManager.updateFloor(job.data);
            },
            // receive locations from all players on current floor
            playerLocations: function (job) {
                playerManager.playerLocations(job.data);
                gamePixi.setPlayerPosition(playerManager.mainPlayer.location)
            }
        });

        function tick(){
            dispatcher.server.tick.trigger(gameState);
            socket.send('server.sendGameState', gameState);
        }

        return new (Backbone.View.extend(_.extend(new App(), {

            el: $('#game-stage'),
            events: {
                'mousemove #game-stage': 'onMouseMove'
            },
            initialize: function(){

            },
            onMouseMove: function(e){

            }

        })))();



    });