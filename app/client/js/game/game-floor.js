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

define(['config', 'logger'],
    function (config, Logger) {

        var logger = Logger.getLogger('gameFloor');
        logger.setLevel(config.logger.gameFloor || 0);

        return GameFloor;

        function GameFloor(data) {
            this.world = data.world_id;
            this.area = data.area_id;
            this.z = data.z;
            this.tiles = data.tiles;
        }

    });