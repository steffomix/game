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

define(['config', 'logger', 'eventDispatcher', 'pixi', 'gameApp'],
    function (config, Logger, dispatcher, pixi, gameApp) {

        var instance,
            logger = Logger.getLogger('pixiPlayerLayer');
        logger.setLevel(config.logger.pixiPlayerLayer || 0);

        function getInstance() {
            if (!instance) {
                instance = new PixiPlayerLayer();
            }
            return instance;
        }

        function PixiPlayerLayer() {
            pixi.Container.call(this);
            var playerContainer = new pixi.Container(),
                mainPlayerContainer = new pixi.Container();

            dispatcher.game.initialize(function(){
                gameApp.addModule('pixiPlayer', this);
            });

            this.addChild(playerContainer);
            this.addChild(mainPlayerContainer);

            this.setMainPlayer = function(player){
                mainPlayerContainer.removeChildren();
                mainPlayerContainer.addChild(player);
            };

            this.addPlayer = function(player){
                playerContainer.addChild(player);
            }

        }

        var o = PixiPlayerLayer.prototype = Object.create(pixi.Container.prototype);
        PixiPlayerLayer.prototype.constructor = PixiPlayerLayer;

        return getInstance();
    });