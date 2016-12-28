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

define(['config', 'logger', 'backbone', 'underscore', 'pixi', 'jquery', 'dataTypes', 'eventDispatcher', 'tick', 'pixiRootContainer'],
    function (config, Logger, Backbone, _, Pixi, $, dataTypes, dispatcher, Tick, rootContainer) {

        var instance,
            logger = Logger.getLogger('pixiApp');
        logger.setLevel(config.logger.pixiApp || 0);


        function FrameData(){

        }
        FrameData.prototype = {
            mousePosition: new dataTypes.createPosition({x: 0, y: 0})
        };


        function PixiApp() {

            var renderer = Pixi.autoDetectRenderer(100, 100, {transparent: 1}),
                $gameStage = $('#game-stage'),
                frameTicker = new Tick(tick),
                frameTrigger = dispatcher.game.tick.claimTrigger(this),
                $body = $('body'),
                frameData = new FrameData();

            frameTicker.fps = config.game.fps;

            function tick(load) {
                frameData.gameLoad = load;
                frameTrigger(frameData);
                renderer.render(rootContainer);
            }

            /**
             * init listener and dispatcher
             */
            dispatcher.server.connect(function () {
                $gameStage.html(renderer.view);
                frameTicker.start();
            });

            // resize stage
            dispatcher.global.windowResize(function () {
                renderer.resize($body.width(), $body.height());
            });


        }

        function getInstance() {
            if (!instance) {
                instance = new PixiApp();
            }
            return instance;
        }

        return getInstance();

    });