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


define('socketFrontend', ['logger', 'underscore'], function(Logger, _){

    // Logger.setHandler(Logger.createDefaultHandler({defaultLevel: Logger.DEBUG}));
    // Logger.setLevel(Logger.DEBUG);
    var instance,
        logger = Logger.get('Socket Frontend');


    var instance;

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

        var manager,
            slave,
            config;
        this.init = init;

        function init (mng, slv) {
            manager = mng;
            slave = slv;
            config = slv.config;
        }

        this.login = function(host, port){
            var data = {host: host, port: port};
            logger.debug('Task Slave: login', data);
            slave.send('showScreen.login', data);
        }

    }
});
