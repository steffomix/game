/*
 * Copyright (C) 16.12.16 Stefan Brinkmann <steffomix@gmail.com>
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


define(['config', 'logger', 'debugInfo', 'dataTypes', 'pixi', 'gameMobile'],
    function (config, Logger, DebugInfo, dataTypes, pixi, Mobile) {

        var logger = Logger.getLogger('gamePlayer');
        logger.setLevel(config.logger.gamePlayer || 0);


        var tileSize = config.game.tiles.size;

        function Player(user) {
            pixi.Container.call(this);
            var self = this,
                texture = pixi.Texture.fromImage('assets/avatars/' + (user.avatar || 'devil.png')),
                sprite = new pixi.Sprite(texture);
            sprite.anchor.set(.5);

            this.addChild(sprite);
            this.name = user.name;
            this.location = new dataTypes.Location();
            this.gamePosition = dataTypes.createPosition(this);
            this.debug = new DebugInfo(this).debug;

            this.updateLocation = function(loc){
                self.location = loc;
            }
        }

        var o = Player.prototype = Object.create(Mobile.prototype);
        Player.prototype.constructor = Player;
        


        return Player;

    });

