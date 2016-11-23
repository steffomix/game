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

define('gameCache', ['config', 'logger', 'serverSocket', 'workerSocket', 'underscore'],
    function (config, Logger, serverSocket, workerSocket, _) {

    var instance,
        logger = Logger.getLogger('gameCache');
        logger.setLevel(config.logger.gameCache || 0);

    function getInstance(){
        if(!instance){
            instance = new GameCache();
        }
        return instance;
    }

    return getInstance();

    function GameCache(){

        serverSocket.addModule('gameCache', this);
        workerSocket.addModule('gameCache', this);

    }

});
