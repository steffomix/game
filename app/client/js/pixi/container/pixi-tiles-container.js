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

define(['config', 'logger', 'dataTypes', 'pixi', 'eventDispatcher', 'gameApp'],
    function (config, Logger, dataTypes, pixi, dispatcher, gameApp) {

        var instance,
            logger = Logger.getLogger('pixiTilesContainer');
        logger.setLevel(config.logger.pixiTilesContainer || 0);

        var tileSize = config.game.tiles.size;

        function getInstance() {
            if (!instance) {
                instance = new PixiTilesContainer();
            }
            return instance;
        }

        /**
         *Grid
         * @constructor
         */
        function Grid() {
            pixi.Graphics.call(this);
            this.gamePosition = dataTypes.createPosition(this);
            var x = 30 * tileSize - tileSize / 2;
            this.lineStyle(8, 0x808080, .5);

            //this.blendMode = pixi.BLEND_MODES.OVERLAY;

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
         * Cursor
         * @constructor
         */
        function Cursor() {
            pixi.Graphics.call(this);
            this.gamePosition = dataTypes.createPosition(this);
            var x = tileSize / 2;
            //this.blendMode = pixi.BLEND_MODES.OVERLAY;
            this.lineStyle(3, 0x000000, .3);
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
            var self = this,
                gridX,
                gridY,
                x = tileSize / 2,
                alpha = .5,
                fade = .01;

            this.gamePosition = dataTypes.createPosition(this);

            this.lineStyle(3, 0xcc0000, alpha);
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


        /**
         *
         * @constructor
         */
        function PixiTilesContainer() {
            pixi.Container.call(this);

            var mousePosition = dataTypes.createPosition(this),
                grid = new Grid(),
                cursor = new Cursor(),
                pointer = new Pointer(),
                tilesGrid = new pixi.Container();


            this.addChild(grid);
            this.addChild(tilesGrid);
            this.addChild(cursor);
            this.addChild(pointer);

            this.interactive = true;


            function playerGo(){
                pointer.show();
                pointer.location.x = mousePosition.grid.x;
                pointer.location.y = mousePosition.grid.y;
            }


            dispatcher.game.tick(function(){
                var mouseGrid = gameApp.mouse.position.grid,
                    gameGrid = gameApp.pixiRoot.position.grid;
                cursor.gamePosition.grid.x = mouseGrid.x;
                cursor.gamePosition.grid.y = mouseGrid.y;
                grid.gamePosition.grid.x = gameGrid.x *-1;
                grid.gamePosition.grid.y = gameGrid.y *-1;

                if(gameApp.mouse.isDown){
                    pointer.show();
                    pointer.gamePosition.grid.x = mouseGrid.x;
                    pointer.gamePosition.grid.y = mouseGrid.y;
                }else{
                    pointer.fadeOut();
                }


            });

        }

        PixiTilesContainer.prototype = Object.create(pixi.Container.prototype);
        PixiTilesContainer.prototype.constructor = PixiTilesContainer;

        return getInstance();
    });