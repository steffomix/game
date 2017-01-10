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

define(['config', 'logger', 'jquery', 'gameRouter', 'gameSocket', 'gamePosition', 'debugInfo', 'pixi', 'tween', 'eventDispatcher', 'gameApp',
        'pixiTiles',
        'pixiPlayers'],
    function (config, Logger, $, router, socket, position, DebugInfo, pixi, tween, dispatcher, gameApp,
              playerContainer,
              tilesContainer) {

        var instance,
            renderer = pixi.autoDetectRenderer(100, 100, {transparent: 1}),
            // renderer = new pixi.CanvasRenderer(100, 100, {transparent: 1}),
            $gameStage = $('#game-stage'),
            $body = $('body'),
            tileSize = config.game.tiles.size,
            scale = config.game.tiles.scale,
            logger = Logger.getLogger('pixiRoot');
        logger.setLevel(config.logger.pixiRoot || 0);


        function createGlobalHitbox() {
            var ct = new pixi.Container(),
                gr = new pixi.Graphics(),
                x = 30 * tileSize - tileSize / 2;
            gr.hitArea = new pixi.Rectangle(-x, -x, x * 2, x * 2);
            ct.addChild(gr);
            return gr;

        }

        function PixiRootLayer() {
            pixi.Container.call(this);

            var self = this,
                dispatchMouseMove = dispatcher.game.mouseMove.claimTrigger(this),
                dispatchMouseUp = dispatcher.game.mouseUp.claimTrigger(this),
                dispatchMouseDown = dispatcher.game.mouseDown.claimTrigger(this),
                debug = new DebugInfo(this, -200, 0).debug,
                // last raw mousemove position
                lastMouseMove = {
                    x: 0,
                    y: 0
                },
                lastMouseMoveWorker = {
                    x: 0,
                    y: 0
                },
                mouseDown = false,
                mousePosition = position.factory(self, lastMouseMove),
                gamePosition = position.factory({
                    get x() {
                        return (self.x / scale) - $body.width() / 2 / scale;
                    },
                    get y() {
                        return (self.y / scale) - $body.height() / 2 / scale;
                    }
                }),
                playerOffset = {
                    get x() {
                        return gamePosition.x - moveTo.x;
                    },
                    get y() {
                        return gamePosition.y - moveTo.y;
                    }
                };

            // add layers
            this.addChild(playerContainer);
            this.addChild(tilesContainer);
            this.addChild(createGlobalHitbox());

            // catch all mouse events
            this.interactive = true;
            this.setTransform(0, 0, scale, scale);

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
                dispatchMouseMove(mousePosition, e);
            }


            function onMouseDown(e) {
                updatePath();
                socket.send('mainPlayer.mouseMove', positionSocket());
                mouseDown = true;
                dispatchMouseDown(mousePosition, e);
            }

            function onMouseUp(e) {
                socket.send('mainPlayer.mouseUp', positionSocket());
                mouseDown = false;
                dispatchMouseUp(mousePosition, e);
            }

            //dispatcher.game.workerTick(updatePath);

            function updatePath() {
                if (gameApp.get('mainPlayer') && (lastMouseMoveWorker.x != lastMouseMove.x || lastMouseMoveWorker.y != lastMouseMove.y)) {
                    lastMouseMoveWorker.x = lastMouseMove.x;
                    lastMouseMoveWorker.y = lastMouseMove.y;
                    socket.send('mainPlayer.mouseMove', positionSocket());
                }
            }

            function positionSocket() {
                return {
                    gamePosition: gamePosition.socket,
                    mousePosition: mousePosition.socket,
                    playerPosition: gameApp.get('mainPlayer').gamePosition.socket,
                    isDown: mouseDown
                }
            }

            // mouse down event
            Object.defineProperty(mousePosition, 'isDown', {
                get: function () {
                    return mouseDown;
                }
            });

            /**
             *
             * @param self {{x, y}}
             * @param smooth {number}
             * @returns {{x, y}}
             */
            function smoothie(self, smooth) {
                return {
                    get x() {
                        return self.x;
                    },
                    set x(x) {
                        self.x += (x - self.x) / smooth;
                    },
                    get y() {
                        return self.y;
                    },
                    set y(y) {
                        self.y += (y - self.y) / smooth;
                    },
                    /**
                     * @param pos {{x, y}}
                     */
                    move: function (pos) {
                        this.x = pos.x;
                        this.y = pos.y;
                    }

                }
            }

            var moveTarget = {x: 0, y: 0},
                // the heigher the slower
                move = smoothie(this, 100);

            // move container to center of mainPlayer
            dispatcher.game.frameTick(function () {
                return;
                var mainPlayer = gameApp.get('mainPlayer') || {x: 0, y: 0};
                moveTarget.x = mainPlayer.x * -1;
                moveTarget.y = mainPlayer.y * -1;
                moveAcc.move(gamePosition.diff(moveTarget, .2, .2));
                move.move(moveAcc);
                debug(moveTarget);

                renderer.render(self);
            });


            var moveTo = {
                    x: 0,
                    y: 0
                },
                moveAcc = smoothie({x: 0, y: 0}, 10),
                // the heigher the slower
                moveSpeed = 100;

            // move container to center of mainPlayer
            dispatcher.game.frameTick(function () {

                var mainPlayer = gameApp.get('mainPlayer') || {x: 0, y: 0};
                moveTo.x = mainPlayer.x * -1;
                moveTo.y = mainPlayer.y * -1;
                var diff = gamePosition.diff(moveTo, .2, .2);
                moveAcc.move(diff);

                self.x += moveAcc.x / moveSpeed;
                self.y += moveAcc.y / moveSpeed;

                renderer.render(self);
            });

            dispatcher.game.initialize(function () {
                $gameStage.html(renderer.view);
                logger.info('Game initialize pixiRoot');
                gameApp.set('pixiRoot', {
                    position: gamePosition
                });
                gameApp.set('mouse', {
                    position: mousePosition,
                    get isDown() {
                        return mouseDown;
                    }
                });
                gameApp.set('screen', {

                    get width() {
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
                new pixi.Container().addChild(instance);
            }
            return instance;
        }

        return getInstance();
    });