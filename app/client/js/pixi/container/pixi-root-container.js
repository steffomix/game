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

define(['config', 'logger', 'jquery', 'dataTypes', 'debugInfo', 'pixi', 'eventDispatcher',
        'pixiTilesContainer',
        'pixiPlayerContainer'
    ],
    function (config, Logger, $, dataTypes, DebugInfo, pixi, dispatcher,
              tilesContainer,
              playerContainer) {

        var instance,
            $body = $('body'),
            logger = Logger.getLogger('pixiRootContainer');
        logger.setLevel(config.logger.pixiRootContainer || 0);

        var tileSize = config.game.tiles.size;

        function createInteractive() {
            var ct = new pixi.Container(),
                gr = new pixi.Graphics(),
                x = 30 * tileSize - tileSize / 2;
            gr.hitArea = new pixi.Rectangle(-x, -x, x * 2, x * 2);
            ct.addChild(gr);
            return gr;

        }

        function PixiRootContainer() {
            pixi.Container.call(this);
            var self = this,
                debug = new DebugInfo(this).debug,
                // where this container has to move
                moveTo = {
                    x: 0,
                    y: 0
                },
                // last raw mousemove position
                mouse = {
                    x: 0,
                    y: 0
                },
                // readonly obj
                mousePosition = dataTypes.createPositionRelative(self, mouse);

            // center container
            this.x = $body.width() / 2;
            this.y = $body.height() / 2;

            this.addChild(tilesContainer);
            this.addChild(playerContainer);
            this.addChild(createInteractive());


            // trigger relative position that fits to root container position
            this.interactive = true;
            this.on('mousemove', function (e) {
                var g = e.data.global;
                mouse.x = g.x;
                mouse.y = g.y;
            });

            this.on('mousedown', function(e){
                logger.info('rootcontainer.interactive: mousedown', mousePosition);
            });



            // get mainPlayer positione
            dispatcher.server.tick(function (gameState) {
                var player = gameState.state.mainPlayer;
                // player may not be loaded yet
                if(player){
                    moveTo.x = $body.width() / 2 - player.location.x * tileSize;
                    moveTo.y = $body.height() / 2 - player.location.y * tileSize;
                }
            });

            // move container to center to mainPlayer
            dispatcher.game.tick(function (frameData) {
                frameData.mousePosition = mousePosition;
                debug(frameData.mousePosition);
                try {
                    self.x += (moveTo.x - self.x) / 30;
                    self.y += (moveTo.y - self.y) / 30;
                } catch (e) {
                    logger.warn('PixiRootContainer::frameTick: ', e);
                }
            });

        }

        PixiRootContainer.prototype = Object.create(pixi.Container.prototype);
        PixiRootContainer.prototype.constructor = PixiRootContainer;


        function getInstance() {
            if (!instance) {
                instance = new PixiRootContainer();
            }
            return instance;
        }

        return getInstance();
    });