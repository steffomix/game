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

define(['config', 'logger', 'backbone', 'underscore', 'pixi', 'jquery', 'eventDispatcher'],
    function (config, Logger, Backbone, _, Pixi, $, dispatcher) {

        var $gameStage = $('#game-stage'),
            $body = $('body'),
            instance,
            autoRender = true;
            logger = Logger.getLogger('gamePixi');
        logger.setLevel(config.logger.gamePixi || 0);

        /**
         * init pixi container
         */
        var renderer = Pixi.autoDetectRenderer(1,1,{transparent : true}),
            rootContainer = new Pixi.Container(),
            tilesContainer = new Pixi.Container(),
            playerContainer = new Pixi.Container();

        rootContainer.addChild(tilesContainer);
        rootContainer.addChild(playerContainer);

        function render(){
            renderer.render(rootContainer);
            if(autoRender){
                setTimeout(render, 100);
            }
        }
        /**
         * init listener and dispatcher
         */
        _.extend(Backbone.Events, {
            init: function () {

                dispatcher.server.login(this, render);

                // attach pixi renderer to view
                dispatcher.server.connect(this, function () {
                    $gameStage.html(renderer.view);

                });

                // resize stage
                dispatcher.global.windowResize(this, function () {
                    renderer.resize($body.width(), $body.height());
                });

            }
        }).init();


        function GamePixi() {
            this.addTile = function(sprite) {
                tilesContainer.addChild(sprite);

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