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

define(['config', 'logger', 'underscore', 'eventDispatcher', 'gamePlayer', 'pixiPlayerContainer'],
    function (config, Logger, _, dispatcher, Player, playerContainer) {

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

            var mainPlayer = '',
                players = {};

            dispatcher.server.login(function (user) {
                reset();
                var player = new Player(user);
                playerContainer.setMainPlayer(player);
                players[user.name] = player;
                mainPlayer = user.name;
            });

            dispatcher.server.logout(function(){
                reset();
                mainPlayer = '';
            });

            dispatcher.game.tick(function(frameData){
                _.each(players, function(p){
                    p.frameTick(frameData);
                })
            });

            dispatcher.server.tick(function (gameState) {

                var locations = gameState.received.locations;

                // set mainPlayer to gameState
                players[mainPlayer] && (gameState.state.mainPlayer = players[mainPlayer]);


                // create not existing Players
                if (locations) {
                    _.each(locations, function (location, name) {
                        if(!players[name]){
                            location.name = name
                            addPlayer(location);
                        }
                    });
                }
                // remove players without location except mainPlayer and update with serverData
                _.each(players, function (player) {
                    try {
                        if (!locations[player.name] && player.name != mainPlayer) {
                            removePlayer(player.name);
                        }else{
                            // locations may not have been send yet
                            locations[player.name] && player.updateLocation(locations[player.name], gameState);
                            player.serverTick(gameState);
                        }
                    } catch (e) {
                        logger.error('PlayerManager.serverTick: ', e, gameState);
                    }
                });
            });

            function reset() {
                _.each(players, function (player) {
                    try {
                        removePlayer(player.name);
                    } catch (e) {
                        logger.error('PlayerManager::reset: ', e, player);
                    }
                });
                players = {};
            }

            function addPlayer(user) {
                try{
                    if (!players[user.name]) {
                        var player = new Player(user);
                        players[user.name] = player;
                        playerContainer.addPlayer(player);
                    } else {
                        logger.warn('GamePlayerManager: Player ' + name + ' already in Game');
                    }
                }catch(e){
                    logger.error('PlayerManager::addPlayer ', e, user);
                }

            }

            function removePlayer(name) {
                if (players[name]) {
                    var player = players[name];
                    player.destroy();
                    delete players[player.name];
                    logger.info('Player ' + player.name + ' left the Game');
                }
            }


        }

    });