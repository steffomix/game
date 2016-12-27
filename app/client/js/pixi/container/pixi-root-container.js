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

define(['config', 'logger', 'jquery', 'dataTypes', 'pixi', 'eventDispatcher',
        'pixiTilesContainer',
        'pixiPlayerContainer'
    ],
    function (config, Logger, $, dataTypes, pixi, dispatcher,
              tilesContainer,
              playerContainer) {

        var instance,
            $body = $('body'),
            logger = Logger.getLogger('pixiRootContainer');
        logger.setLevel(config.logger.pixiRootContainer || 0);

        var tileSize = config.game.tiles.size;


        function PixiRootContainer() {
            pixi.Container.call(this);
            var self = this,
                mouseMoveTrigger = dispatcher.game.mouseMove.claimTrigger(this),
                // where this container has to move
                moveTo = {
                    x: 0,
                    y: 0
                },
                // last raw mouse move position
                mouse = {
                    x: 0,
                    y: 0
                };

            this.x = $body.width() / 2;
            this.y = $body.height() / 2;

            this.addChild(tilesContainer);
            this.addChild(playerContainer);

            this.interactive = true;

            // trigger relative position that fits to root container position
            this.on('mousemove', function (e) {
                var g = e.data.global;
                mouse.x = g.x;
                mouse.y = g.y;
                mouseMoveTrigger(getMousePosition());
            });



            function getMousePosition(){
                return new dataTypes.MousePosition(mouse.x - self.x, mouse.y - self.y);
            }


            dispatcher.server.tick(function (gameState) {
                var player = gameState.state.mainPlayer;
                // player may not be loaded yet
                if(player){
                    moveTo.x = $body.width() / 2 - player.location.x * tileSize;
                    moveTo.y = $body.height() / 2 - player.location.y * tileSize;
                }
            });

            dispatcher.game.tick(function (frameData) {
                try {
                    self.x += (moveTo.x - self.x) / 100;
                    self.y += (moveTo.y - self.y) / 100;
                } catch (e) {
                    logger.warn('PixiRootContainer::frameTick: ', e);
                }
                frameData.mousePosition = getMousePosition();
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