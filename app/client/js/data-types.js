/*
 * Copyright (C) 27.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

        var tileSize = config.game.tiles.size,
            logger = Logger.getLogger('dataTypes');
        logger.setLevel(config.logger.dataTypes || 0);

        var instance = {

            get Location(){
                return Location;
            },
            get MousePosition(){
                return MousePosition;
            }

        };

        /**
         *
         * @param x {int}
         * @param y {int}
         * @param z {int}
         * @param area_id {int}
         * @param world_id {int}
         * @constructor
         */
        function Location(x, y, z, area_id, world_id){
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
            this.area_id = area_id || null;
            this.world_id = world_id || null;
        }
        Location.prototype = {
            x: 0,
            y: 0,
            z: 0,
            area_id: null,
            world_id: null
        };

        /**
         *
         * @param x {float}
         * @param y {float}
         * @param gx {int}
         * @param gy {int}
         * @constructor
         */
        function MousePosition(x, y){
            var self = this;
            this.x = x || 0;
            this.y = y || 0;
            this.grid = {
                x: Math.round(self.x / tileSize),
                y: Math.round(self.y / tileSize)
            }
        }

        return instance;

    });