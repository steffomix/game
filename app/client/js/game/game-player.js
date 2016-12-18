/*
 * Copyright (C) 16.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'gamePixi'],
    function (config, Logger, gamePixi) {

        var logger = Logger.getLogger('gamePlayer');

        logger.setLevel(config.logger.gamePlayer || 0);

        var tileSize = config.game.tiles.size;

        function Player(user) {
            this.id = user.id;
            this.name = user.name;
            this.location = {
                world_id: 1,
                area_id: 1,
                x: 0,
                y: 0,
                z: 0
            };

            this.__proto__.__proto__ = gamePixi.createTile(
                parseInt(this.location.x),
                parseInt(this.location.y),
                'assets/avatars/' + (user.image || 'devil.png'));
            gamePixi.addPlayer(this);
        }

        Player.prototype = {
            updateLocation: function(loc){
                this.position.x = loc.x * tileSize;
                this.position.y = loc.y * tileSize;
            }

        };

        return Player;

    });