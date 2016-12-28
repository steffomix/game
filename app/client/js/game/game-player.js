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


define(['config', 'logger', 'debugInfo', 'dataTypes', 'pixi'],
    function (config, Logger, DebugInfo, dataTypes, pixi) {

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
            this.gridPosition = dataTypes.createPosition(this);
            this.debug = new DebugInfo(this).debug;
            // this.interactive = true;
            /*
            this.on('mousedown', function(e){
                console.log('Player mousedown');
                return false;
            });
*/
            this.serverTick = function(gameState){
            };

            this.updateLocation = function(loc){
                self.location = loc;
            }
        }

        var o = Player.prototype = Object.create(pixi.Container.prototype);
        Player.prototype.constructor = Player;
        
        o.frameTick = function(frameData){
            this.debug(this.gridPosition);
            try{
                this.x += (this.location.x * tileSize - this.x) / 20;
                this.y += (this.location.y * tileSize - this.y) / 20;
            }catch(e){
                logger.error('GamePlayer::updateLocation ', e);
            }
        };

        return Player;

    });

