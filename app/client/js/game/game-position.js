/*
 * Copyright (C) 07.01.17 Stefan Brinkmann <steffomix@gmail.com>
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
            chunkSize = config.game.chunks.size,
            scale = config.game.tiles.scale,
            logger = Logger.getLogger('gamePosition');
        logger.setLevel(config.logger.gamePosition || 0);


        function factory(self, relative){
            return relative ? gamePositionRelative(self, relative) : gamePosition(self);
        }

        return {
            factory: factory
        };

        /**
         * Create calculators for position, grid and chunk
         * @param p1
         * @private
         */
        function _createCalculators(p1) {
            /**
             * calculate if p1 and p2 is same
             * @param p2 {{x, y}}
             * @returns {boolean}
             * @private
             */
            p1.eq = function (p2) {
                return (p1.x == p2.x && p1.y == p2.y);
            };
            /**
             * calculate distance
             * @param p2 {{x, y}}
             * @returns {number}
             */
            p1.dist = function (p2) {
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
            p1.diff = function (p2, minX, minY) {
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
         * and integer mouse position in px of inside tile where 0,0 is center of.
         *
         * Calculates in Units:
         * px,
         * grid (px * tileSize)
         * chunk (grid * chunkSize or  px * tileSize * chunkSize)
         *
         * @param self {{x, y}}
         * @returns {{x, y, grid, chunk}}
         */
        function gamePosition(self) {

            // position in px inside of tile where 0,0 is top left
            // max x, y range: 0 to tileSize
            var tile = {
                get x() {
                    return self.x - grid.x * tileSize;
                },
                get y() {
                    return self.y - grid.y * tileSize;
                },
                set x(x) {
                    x = Math.max(0, Math.min(x, tileSize));
                    self.x = x + grid.x * tileSize;
                },
                set y(y) {
                    y = Math.max(0, Math.min(y, tileSize));
                    self.y = y + grid.y * tileSize;
                }
            };

            var tilePos = {
                get x (){
                    return self.x - gridPos.x;
                },
                get y (){
                    return self.y - gridPos.y;
                },
                set x (x){
                    self.x = gridPos.y + Math.max(0, Math.min(x, tileSize));
                },
                set y (y){
                    self.y = gridPos.y + Math.max(0, Math.min(y, tileSize));
                }
            };

            // tiles position in grid, eq to database location and user-location
            var grid = {
                get x() {
                    return Math.round(self.x / tileSize)
                },
                get y() {
                    return Math.round(self.y / tileSize);
                },
                set x(x) {
                    self.x = Math.round(x * tileSize);
                },
                set y(y) {
                    self.y = Math.round(y * tileSize);
                }
            };

            // tiles position in px on the tiles-grid
            var gridPos = {
                get x() {
                    return grid.x * tileSize;
                },
                get y() {
                    return grid.y * tileSize;
                }
            };

            // chunk position in chunk
            var chunk = {
                get x() {
                    return Math.round(self.x / tileSize / chunkSize) - 1;
                },
                get y() {
                    return Math.round(self.y / tileSize / chunkSize) - 1;
                },
                set x(x) {
                    self.x = x * tileSize * chunkSize;
                },
                set y(y) {
                    self.y = y * tileSize * chunkSize;
                }
            };

            // chunk position in px
            var chunkPos = {
                get x(){
                    return chunk.x * tileSize * chunkSize;
                },
                get y(){
                    return chunk.y * tileSize * chunkSize;
                }
            };

            // tiles position inside chunk in grid
            var chunkTile = {
                get x() {
                    return Math.round((self.x - chunk.x * tileSize * chunkSize) / tileSize);
                },
                get y() {
                    return Math.round((self.y - chunk.y * tileSize * chunkSize) / tileSize);
                },
                set x(x) {
                    self.x = chunk.x * tileSize * chunkSize + x * tileSize;
                },
                set x(y) {
                    self.y = chunk.y * tileSize * chunkSize + y * tileSize;
                }
            };

            // tiles position inside chunk in px
            var chunkTilePos = {
                get x() {
                    return chunkTile.x * tileSize;
                },
                get y() {
                    return chunkTile.y * tileSize;
                }
            };

            var pos = {
                get x() {
                    return self.x;
                },
                get y() {
                    return self.y;
                },
                set x(x) {
                    self.x = x;
                },
                set y(y) {
                    self.y = y;
                },
                get tile() {
                    return tile;
                },
                get tilePos(){
                    return tilePos;
                },
                get grid() {
                    return grid;
                },
                get gridPos() {
                    return gridPos;
                } /*,
                get chunk() {
                    return chunk;
                },
                get chunkPos(){
                    return chunkPos;
                },
                get chunkTile() {
                    return chunkTile;
                },
                get chunkTilePos() {
                    return chunkTilePos;
                }
                */
            };

            _createCalculators(pos);
            _createCalculators(tile);
            _createCalculators(tilePos);
            _createCalculators(grid);
            _createCalculators(gridPos);
            /*
            _createCalculators(chunk);
            _createCalculators(chunkTile);
            _createCalculators(chunkTilePos);
             */

            return pos;
        }

        /**
         * calculate relative coordinates of another container
         * calculate grid coordinates
         * and integer mouse position in px of inside tile where 0,0 is center of.
         * Used only by pixiRoot to calculate mouseEvent position on the grid
         * @param self {{x, y}}
         * @param rel {{x, y}}
         * @returns {{x, y, grid, chunk}}
         */
        function gamePositionRelative(self, rel) {
            var pos = {
                get x() {
                    return (rel.x - self.x) / scale;
                },
                get y() {
                    return (rel.y - self.y) / scale;
                }
            };

            var tilePos = {
                get x (){
                    return pos.x - gridPos.x;
                },
                get y (){
                    return pos.y - gridPos.y;
                }
            };


            var tile = {
                get x() {
                    return Math.round(pos.x - grid.x * tileSize);
                },
                get y() {
                    return Math.round(pos.y - grid.y * tileSize);
                }
            };

            var grid = {
                get x() {
                    return Math.round(pos.x / tileSize);
                },
                get y() {
                    return Math.round(pos.y / tileSize);
                }
            };

            var gridPos = {
                get x() {
                    return grid.x * tileSize;
                },
                get y() {
                    return grid.y * tileSize;
                }
            };

            var chunk = {
                get x() {
                    return Math.round(grid.x / chunkSize);
                },
                get y() {
                    return Math.round(grid.y / chunkSize);
                }
            };

            var chunkPos = {
                get x(){
                    return chunk.x * tileSize * chunkSize;
                },
                get y(){
                    return chunk.y * tileSize * chunkSize;
                }
            };

            var position = {
                get x(){
                    return pos.x;
                },
                get y(){
                    return pos.y;
                },
                get tile() {
                    return tile;
                },
                get tilePos(){
                    return tilePos;
                },
                get grid() {
                    return grid;
                },
                get gridPos() {
                    return gridPos;
                },
                get chunk() {
                    return chunk;
                },
                get chunkPos(){
                    return chunkPos;
                }
            };

            _createCalculators(pos);
            _createCalculators(tile);
            _createCalculators(grid);
            _createCalculators(chunk);

            return position;
        }


    });