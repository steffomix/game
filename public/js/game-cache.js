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

define('gameCache', ['logger', 'underscore'], function (Logger, _) {

    // Logger.setHandler(Logger.createDefaultHandler({defaultLevel: Logger.DEBUG}));
    // Logger.setLevel(Logger.DEBUG);
    var instance,
        logger = Logger.get('GameData Cache');

    function getInstance(){
        if(!instance){
            instance = new GameCache();
        }
        return instance;
    }

    return getInstance();


    function GameCache(){

        if(instance){
            logger.error('Instance already created');
        }

        var manager,
            config;
        this.init = init;

        function init (mng, conf) {
            manager = mng;
            config = conf;
        }
    }

});
