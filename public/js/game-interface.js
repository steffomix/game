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


define('interface', ['config', 'logger', 'gameSocket', 'interfaceComponents', 'underscore'],
    function (config, Logger, socket, components, _) {

        var instance,
            logger = Logger.getLogger('interface');
        logger.setLevel(config.logger.interface || 0);


        return getInstance();

        function getInstance () {
            if ( !instance ) {
                instance = new Interface();
            }
            return instance;
        }

        function disconnect () {
            socket.send('server.disconnect', []);
        }

        function Interface () {


            // Register this at socket to receive commends through
            socket.addModule('interface', this, {
                onConnect: 1,
                onLogin: 1
            });

            logger.info('initialize interface components');

            this.onConnect = function(){
                components.showLogin();
            }


            disconnect();
            // start game
            components.showConnect();



        }


    });
