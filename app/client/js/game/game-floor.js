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

        var tileSize = config.game.tiles.size;
            chunkSize = config.game.chunks.size;


        GameFloor.prototype = Object.create(pixi.Container.prototype);
        Chunk.prototype = Object.create(pixi.Container.prototype);
        Row.prototype = Object.create(pixi.Container.prototype);
        Collumn.prototype = Object.create(pixi.Container.prototype);

        GameFloor.prototype.constructor = GameFloor;
        Chunk.prototype.constructor = Chunk;
        Row.prototype.constructor = Row;
        Collumn.prototype.constructor = Collumn;


        function Floor() {
        }

        function Chunk(x, y){
            pixi.Container.call(this);
            this.gamePosition = dataTypes.gamePosition(x * tileSize * chunkSize, y * tileSize * chunkSize);
            this.tiles = {};

        }
        Chunk.prototype.setTile = function(x, y, texture){
            this.addChild(this.tiles[coord(x, y)] = new GameTile(x * tileSize, y * tileSize, texture));
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
            dispatcher.game.tick(function(){
                if(gameApp.mainPlayer){
                    var position = gameApp.mainPlayer.gamePosition.chunk,
                        nChunks = {};

                    _.each(chunks, function(chunk){
                        var cPos = chunk.gamePosition.chunk
                        if(cPos.dist(position) > 1.5){
                            chunk.destroy();
                        }
                    });

                    for(var i = -1; i <= 1; i++){
                        for(var ii = -1; ii <= 1; ii++){
                            var x = position.x + i,
                                y = position.y + ii,
                                id = coord(x, y);
                            if(!chunks[id]){
                                var chunk = drawChunk(x, y);
                                nChunks[id] = chunk;
                                self.addChild(chunk);
                            }else{
                                nChunks[id] = chunks[id];
                            }

                        }
                    }
                    chunks = nChunks;
                }



            });




        }

        function coord(x, y){
            return x + '_' + y;
        }

        function drawChunk(_x, _y) {
            var value,
                chunk = new Chunk(_x, _y),
                ranges = [
                    0, 100, //Water
                    120, // sand
                    160, // grass
                    200, // wood
                    240, // stone
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

            for (var x = _x * chunkSize; x < _x * chunkSize + chunkSize; x++) {
                for (var y = _y * chunkSize; y < _y * chunkSize + chunkSize; y++) {

                    value = calcNoise(x, y, 10) / 2;
                    value += calcNoise(y, x, 5) / 4;
                    value += calcNoise(x, y, 2.5) / 8;
                    value += calcNoise(y, x, 1) / 8;
                    value = Math.min(255, value);

                    for (var i = 0; i < ranges.length - 1; i++) {
                        if (value >= ranges[i] && value < ranges[i + 1]) {
                            chunk.setTile(x, y, textures[i]);
                            break;
                        }
                    }
                }
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