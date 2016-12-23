/*
 * Copyright (C) 17.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'backbone', 'underscore', 'pixi', 'jquery', 'eventDispatcher', 'tick', 'pixiContainer'],
    function (config, Logger, Backbone, _, Pixi, $, dispatcher, Tick, container) {

        var $gameStage = $('#game-stage'), // attach renderer view
            $body = $('body'), // resize window
            tileSize = config.game.tiles.size,

            instance;
        logger = Logger.getLogger('gamePixi');
        logger.setLevel(config.logger.gamePixi || 0);

        var transitions = {
            rootContainer: {
                x: 0,
                y: 0,
                tick: function(){
                    var dx = (this.x - rootContainer.x),
                        dy = (this.y - rootContainer.y);
                    (rootContainer.x += dx / 20);
                    (rootContainer.y += dy / 20);
                }
            }
        };

        /**
         * init pixi container
         */
        var renderer = Pixi.autoDetectRenderer(100, 100, {transparent: 0}),
            rootContainer = container.factory(),
            tilesContainer = container.factory(),
            playerContainer = container.factory(),
            mobilesContainer = container.factory(),
            mainPlayerContainer = container.factory();

        rootContainer.x = $body.width()/ 2;
        rootContainer.y = $body.height()/2;
        rootContainer.addChild(tilesContainer);
        rootContainer.addChild(playerContainer);
        rootContainer.addChild(mobilesContainer);
        rootContainer.addChild(mainPlayerContainer);

        /**
         * init listener and dispatcher
         */
        dispatcher.server.connect(function () {
            $gameStage.html(renderer.view);
        });

        // resize stage
        dispatcher.global.windowResize(function () {
            renderer.resize($body.width(), $body.height());
        });


        function tick(load){
            _.each(transitions, function(tr){
                tr.tick();
            });
            dispatcher.game.tick.trigger();
            renderer.render(rootContainer);
        }

        function setPlayerPosition(pos){

            transitions.rootContainer.x = $body.width() / 2 - pos.x;
            transitions.rootContainer.y = $body.height() / 2 - pos.y;
        }

        /**
         *
         * @param x
         * @param y
         * @param img
         * @returns {Sprite|*}
         */
        function createTile(x, y, img){
            var spr = new Pixi.Sprite(Pixi.Texture.fromImage(img));
            spr.position.x = x * tileSize;
            spr.position.y = y * tileSize;
            spr.anchor.set(.5);
            return spr;
        }

        function GamePixi() {
            this.createTile = createTile;
            this.addTile = function (sprite) {
                tilesContainer.addChild(sprite);
            };
            this.addPlayer = function(sprite){
                playerContainer.addChild(sprite);
            };

            this.setPlayerPosition = setPlayerPosition;
        }

        function getInstance() {
            if (!instance) {
                instance = new GamePixi();
            }
            return instance;
        }

        return getInstance();

    });