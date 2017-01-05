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

define(['config', 'logger', 'jquery', 'dataTypes', 'debugInfo', 'pixi', 'tween', 'eventDispatcher', 'gameApp',
        'pixiTilesLayer',
        'pixiPlayerLayer'],
    function (config, Logger, $, dataTypes, DebugInfo, pixi, tween, dispatcher, gameApp,
              playerContainer,
              tilesContainer) {

        var instance,
            renderer = pixi.autoDetectRenderer(100, 100, {transparent: 1}),
            $gameStage = $('#game-stage'),
            $body = $('body'),
            tileSize = config.game.tiles.size,
            scale = config.game.tiles.scale,
            logger = Logger.getLogger('pixiRootLayer');
        logger.setLevel(config.logger.pixiRootLayer || 0);


        function createInteractive() {
            var ct = new pixi.Container(),
                gr = new pixi.Graphics(),
                x = 30 * tileSize - tileSize / 2;
            gr.hitArea = new pixi.Rectangle(-x, -x, x * 2, x * 2);
            ct.addChild(gr);
            return gr;

        }

        function PixiRootLayer() {
            pixi.Container.call(this);

            this.addChild(playerContainer);
            this.addChild(tilesContainer);
            this.addChild(createInteractive());
            this.interactive = true;
            this.setTransform(0, 0, scale, scale);


            // center container


            // mouse events
            this.on('mousemove', onMouseMove)
                .on('mousedown', onMouseDown)
                .on('mouseup', onMouseUp)
                // touch events
                .on('touchmove', onMouseMove)
                .on('touchstart', onMouseDown)
                .on('touchend', onMouseUp);

            function onMouseMove(e) {
                lastMouseMove.x = e.data.global.x;
                lastMouseMove.y = e.data.global.y;
                dispatcher.game.mousemove.trigger(mousePosition, e);
            }

            function onMouseDown(e) {
                mouseDown = true;
                dispatcher.game.mousedown.trigger(mousePosition, e);
            }

            function onMouseUp(e) {
                mouseDown = false;
                dispatcher.game.mouseup.trigger(mousePosition, e);
            }

            var self = this,
                debug = new DebugInfo(this, -200, 0).debug,
                // last raw mousemove position
                lastMouseMove = {
                    x: 0,
                    y: 0
                },
                mouseDown = false,
                mousePosition = dataTypes.gamePositionRelative(self, lastMouseMove),
                gamePosition = dataTypes.gamePosition({
                    get x() {
                        return (self.x / scale) - $body.width() / 2 / scale;
                    },
                    get y() {
                        return (self.y / scale) - $body.height() / 2 / scale;
                    }
                }),
                moveTo = {
                    x: 0,
                    y: 0
                },
                playerOffset = {
                    get x() {
                        return gamePosition.x - moveTo.x;
                    },
                    get y() {
                        return gamePosition.y - moveTo.y;
                    }
                };

            // mouse down event
            Object.defineProperty(mousePosition, 'isDown', {
                get: function () {
                    return mouseDown;
                }
            });


            // move container to center of mainPlayer
            dispatcher.game.tick(function () {
                var mainPlayer = gameApp.mainPlayer || {x: 0, y: 0};
                moveTo.x = mainPlayer.x * -1;
                moveTo.y = mainPlayer.y * -1;
                var diff = gamePosition.diff(moveTo, .1, .1);

                //gameApp.mainPlayer && gameApp.mainPlayer.debug(lastMouseMove);

                self.x += diff.x / 25;
                self.y += diff.y / 25;

                renderer.render(self);
            });

            dispatcher.game.initialize(function () {
                $gameStage.html(renderer.view);
                logger.info('Game initialize pixiRootLayer');
                gameApp.addModule('pixiRoot', {
                    position: gamePosition
                });
                gameApp.addModule('mouse', {
                    position: mousePosition,
                    get isDown() {
                        return mouseDown;
                    }
                });
                gameApp.addModule('screen', {

                    get witdth() {
                        return $body.width();
                    },
                    get height() {
                        return $body.height();
                    },
                    get playerOffset() {
                        return playerOffset;
                    }
                })
            });

            // resize stage
            dispatcher.global.windowResize(function () {
                renderer.resize($body.width(), $body.height());
            });


        }

        PixiRootLayer.prototype = Object.create(pixi.Container.prototype);
        PixiRootLayer.prototype.constructor = PixiRootLayer;


        function getInstance() {
            if (!instance) {
                instance = new PixiRootLayer();
            }
            return instance;
        }

        return getInstance();
    });