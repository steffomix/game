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

define(['config', 'logger', 'pixi'],
    function (config, Logger, pixi) {

        var instance,
            logger = Logger.getLogger('pixiPlayerContainer');
        logger.setLevel(config.logger.pixiPlayerContainer || 0);

        function getInstance() {
            if (!instance) {
                instance = new PixiPlayerContainer();
            }
            return instance;
        }

        function PixiPlayerContainer() {
            pixi.Container.call(this);
            var playerContainer = new pixi.Container(),
                mainPlayerContainer = new pixi.Container();

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

        var o = PixiPlayerContainer.prototype = Object.create(pixi.Container.prototype);
        PixiPlayerContainer.prototype.constructor = PixiPlayerContainer;

        return getInstance();
    });