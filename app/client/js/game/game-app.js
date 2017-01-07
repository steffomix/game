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

define(['config', 'logger', 'backbone', 'underscore', 'pixi', 'jquery', 'gamePosition', 'eventDispatcher', 'tick'],
    function (config, Logger, Backbone, _, pixi, $, gamePosition, dispatcher, Tick) {

        var instance,
            logger = Logger.getLogger('gameApp');
        logger.setLevel(config.logger.gameApp || 0);


        function GameApp() {

            var self = this,
                modules = {},
                frameTick = new Tick(dispatcher.game.frameTick.claimTrigger(this)),
                workerTick = new Tick(dispatcher.game.workerTick.claimTrigger(this));

            frameTick.fps = config.game.frameTick;
            workerTick.fps = config.game.workerTick;

            this.set = function(id, module){
                modules[id] = module;
            };

            this.get = function(id){
                return modules[id];
            };

            dispatcher.game.initialize(function () {
                // start ticker after initialize is finished
                setTimeout(function(){
                    frameTick.start();
                    workerTick.start();
                }, 100);

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