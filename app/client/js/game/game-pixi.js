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

define(['config', 'logger', 'backbone', 'underscore', 'pixi', 'jquery', 'eventDispatcher', 'gameTick', 'gamePlayerManager'],
    function (config, Logger, Backbone, _, Pixi, $, dispatcher, GameTicker, playerManager) {

        var $gameStage = $('#game-stage'), // attach renderer view
            $body = $('body'), // resize window
            gameTicker = new GameTicker(tick), // high frequency ticker for render and animation transitions
            tileSize = config.game.tiles.size,
            instance;
        logger = Logger.getLogger('gamePixi');
        logger.setLevel(config.logger.gamePixi || 0);


        /**
         * init pixi container
         */
        var renderer = Pixi.autoDetectRenderer(100, 100, {transparent: 0}),
            rootContainer = new Pixi.Container(),
            tilesContainer = new Pixi.Container(),
            playerContainer = new Pixi.Container();

        rootContainer.addChild(tilesContainer);
        rootContainer.addChild(playerContainer);

        /**
         * init listener and dispatcher
         */
        dispatcher.server.connect(function () {
            $gameStage.html(renderer.view);
            gameTicker.start();
        });

        // resize stage
        dispatcher.global.windowResize(function () {
            renderer.resize($body.width(), $body.height());
        });

        /**
         * 20fps ticker
         */
        function tick(){
            dispatcher.game.tick.trigger();
            centerContainer();
            renderer.render(rootContainer);
        }

        function centerContainer(){
            try{

                var pos = playerManager.player.position,
                    px = pos.x,
                    py = pos.y,
                    wx = $body.width() / -2,
                    wy = $body.height() / -2;

                rootContainer.x = wx - px;
                rootContainer.y = wy - py;

            }catch(e){
                //logger.warn('Center container failed ', e);
            }
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
            }
        }

        function getInstance() {
            if (!instance) {
                instance = new GamePixi();
            }
            return instance;
        }

        return getInstance();

    });