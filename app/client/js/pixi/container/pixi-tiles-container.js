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

define(['config', 'logger', 'pixi', 'eventDispatcher'],
    function (config, Logger, pixi, dispatcher) {

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

        function renderGrid() {

            var gr = new pixi.Graphics(),
                x = 10 * tileSize - tileSize / 2;
            gr.lineStyle(3, 0x808080, .1);

            gr.blendMode = pixi.BLEND_MODES.OVERLAY;

            for (var i = -x; i <= x; i += tileSize) {
                gr.moveTo(i, -x);
                gr.lineTo(i, x);
                gr.moveTo(-x, i);
                gr.lineTo(x, i);
            }

            return gr;

        }

        function renderMouseGrid() {
            var gr = new pixi.Graphics(),
                x = tileSize / 2;
            gr.lineStyle(3, 0x000000, .3);

            gr.blendMode = pixi.BLEND_MODES.OVERLAY;

            gr.moveTo(-x, -x);
            gr.lineTo(x, -x);
            gr.lineTo(x, x);
            gr.lineTo(-x, x);
            gr.lineTo(-x, -x);


            return gr;
        }

        function PixiTilesContainer() {
            pixi.Container.call(this);

            var self = this,
                grid = renderGrid(),
                mouseGrid = renderMouseGrid(),
                tilesGrid = new pixi.Container(),
                mousePos = {
                    x: 0,
                    y: 0
                };

            this.addChild(grid);
            this.addChild(tilesGrid);
            this.addChild(mouseGrid);

            dispatcher.server.tick(function (game) {
                // mainPlayer may not be loaded yet
                if(game.state.mainPlayer){
                    var loc = game.state.mainPlayer.location;
                    grid.x = loc.x * tileSize;
                    grid.y = loc.y * tileSize;
                }
            });

            dispatcher.game.tick(function(frameData){
                var pos = frameData.mousePos.grid;
                mouseGrid.x = pos.x;
                mouseGrid.y = pos.y;

            });

        }

        var o = PixiTilesContainer.prototype = Object.create(pixi.Container.prototype);

        return getInstance();
    });