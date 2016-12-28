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

define(['config', 'logger', 'underscore'],
    function (config, Logger, _) {

        var tileSize = config.game.tiles.size,
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
         * calculate grid coordinates
         * and integer mouse position in px of inside tile where 0,0 is center of
         * @param self {{x, y}}
         * @returns {{x, y, grid}}
         */
        function createPosition(self){
            var grid = {
                get x (){
                    return Math.round(self.x / tileSize)
                },
                get y (){
                    return Math.round(self.y / tileSize);
                }
            };

            return {
                get x(){
                    return Math.round(self.x - grid.x * tileSize);
                },
                get y (){
                    return Math.round(self.y - grid.y * tileSize);
                },
                get grid(){
                    return grid;
                }
            }
        }

        /**
         * calculate relative coordinates of another container
         * calculate grid coordinates
         * and integer mouse position in px of inside tile where 0,0 is center of
         * @param self {{x, y}}
         * @param rel {{x, y}}
         * @returns {{x, y, grid}}
         */
        function createPositionRelative(self, rel){
            var grid = {
                get x(){
                    return Math.round((rel.x - self.x) / tileSize);
                },
                get y(){
                    return Math.round((rel.y - self.y) / tileSize);
                }
            };

            return {
                get x() {
                    return Math.round((rel.x - self.x) - grid.x * tileSize);
                },
                get y() {
                    return Math.round((rel.y - self.y)- grid.y * tileSize);
                },
                get grid(){
                    return grid;
                }

            }
        }



        return instance;

    });