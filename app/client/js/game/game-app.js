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

define(['config', 'logger', 'gameSocket', 'gameRouter', 'backbone', 'underscore', 'gamePixi', 'eventDispatcher', 'gameFloorManager', 'gamePlayerManager'],
    function (config, Logger, socket, router, Backbone, _, pixi, dispatcher, floorManager, playerManager) {

        var logger = Logger.getLogger('gameApp');
        logger.setLevel(config.logger.gameApp || 0);

        var player,
            gameConfig = {
                tileSize: 100,
                baseSpeed: 1000
            };


        /**
         * init listener and dispatcher
         */
        _.extend(Backbone.Events, {
            init: function () {

                // create main player
                dispatcher.server.login(this, function (user) {
                    player = playerManager.addPlayer(user);
                });

            }
        }).init();

        /**
         * link to router
         */
        router.addModule('game', this, {
            updateFloor: function (job) {
                floorManager.updateFloor(job.data);
            },
            userLocation: function (job) {
                var player = playerManager.userLocation(job.data);
                if (player) {
                    var location = job.data.location;
                }
            }
        });

        /**
         * public
         */
        function GameApp() {

        }


        return GameApp;

    });