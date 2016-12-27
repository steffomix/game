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


define(['config', 'logger', 'pixi', 'pixiPlayerContainer', 'eventDispatcher'],
    function (config, Logger, pixi, playerContainer, dispatcher) {

        var logger = Logger.getLogger('gamePlayer');
        logger.setLevel(config.logger.gamePlayer || 0);


        var tileSize = config.game.tiles.size;

        function MainPlayer(user){
            Player.call(this, user);
            this.mainPlayer = true;
        }
        MainPlayer.prototype = Object.create(Player.prototype);
        MainPlayer.prototype.constructor = MainPlayer;



        function Player(user) {
            var self = this;
            var texture = pixi.Texture.fromImage('assets/avatars/' + (user.avatar || 'devil.png'));
            pixi.Sprite.call(this, texture);
            this.anchor.set(.5);

            this.name = user.name;
            this.id = user.id;

            this.frameTick = function(frameData){

                try{
                    self.x += (self.location.x * tileSize - self.x) / 90 > 0 ? 1 : -1;
                    self.y += (self.location.y * tileSize - self.y) / 90 > 0 ? 1 : -1;
                }catch(e){
                    logger.error('GamePlayer::updateLocation ', e);
                }
            };


            this.interactive = true;
            this.on('click', function(){
                console.log('click');
            });

            dispatcher.game.clickGrid(function(mousePosition){
                var grid = mousePosition.grid;
                logger.info('click grid', grid);
                self.location.x = grid.x;
                self.location.y = grid.y;
            });


            this.serverTick = function(gameState){

            };

            this.updateLocation = function(loc){
                //self.location = loc;
            }
        }

        var o = Player.prototype = Object.create(pixi.Sprite.prototype);
        Player.prototype.constructor = Player;

        o.location = {
            area_id: 0,
            world_id: 0,
            x: 0,
            y: 0,
            z: 0
        };

        return Player;

    });

