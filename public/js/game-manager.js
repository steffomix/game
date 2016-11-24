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
    ['config', 'logger', 'gameSocket', 'interface'],
    function (config, Logger, gameSocket, interface) {

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

        function User(user){
            this.getName =  function(){
                return user.name;
            }
        }


        /**
         * GameManager
         * @constructor
         */
        function GameManager () {

            gameSocket.addModule('game', this);

            interface.reset();

        }

    });

/*
 M = Backbone.Model.extend();
 C = Backbone.Collection.extend({
 model: M,
 comparator: function(m) {
 return -m.get('date').getTime();
 }
 });

 var c = new C();
 c.add([
 { date: new Date(2011,  0, 10) },
 { date: new Date(2010,  1, 11) },
 { date: new Date(2012, 11, 23) },
 { date: new Date(2009,  6,  6) },
 { date: new Date(2000,  8,  1) },
 ]);
 for(var i = 0; i < c.models.length; ++i)
 console.log(c.models[i].get('date'));
 */


