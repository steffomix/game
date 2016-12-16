/* 
 * Copyright (C) 20.11.16 Stefan Brinkmann <steffomix@gmail.com>
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




define('gameManager',
    ['config', 'logger', 'gameSocket', 'gameRouter', 'underscore', 'interfaceApp', 'gameFloor'],
    function (config, Logger, socket, router, _, interfaceApp, Floor) {

        var instance,
            logger = Logger.getLogger('gameManager');
        logger.setLevel(config.logger.gameManager || 0);

        return getInstance();

        function getInstance () {
            if ( !instance ) {
                instance = new GameManager();
            }
            return instance;
        }

        /**
         * GameManager
         * @constructor
         */
        function GameManager () {
            var floors = {};

            router.addModule('game', this, {
                updateFloor: function(job){
                    var tiles = job.data;
                }
            });

            function updateFloor(data){
                var area =  data.area_id,
                    world = data.world_id,
                    z = data.z,
                    id = world + '_' + area + '_' + z;

                if(!floors[id]){
                    floors[id] = new Floor(data);
                }else{
                    floor[id].updateAllTiles(data.tiles);
                }
            }

        }

    });



