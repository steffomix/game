/*
 * Copyright (C) 09.01.17 Stefan Brinkmann <steffomix@gmail.com>
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

        var instance,
            logger = Logger.getLogger('tileDefinition');
        logger.setLevel(config.logger.tileDefinition || 0);

        return getInstance();

        function getInstance() {
            if (!instance) {
                instance = new TileDefinitionCollection();
            }
            return instance;
        }

        function TileDefinition(texture, walkSpeed){
            this.texture = texture;
            this.walkSpeed = walkSpeed;
        }

        function TileDefinitionCollection(){
            var definitions = {
                // world Generator Tiles
                worldGenerator: {
                    water: new TileDefinition('world-generator/water', 1),
                    grass: new TileDefinition('world-generator/grass', 5),
                    sand: new TileDefinition('world-generator/sand', 3),
                    forest: new TileDefinition('world-generator/forest', 2),
                    stone: new TileDefinition('world-generator/stone', 6),
                    snow: new TileDefinition('world-generator/snow', 2)
                }
            };

            this.TileDefinition = TileDefinition;

            this.worldGenerator = function(tile){
                if(tile){
                    // return tile
                    return definitions.worldGenerator[tile]
                }else{
                    var def = definitions.worldGenerator;
                    // all tiles sorted by depth for worldGenerator and pathfinder
                    return  [
                        def.water,
                        def.sand,
                        def.grass,
                        def.forest,
                        def.stone,
                        def.snow
                    ]
                }
            }

            this.getWalkSpeeds = function(){
                var def = definitions.worldGenerator;
                // all tiles sorted by depth for worldGenerator and pathfinder
                return  [
                    def.water,
                    def.sand,
                    def.grass,
                    def.forest,
                    def.stone,
                    def.snow
                ]
            }
        }


    });