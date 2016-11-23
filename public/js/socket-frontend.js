/* 
 * Copyright (C) 17.11.16 Stefan Brinkmann <steffomix@gmail.com>
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


define('socketFrontend', ['config', 'socket', 'logger', 'underscore'],
    function(config, socket, Logger, _){

    var instance,
        socketManager,
        logger = Logger.getLogger('socketFrontend');
        logger.setLevel(config.logger.socketFrontend || 0);

    return getInstance();

    function getInstance(){
        if(!instance){
            instance = new SocketFrontend();
        }
        return instance;
    }

    function SocketFrontend(){

        if(instance){
            logger.error('Instance already created');
        }

        this.init = function(manager){
            socketManager = manager;
        };

        this.showLogin = function(cmd, host, port){

        };

        this.showConnect = function(cmd, host, port){
            var host = host || config.server.host,
                port = port || config.server.host;

        }

        this.login = function(host, port){
            var data = [host, port];
            logger.trace('Task Slave to send cmd: login', data);

            socket.send('screen.input.showLogin', data);
        }

    }
});
