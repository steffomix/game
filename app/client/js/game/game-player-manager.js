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

define(['config', 'logger', 'underscore', 'gamePlayer'],
    function (config, Logger, _, player) {

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

            var players = {};

            this.reset = function(){
                players = {};
            };


            this.addPlayer = function(user){
                var name = user.name;
                if(!players[name]){
                    var pl = player.factory(user);
                    players[name] = pl;
                    return pl;
                }else{
                    logger.warn('GamePlayerManager: Player ' + name + ' already in Game');
                }
            };

            this.playerLocations =  function(locations){
                _.each(locations, function(loc, name){
                    try{
                        if(players[name]){
                            players[name].location = loc;
                        }else{
                            // logger.warn('Update location of not existing user: ', name, loc);
                        }
                    }catch(e){
                        logger.error('Update Player location failed: ', e);
                    }

                })
            }

        }

    });