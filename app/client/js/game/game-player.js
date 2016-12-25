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


define(['config', 'logger', 'pixi', 'pixiPlayerContainer'],
    function (config, Logger, pixi, playerContainer) {

        var logger = Logger.getLogger('gamePlayer');
        logger.setLevel(config.logger.gamePlayer || 0);


        var tileSize = config.game.tiles.size;

        function Player(user) {
            var self = this;
            pixi.Sprite.call(this, pixi.Texture.fromImage('assets/avatars/' + (user.avatar || 'devil.png')));
            this.anchor.set(.5);

            playerContainer.setMainPlayer(this);
            this.name = user.name;
            this.id = user.id;
            this.interactive = true;

            this.on('click', function(){
                logger.warn('player clicket');
            });

            this.frameTick = function(frameData){
                try{
                    self.x += (self.location.x * tileSize - self.x) / 20;
                    self.y += (self.location.y * tileSize - self.y) / 20;
                }catch(e){
                    logger.error('GamePlayer::updateLocation ', e);
                }
            };

            function mv(){
                self.location.x = Math.round(Math.random() * 10 - 5);
                self.location.y = Math.round(Math.random() * 10 - 5);
                setTimeout(mv, 3000);
            }
            mv();

            this.serverTick = function(gameState){

            };

            this.updateLocation = function(loc){
                //self.location = loc;
            }
        }

        var o = Player.prototype = Object.create(pixi.Sprite.prototype);

        o.location = {
            area_id: 0,
            world_id: 0,
            x: 0,
            y: 0,
            z: 0
        };

        return Player;

    });

