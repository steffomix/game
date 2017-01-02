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

define(['config', 'logger', 'gameSocket'],
    function (config, Logger, socket) {

        var tileSize = config.game.tiles.size,
            chunkSize = config.game.chunks.size,
            logger = Logger.getLogger('dataTypes');
        logger.setLevel(config.logger.dataTypes || 0);

        var instance = {

            get Location(){
                return Location;
            },
            get createPosition(){
                return createPosition;
            },
            get createPositionRelative(){
                return createPositionRelative;
            }

        };

        /**
         * Represents Database UserLocation
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
         * Create calculators for position, grid and chunk
         * @param p1
         * @private
         */
        function _createCalculators(p1){
            /**
             * calculate if p1 and p2 is same
             * @param p2 {{x, y}}
             * @returns {boolean}
             * @private
             */
            p1.eq = function (p2){
                return (p1.x == p2.x && p1.y == p2.y);
            };
            /**
             * calculate distance
             * @param p2 {{x, y}}
             * @returns {number}
             */
            p1.dist = function(p2){
                return Math.sqrt(Math.pow(Math.abs(p1.x - p2.x), 2) + Math.pow(Math.abs(p1.y - p2.y), 2));
            };
            /**
             * calculate difference
             * Usage for movements: {x, y} = diff(posIsNow, posMoveTo)
             * @param p2 {{x, y}}
             * @param minX {number} threshold, below defaults to 0
             * @param minY {number} threshold, below defaults to 0
             * @returns {{x, y}}
             */
            p1.diff = function(p2, minX, minY){
                var x = p2.x - p1.x,
                    y = p2.y - p1.y;
                !minX && (minX = 0);
                !minY && (minY = 0);
                return {
                    x: Math.abs(x) >= minX ? x : 0,
                    y: Math.abs(y) >= minY ? y : 0
                }
            };
        }


        /**
         * calculate grid and chunk coordinates
         * and integer mouse position in px of inside tile where 0,0 is center of
         * @param self {{x, y}}
         * @returns {{x, y, grid, chunk}}
         */
        function createPosition(self){

            var tile = {
                get x() {
                    return self.x - grid.x * tileSize + tileSize / 2;
                },
                get y() {
                    return self.y - grid.y * tileSize + tileSize / 2;
                },
                set x (x) {
                    x = Math.max(0, Math.min(x, tileSize));
                    self.x = x + grid.x * tileSize - tileSize / 2;
                },
                set y (y){
                    y = Math.max(0, Math.min(y, tileSize));
                    self.y = y + grid.y * tileSize - tileSize / 2;
                }
            };

            var grid = {
                get x (){
                    return Math.round(self.x / tileSize)
                },
                get y (){
                    return Math.round(self.y / tileSize);
                },
                set x (x) {
                    self.x = Math.round(x * tileSize);
                },
                set y (y){
                    self.y = Math.round(y * tileSize);
                }
            };

            var chunk = {
                get x (){
                    return Math.round(self.x / tileSize / chunkSize);
                },
                get y (){
                    return Math.round(self.y / tileSize / chunkSize);
                },
                set x (x) {
                    self.x = Math.round(x * tileSize * chunkSize);
                },
                set y (y){
                    self.y = Math.round(y * tileSize * chunkSize);
                }
            };

            var pos = {
                get x(){
                    return self.x * 100 / 100;
                },
                get y (){
                    return self.y * 100 / 100;
                },
                set x(x){
                    self.x = x;
                },
                set y (y){
                    self.y = y;
                },
                get tile(){
                    return tile;
                },
                get grid(){
                    return grid;
                },
                get chunk(){
                    return chunk;
                }
            };

            _createCalculators(pos);
            _createCalculators(tile);
            _createCalculators(grid);
            _createCalculators(chunk);

            return pos;
        }

        /**
         * calculate relative coordinates of another container
         * calculate grid coordinates
         * and integer mouse position in px of inside tile where 0,0 is center of.
         * Used only by pixiRootContainer to calculate mouseEvent position on the grid
         * @param self {{x, y}}
         * @param rel {{x, y}}
         * @returns {{x, y, grid, chunk}}
         */
        function createPositionRelative(self, rel){
            var tile = {
                get x() {
                    return Math.round((rel.x - self.x) - grid.x * tileSize);
                },
                get y() {
                    return Math.round((rel.y - self.y) - grid.y * tileSize);
                }
            };

            var grid = {
                get x(){
                    return Math.round((rel.x - self.x) / tileSize);
                },
                get y(){
                    return Math.round((rel.y - self.y) / tileSize);
                }
            };

            var chunk = {
                get x (){
                    return Math.round(grid.x / chunkSize);
                },
                get y (){
                    return Math.round(grid.y / chunkSize);
                }
            };

            var pos =  {
                get x() {
                    return Math.round((rel.x - self.x) * 100) / 100;
                },
                get y() {
                    return Math.round((rel.y - self.y) * 100) / 100;
                },
                get tile(){
                    return tile;
                },
                get grid(){
                    return grid;
                },
                get chunk(){
                    return chunk;
                }
            };

            _createCalculators(pos);
            _createCalculators(tile);
            _createCalculators(grid);
            _createCalculators(chunk);

            return pos;
        }



        return instance;

    });