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

define(['config', 'logger', 'gameSocket', 'gameRouter'],
    function (config, Logger, socket, router) {

        var logger = Logger.getLogger('player');
        logger.setLevel(config.logger.player || 0);


        function Player(user) {
            this.id = user.id;
            this.name = user.name;
            this.location = {
                world_id: 1,
                area_id: 1,
                x: 0,
                y: 0,
                z: 0
            };

        }

        Player.prototype = {
            updateLocation: function(loc){
                this.location = loc;
            }

        };

        return Player;

    });