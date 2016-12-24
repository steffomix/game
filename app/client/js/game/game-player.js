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


define(['config', 'logger', 'pixi'],
    function (config, Logger, pixi) {

        var logger = Logger.getLogger('gamePlayer');
        logger.setLevel(config.logger.gamePlayer || 0);


        var tileSize = config.game.tiles.size;

        function Player(user) {
            this.user = user;
            pixi.Sprite.fromImage.call(this, 'assets/avatars/' + (user.avatar || 'devil.png'));
        }

        var p = Player.prototype = Object.create(pixi.Sprite.prototype);

        p.location = {};
        p.updateLocation = function(loc){
            this.location = loc;
        };
        p.tick = function (gameState) {
            try{
                var px = this.location.x * tileSize,
                    py = this.location.y * tileSize,
                    dx = (px - this.position.x) / 20,
                    dy = (py - this.position.y) / 20;
                this.position.x += dx;
                this.position.y += dy;
            }catch(e){
                logger.error('GamePlayer::updateLocation ', e);
            }
        };

        return Player;

    });

