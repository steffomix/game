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


module.exports = new TileDefinitionCollection();

function TileDefinition(walkSpeed) {
    this.s = walkSpeed;
}

var definitions = {
    // world Generator Tiles
    // the lower the faster
    // min value is 0, max is Infinity
    // 100 = default speed
    worldGenerator: {
        water: new TileDefinition(1000),
        grass: new TileDefinition(100),
        sand: new TileDefinition(150),
        forest: new TileDefinition(200),
        stone: new TileDefinition(80),
        snow: new TileDefinition(300)
    }
};

function TileDefinitionCollection() {

    this.TileDefinition = TileDefinition;

    this.worldGenerator = function (tile) {
        if (tile) {
            // return tile
            return definitions.worldGenerator[tile]
        } else {
            var def = definitions.worldGenerator;
            // all tiles sorted by depth for worldGenerator and pathfinder
            return [
                def.water,
                def.sand,
                def.grass,
                def.forest,
                def.stone,
                def.snow
            ]
        }
    };

    this.getWalkSpeeds = function () {
        var def = definitions.worldGenerator;
        // all tiles sorted by depth for worldGenerator and pathfinder
        return [
            def.water,
            def.sand,
            def.grass,
            def.forest,
            def.stone,
            def.snow
        ]
    }
}
