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

define(['config', 'logger', 'backbone', 'underscore', 'pixi', 'jquery', 'dataTypes', 'eventDispatcher', 'tick'

    ],
    function (config, Logger, Backbone, _, Pixi, $, dataTypes, dispatcher, Tick) {

        var instance,
            logger = Logger.getLogger('gameApp');
        logger.setLevel(config.logger.gameApp || 0);


        function GameApp() {

            var self = this,
                renderer = Pixi.autoDetectRenderer(100, 100, {transparent: 1}),
                ticker = new Tick(dispatcher.game.tick.claimTrigger(this)),
                $body = $('body');

            ticker.fps = config.game.fps;
            // add getter to this that represents the module
            this.addModule = function (name, mod) {
                if (self[name]) {
                    return logger.error('GameApp Module ' + name + ' already set', self[name], mod);
                }
                Object.defineProperty(self, name, {
                    get: function () {
                        return mod;
                    }
                });

            };

            this.setMainPlayer = function(player){
                Object.defineProperty(self, 'mainPlayer', {
                    get: function () {
                        return player;
                    }
                });
            };


            dispatcher.game.initialize(function () {
                // start ticker when initialize is finished
                setTimeout(ticker.start, 0);
            });


        }

        function getInstance() {
            if (!instance) {
                instance = new GameApp();
                dispatcher.game.initialize.trigger();
            }
            return instance;
        }

        return getInstance();

    });