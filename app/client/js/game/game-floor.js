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

define(['config', 'logger', 'underscore', 'dataTypes', 'eventDispatcher', 'pixi', 'noise', 'gameApp', 'gameTile'],
    function (config, Logger, _, dataTypes, dispatcher, pixi, noise, gameApp, GameTile) {

        var logger = Logger.getLogger('gameFloor');
        logger.setLevel(config.logger.gameFloor || 0);

        var tileSize = config.game.tiles.size,
            scale = config.game.tiles.scale;

        GameFloor.prototype = Object.create(pixi.Container.prototype);
        GameFloor.prototype.constructor = GameFloor;

        function GameFloor() {
            pixi.Container.call(this);
            var self = this,
                tiles = {},
                ranges = [
                    0, 100, //Water
                    115, // sand
                    160, // grass
                    190, // wood
                    220, // stone
                    256 // snow
                ],
                textures = [
                    'water',
                    'sand',
                    'grass',
                    'wood',
                    'stone',
                    'snow'
                ];

            dispatcher.game.tick(function () {
                if (gameApp.mainPlayer) {

                    // get current state
                    var nTiles = {},
                        pGrid = gameApp.mainPlayer.gamePosition.grid,
                        px = pGrid.x,
                        py = pGrid.y,
                        screen = gameApp.screen;

                    // count tiles needed
                    var nTilesWidth = Math.round(screen.width / 2 / tileSize  / scale),
                        nTilesHeight = Math.round(screen.height / 2 / tileSize  / scale);

                    var tilesOffsetX = Math.round(screen.playerOffset.x / tileSize),
                        tilesOffsetY = Math.round(screen.playerOffset.y / tileSize);

                    var lx = (px - tilesOffsetX - nTilesWidth) - 1, lxx = lx * tileSize,
                        rx = (px - tilesOffsetX + nTilesWidth) + 1, rxx = rx * tileSize,
                        ly = (py - tilesOffsetY - nTilesHeight) - 1, lyy = ly * tileSize,
                        ry = (py - tilesOffsetY + nTilesHeight) + 1, ryy = ry * tileSize;

                    _.each(tiles, function (t) {
                        if(t.x < lxx || t.x > rxx || t.y < lyy || t.y > ryy){
                            t.destroy();
                        }
                    });

                    var id, tile;
                    for(var x = lx; x <= rx; x ++){
                        for(var y = ly; y <= ry; y ++){
                            id = coord(x, y);
                            if(!tiles[id]){
                                tile = drawTile(x, y);
                                nTiles[id] = tile;
                                addTile(tile);
                            }else{
                                nTiles[id] = tiles[id];
                            }
                        }
                    }
                    tiles = nTiles;
                }
            });

            function addTile(tile){
                self.addChild(tile);
            }


            function drawTile(x, y){


                var value = calcNoise(x, y, 10) / 2;
                value += calcNoise(y, x, 5) / 4;
                value += calcNoise(x, y, 2.5) / 8;
                value += calcNoise(y, x, 1) / 8;
                value = Math.min(255, value);

                for (var i = 0; i < ranges.length - 1; i++) {
                    if (value >= ranges[i] && value < ranges[i + 1]) {
                       return new GameTile(x * tileSize, y * tileSize, textures[i]);
                    }
                }
            }

            function calcNoise(x, y, s) {
                var value = Math.min(Infinity, Math.max(-Infinity, noise.simplex2(x / scaleNoise(s), y / scaleNoise(s), 0)));
                return (1 + value) * 1.1 * 128;
            }

            function scaleNoise(s) {
                return s * 5;
            }

            function coord(x, y) {
                return x + '_' + y;
            }

        }



        return GameFloor;
    });