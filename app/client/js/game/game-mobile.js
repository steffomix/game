/*
 * Copyright (C) 01.01.17 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'debugInfo', 'pixi', 'dataTypes'],
    function (config, Logger, DebugInfo, pixi, dataTypes) {

        var logger = Logger.getLogger('gameMobile');
        logger.setLevel(config.logger.gameMobile || 0);

        var tileSize = config.game.tiles.size;

        function Mobile(user) {
            pixi.Container.call(this);
            var self = this,
                texture = pixi.Texture.fromImage('assets/avatars/' + (user.avatar || 'devil.png')),
                sprite = new pixi.Sprite(texture);

            sprite.anchor.set(.5);



            this.addChild(sprite);
            this.name = user.name;
            this.location = new dataTypes.Location();
            this.gamePosition = dataTypes.gamePosition(this);

            this.updateLocation = function (loc) {
                //self.location = loc;
            };

        }

        var o = Mobile.prototype = Object.create(pixi.Container.prototype);
        Mobile.prototype.constructor = Mobile;


        o.onMouseDown = o.onMouseUp = o.onMouseMove = o.tick = function () {
        };

        return Mobile;

    });