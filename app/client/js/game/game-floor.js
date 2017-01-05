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
            chunkSize = config.game.chunks.size,
            drawChunks = config.game.chunks.draw,
            diag = Math.sqrt(2);


        GameFloor.prototype = Object.create(pixi.Container.prototype);
        Chunk.prototype = Object.create(pixi.Container.prototype);
        Row.prototype = Object.create(pixi.Container.prototype);
        Collumn.prototype = Object.create(pixi.Container.prototype);

        GameFloor.prototype.constructor = GameFloor;
        Chunk.prototype.constructor = Chunk;
        Row.prototype.constructor = Row;
        Collumn.prototype.constructor = Collumn;


        function Chunk(x, y) {
            pixi.Container.call(this);
            this.setTransform(x, y);
            this.gamePosition = dataTypes.gamePosition(this);
            this.tiles = {};

        }

        Chunk.prototype.setTile = function (x, y, texture) {
            var tile = new GameTile(x * tileSize, y * tileSize, texture);
            this.tiles[coord(x, y)] = tile;
            this.addChild(tile);
        };

        function Row(y) {
            pixi.Container.call(this);
            this.y = y;
        }

        function Collumn(x) {
            pixi.Container.call(this);
            this.x = x;
        }


        function GameFloor() {
            pixi.Container.call(this);
            var self = this,
                chunks = {};
            dispatcher.game.tick(function () {
                if (gameApp.mainPlayer) {

                    var player = gameApp.mainPlayer;


                    var position = gameApp.mainPlayer.gamePosition.chunk,
                        nChunks = {};

                    _.each(chunks, function (chunk) {
                        var cPos = chunk.gamePosition.chunk;
                        var dist = cPos.dist(position);
                        if (dist > drawChunk * diag) {
                            chunk.destroy();
                        }
                    });

                    for (var i = -drawChunks; i <= drawChunks; i++) {
                        for (var ii = -drawChunks; ii <= drawChunks; ii++) {
                            var x = position.x + i,
                                y = position.y + ii,
                                id = coord(x, y);
                            if (!chunks[id]) {
                                var chunk = drawChunk(x, y);
                                nChunks[id] = chunk;
                                self.addChild(chunk);
                            } else {
                                nChunks[id] = chunks[id];
                            }

                        }
                    }
                    chunks = nChunks;
                }
            });
        }

        function coord(x, y) {
            return x + '_' + y;
        }

        function drawChunk(_x, _y) {
            var value,
                posX = 0,
                posY = 0,
                chunk = new Chunk(_x * chunkSize * tileSize, _y * chunkSize * tileSize),
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


            for (var y = _y * chunkSize; y < _y * chunkSize + chunkSize; y++) {
                for (var x = _x * chunkSize; x < _x * chunkSize + chunkSize; x++) {

                    value = calcNoise(x, y, 10) / 2;
                    value += calcNoise(y, x, 5) / 4;
                    value += calcNoise(x, y, 2.5) / 8;
                    value += calcNoise(y, x, 1) / 8;
                    value = Math.min(255, value);

                    for (var i = 0; i < ranges.length - 1; i++) {
                        if (value >= ranges[i] && value < ranges[i + 1]) {
                            chunk.setTile(posX, posY, textures[i]);
                            break;
                        }
                    }
                    posX++;
                }
                posX = 0;
                posY++;
            }

            return chunk;

            function scaleNoise(s) {
                return s * 5;
            }

            function calcNoise(x, y, s) {
                var value = Math.min(Infinity, Math.max(-Infinity, noise.simplex2(x / scaleNoise(s), y / scaleNoise(s), 0)));
                return (1 + value) * 1.1 * 128;
            }
        }

        return GameFloor;
    });