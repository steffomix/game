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

define(['config', 'logger', 'gameSocket', 'gameRouter', 'backbone', 'underscore', 'gameTick', 'eventDispatcher', 'gameFloorManager', 'gamePlayerManager'],
    function (config, Logger, socket, router, Backbone, _, GameTick, dispatcher, floorManager, playerManager) {

        var logger = Logger.getLogger('gameApp');
        logger.setLevel(config.logger.gameApp || 0);

        var gameState = {},
            serverTicker = new GameTick(collectGameState); // low frequency ticker for network only

        /**
         * init listener and dispatcher
         */
        dispatcher.server.login(function (user) {
            playerManager.addMainPlayer(user);
            serverTicker.fps = config.server.fps;
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
            }
        });

        function collectGameState() {
            dispatcher.game.collectGameState.trigger(gameState);
            socket.send('server.sendGameState', gameState);
        }

        /**
         * public
         */
        function GameApp() {
        }

        return GameApp;

    });