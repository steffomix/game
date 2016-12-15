/* 
 * Copyright (C) 18.11.16 Stefan Brinkmann <steffomix@gmail.com>
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

define('workerRouter', ['commandRouter'], function (commandRouter) {

    var instance;
    return getInstance();
    function getInstance() {
        if (!instance) {
            try {
                instance = commandRouter.getRouter('WorkerRouter');
            } catch (e) {
                console.log('Module workerRouter create Instance: ', e);
            }

        }
        return instance;
    }

});

define('serverRouter', ['commandRouter'], function (commandRouter) {

    var instance;
    return getInstance();
    function getInstance() {
        if (!instance) {
            try {
                instance = commandRouter.getRouter('ServerRouter');
            } catch (e) {
                console.log('Module serverRouter create Instance: ', e);
            }
        }
        return instance;
    }

});

define('cache', ['config', 'logger', 'underscore', 'workerSocket', 'workerRouter', 'server', 'serverRouter', 'floorManager'],
    function (config, Logger, _, workerSocket, workerRouter, server, serverRouter, floorManager) {

        var instance,
            logger = Logger.getLogger('gameCache');
        logger.setLevel(config.logger.gameCache || 0);

        logger.info('Load Interfaces');


        return getInstance();

        function getInstance() {
            if (!instance) {
                instance = new GameCache();
            }
            return instance;
        }


        function GameCache() {
            // register at game-websocket to receive commands
            workerRouter.addModule('cache', this);
            // register at server socket to receive commands
            serverRouter.addModule('cache', this, {
                onUpdateFloor: function (job) {
                    id = job.data
                    floorManager.updateFloor()
                }
            });

        }

    });

