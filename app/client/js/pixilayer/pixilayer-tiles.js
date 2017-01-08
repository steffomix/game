/*
 * Copyright (C) 25.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'gameRouter', 'gamePosition', 'pixi', 'eventDispatcher', 'gameApp', 'tween', 'gameFloor'],
    function (config, Logger, router, gamePosition, pixi, dispatcher, gameApp, tween, GameFloor) {

        var instance,
            logger = Logger.getLogger('pixiTiles');
        logger.setLevel(config.logger.pixiTiles || 0);

        var scale = config.game.tiles.scale,
            tileSize = config.game.tiles.size,
            chunkSize = config.game.chunks.size;

        function getInstance() {
            if (!instance) {
                instance = new PixiTilesLayer();
            }
            return instance;
        }

        /**
         *Grid
         * @constructor
         */
        function Grid() {
            pixi.Graphics.call(this);
            this.gamePosition = gamePosition.factory(this);
            var x = 30 * tileSize - tileSize / 2;
            this.lineStyle(3, 0x808080, .3);

            for (var i = -x; i <= x; i += tileSize) {
                this.moveTo(i, -x);
                this.lineTo(i, x);
                this.moveTo(-x, i);
                this.lineTo(x, i);
            }
            this.hitArea = new pixi.Rectangle(-x, -x, x * 2, x * 2);
        }
        Grid.prototype = Object.create(pixi.Graphics.prototype);
        Grid.prototype.constructor =  Grid;



        /**
         * Chunk
         * @constructor
         */
        function Chunk() {
            pixi.Graphics.call(this);
            this.gamePosition = gamePosition.factory(this);
            var x = 6 * tileSize * chunkSize + tileSize / 2;
            this.lineStyle(4, 0x000000, .3);

            for (var i = -x; i <= x; i += tileSize * chunkSize) {
                this.moveTo(i, -x);
                this.lineTo(i, x);
                this.moveTo(-x, i);
                this.lineTo(x, i);
            }
            this.hitArea = new pixi.Rectangle(-x, -x, x * 2, x * 2);
        }
        Chunk.prototype = Object.create(pixi.Graphics.prototype);
        Chunk.prototype.constructor =  Chunk;

        /**
         * Cursor
         * @constructor
         */
        function Cursor() {
            pixi.Graphics.call(this);
            this.gamePosition = gamePosition.factory(this);
            var x = tileSize / 2;
            this.lineStyle(6, 0x000000, .5);
            this.moveTo(-x, -x);
            this.lineTo(x, -x);
            this.lineTo(x, x);
            this.lineTo(-x, x);
            this.lineTo(-x, -x);
            

        }
        Cursor.prototype = Object.create(pixi.Graphics.prototype);
        Cursor.prototype.constructor = Cursor;

        /**
         * Pointer
         * @constructor
         */
        function Pointer(){

            pixi.Graphics.call(this);
            var x = tileSize / 2,
                alpha = .5;

            this.gamePosition = gamePosition.factory(this);

            this.lineStyle(6, 0xcc0000, alpha);
            this.moveTo(-x, -x);
            this.lineTo(x, -x);
            this.lineTo(x, x);
            this.lineTo(-x, x);
            this.lineTo(-x, -x);

            this.fadeOut = function(){
                this.alpha = Math.max(0, this.alpha - fade);
            };

            this.show = function(){
                this.alpha = alpha;
            }
        }
        Pointer.prototype = Object.create(pixi.Graphics.prototype);
        Pointer.prototype.constructor = Pointer;

        function Path(){
            pixi.Container.call(this);
            var self = this;

            this.drawPath = function(path){
                var graph = new pixi.Graphics(),
                    p1 = path[0];

                self.removeChildren().forEach(function(child){
                    child.destroy();
                });

                addText(p1);
                graph.lineStyle(6, 0xcc0000, 1);
                graph.moveTo(p1.x * tileSize, p1.y * tileSize);
                for(var i = 1; i < path.length; i++){
                    var p = path[i];
                    addText(p, path);
                    graph.lineTo(p.x * tileSize, p.y * tileSize);
                }

                self.addChild(graph);

            }

            function addText(step){
                var t = new pixi.Text();
                t.text = step.tile;//JSON.stringify(step);
                t.x = step.x * tileSize;
                t.y = step.y * tileSize;
                self.addChild(t);
            }


        }
        Path.prototype = Object.create(pixi.Container.prototype);
        Path.prototype.constructor = Path;

        /**
         *
         * @constructor
         */
        function PixiTilesLayer() {
            pixi.Container.call(this);

            var grid = new Grid(),
                chunk = new Chunk(),
                path = new Path(),
                cursor = new Cursor(),
                pointer = new Pointer(),
                tilesGrid = new GameFloor(),
                animate = new tween.Tween({
                    get alpha (){
                        return pointer.alpha
                    },
                    set alpha (a){
                        pointer.alpha = a;
                    }
                });


            //this.addChild(grid);
            //this.addChild(chunk);
            this.addChild(tilesGrid);
            this.addChild(path);
            this.addChild(cursor);
            this.addChild(pointer);

            router.addModule('tilesGrid', this, {
                showPath: function(job){
                    path.drawPath(job.data);
                }
            })


            this.interactive = true;

            dispatcher.game.frameTick(function(t){
                var mouse = gameApp.get('mouse');
                var mouseGrid = mouse.position.grid;
                cursor.gamePosition.grid.x = mouseGrid.x;
                cursor.gamePosition.grid.y = mouseGrid.y;

                if(mouse.isDown){
                    pointer.alpha = .5;
                    setPointer();
                }else{
                    animate.update(t);
                }

                /*
                // debug grid position
                var gameGrid = gameApp.get('pixiRoot').position.grid,
                chunkGrid = gameApp.get('pixiRoot').position.chunk;

                grid.gamePosition.grid.x = gameGrid.x *-1;
                grid.gamePosition.grid.y = gameGrid.y *-1;
                chunk.gamePosition.chunk.x = chunkGrid.x *-1  -1;
                chunk.gamePosition.chunk.y = chunkGrid.y *-1  -1;
                */
            });

            // update pointer on mouse up and down
            dispatcher.game.mouseDown(setPointer);
            dispatcher.game.mouseUp(function showPointer(){
                setPointer();
                animate.to({alpha: 0}, 2000).start();
            });


            function setPointer(){
                var mouseGrid = gameApp.get('mouse').position.grid;
                pointer.gamePosition.grid.x = mouseGrid.x;
                pointer.gamePosition.grid.y = mouseGrid.y;
            }


        }

        PixiTilesLayer.prototype = Object.create(pixi.Container.prototype);
        PixiTilesLayer.prototype.constructor = PixiTilesLayer;

        return getInstance();
    });