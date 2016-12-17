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

define(['config', 'logger', 'gamePlayer'],
    function (config, Logger, Player) {

        var instance,
            logger = Logger.getLogger('gamePlayerManager');
        logger.setLevel(config.logger.gamePlayerManager || 0);

        return getInstance();

        function getInstance() {
            if (!instance) {
                instance = new GamePlayerManager();
            }
            return instance;
        }

        function GamePlayerManager() {

            players = {};

            this.addPlayer = function(user){
                var name = user.name;
                if(!players[name]){
                    var player = new Player(user);
                    players[name] = player;
                    return player;
                }else{
                    logger.warn('GamePlayerManager: Player ' + name + ' already in Game');
                }
            };

            this.userLocation =  function(data){
                var user = data.user,
                    location = data.location,
                    name = user.name;
                if(players[name]){
                    players[name].updateLocation(location);
                    return players[name];
                }else{
                    logger.warn('Update location of not existing user: ', user);
                    return false;
                }
            }

        }

    });