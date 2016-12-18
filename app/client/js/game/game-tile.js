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

define(['config', 'logger', 'pixi', 'gamePixi'],
    function (config, Logger, Pixi, gamePixi) {

        var logger = Logger.getLogger('gameTile');
        logger.setLevel(config.logger.gameTile || 0);

        var tileSize = config.game.tiles.size;

        function GameTile(data) {
            this.world_id = data.world_id;
            this.area_id = data.area_id;
            this.x = data.x;
            this.y = data.y;
            this.z = data.z;
            this.tileData = data.data || {};

            this.__proto__ = gamePixi.createTile(data.x, data.y, 'assets/tiles/' + (this.tileData.image || 'blank.png'));
            gamePixi.addTile(this);
        }

        return GameTile;

    });