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

define(['config', 'logger', 'dataTypes', 'pixi', 'eventDispatcher'],
    function (config, Logger, dataTypes, pixi, dispatcher) {

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

        function drawGrid() {

            var gr = new pixi.Graphics(),
                x = 30 * tileSize - tileSize / 2;
            gr.lineStyle(3, 0x808080, .1);

            gr.blendMode = pixi.BLEND_MODES.OVERLAY;

            for (var i = -x; i <= x; i += tileSize) {
                gr.moveTo(i, -x);
                gr.lineTo(i, x);
                gr.moveTo(-x, i);
                gr.lineTo(x, i);
            }
            gr.hitArea = new pixi.Rectangle(-x, -x, x * 2, x * 2);
            return gr;

        }

        function MouseFrame() {
            pixi.Graphics.call(this);
            var x = tileSize / 2;
            this.blendMode = pixi.BLEND_MODES.OVERLAY;
            this.lineStyle(3, 0x000000, .3);
            this.moveTo(-x, -x);
            this.lineTo(x, -x);
            this.lineTo(x, x);
            this.lineTo(-x, x);
            this.lineTo(-x, -x);
            

        }
        MouseFrame.prototype = Object.create(pixi.Graphics.prototype);
        MouseFrame.prototype.constructor = MouseFrame;
        
        function PlayerFrame(){

            pixi.Graphics.call(this);
            var self = this,
                gridX,
                gridY,
                x = tileSize / 2,
                alpha = .5,
                fade = .01;

            this.location = {
                get x(){
                    return gridX;
                },
                set x(x){
                    gridX = x;
                    self.x = x * tileSize;
                },
                get y(){
                    return gridY;
                },
                set y(y){
                    gridY = y;
                    self.y = y * tileSize;
                }
            };

            this.blendMode = pixi.BLEND_MODES.OVERLAY;

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
        PlayerFrame.prototype = Object.create(pixi.Graphics.prototype);
        PlayerFrame.prototype.constructor = PlayerFrame;
        
        function PixiTilesContainer() {
            pixi.Container.call(this);

            var self = this,
                mousePosition = new dataTypes.MousePosition(),
                mouseDown = false,
                playerAtTarget = true,

                grid = drawGrid(),
                mouseFrame = new MouseFrame(),
                playerFrame = new PlayerFrame(),
                tilesGrid = new pixi.Container();


            this.addChild(grid);
            this.addChild(tilesGrid);
            this.addChild(playerFrame);
            this.addChild(mouseFrame);

            this.interactive = true;
            this.on('mousedown', function(){
                mouseDown = true;
                logger.info(mousePosition);
                playerGo();
            });

            this.on('mouseup', function(){
                mouseDown = false;
            });
            
            function playerGo(){
                playerFrame.show();
                playerFrame.location.x = mousePosition.grid.x;
                playerFrame.location.y = mousePosition.grid.y;
                dispatcher.game.clickGrid.trigger(mousePosition);
            }

            function playerLeaveTarget(game){
                playerAtTarget = false;
                logger.info('Player leave Target');
            }

            function playerReachTarget(game){
                playerAtTarget = true;
                logger.info('Player reach Target');
            }

            dispatcher.server.tick(function (game) {
                var x = self;
                if(mouseDown){
                    playerGo();
                }
                // mainPlayer may not be loaded yet
                if(game.state.mainPlayer){
                    var loc = game.state.mainPlayer.location,
                        pos = mousePosition.grid;
                    grid.x = loc.x * tileSize;
                    grid.y = loc.y * tileSize;

                    logger.info(loc.x, pos.x, loc.y, pos.y);

                    if(playerAtTarget && (loc.x != pos.x || loc.y != pos.y)){
                        playerLeaveTarget(game);
                    }
                    if(!playerAtTarget && (loc.x == pos.x && loc.y == pos.y)){
                        playerReachTarget(game);
                    }
                    if(loc.x == pos.x && loc.y == pos.y){
                        playerAtTarget = true;
                    }

                }

            });

            dispatcher.game.tick(function(frameData){
                mousePosition = frameData.mousePosition;
                var pos = mousePosition.grid;
                mouseFrame.x = pos.x * tileSize;
                mouseFrame.y = pos.y * tileSize;
                playerFrame.fadeOut();
            });

        }

        PixiTilesContainer.prototype = Object.create(pixi.Container.prototype);
        PixiTilesContainer.prototype.constructor = PixiTilesContainer;

        return getInstance();
    });