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


define('workerManager', ['config', 'logger', 'socket', 'commandRouter', 'server', 'workerSocket', 'gameCache'],
    function (config, Logger, socket, Router, server, workerSocket, gameCache) {

    var instance,
        logger = Logger.getLogger('workerManager');
    logger.setLevel(config.logger.workerManager || 0);

    return getInstance();

    function getInstance () {
        if ( !instance ) {
            instance = new WorkerManager();
        }
        return instance;
    }

    function WorkerManager () {

        // server can send commands to cache
        server.addModule('manager', this);
        // socket can send commands to cache
        workerSocket.addModule('manager', this);


    }
});
