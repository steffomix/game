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

define(['config', 'logger', 'underscore', 'gameTile'],
    function (config, Logger, _, Tile) {

        var logger = Logger.getLogger('gameFloor');
        logger.setLevel(config.logger.gameFloor || 0);


        function GameFloor(data) {
            this.world_id = data.world_id;
            this.area_id = data.area_id;
            this.z = data.z;
            this.tiles = data.tiles;
            this.updateFloor(this.tiles);
        }

        GameFloor.prototype = {
            updateFloor: function(data){
                this.tiles = {};
                var self = this;
                _.each(data, function(v, k){
                    self.tiles[k] = new Tile(v);
                })
            },
            updateTile: function(tile){
                this.tile = new Tile(tile);
            }
        };

        return GameFloor;
    });