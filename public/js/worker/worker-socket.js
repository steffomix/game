/* 
 * Copyright (C) 16.11.16 Stefan Brinkmann <steffomix@gmail.com>
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


/**
 * workerSocket
 * Web Worker entry point
 */
define('workerSocket', ['config', 'logger', 'socket'],
    function (config, Logger, socket) {

        var instance,
            logger = Logger.getLogger('workerSocket');
        logger.setLevel(config.logger.workerSocket || 0);

        return getInstance();

        function getInstance () {
            if ( instance === undefined ) {
                instance = new WorkerSocket();

            }
            return instance;
        }


        /**
         *
         * @constructor
         */
        function WorkerSocket () {

            // map workers for apply in method Manager::manage
            // minimal allowed commands
            var self = this,
                modules = {};

            /**
             *
             * @param name
             * @param module
             */
            this.addModule = function(name, module){
                if(modules[name]){
                    logger.warn('workerSocket addModule: Module "' + name + '" already set.');
                }else{
                    modules[name] = module;
                }
            };
            /**
             *
             * @param job
             */
            socket.onMessage = function(job){
                routeMessage.apply(self, [job.cmd, job.data]);
            };


            /**
             *
             * @param cmd
             * @param data
             */
            function routeMessage (cmd, data) {
                var c = cmd.split('.'),
                    c1 = c.shift();
                try {
                    if ( modules[c1] ) {
                        var obj = modules[c1],
                            c2 = c.shift(),
                            fn = modules[c1][c2];
                        // isFunction check from underscore
                        if ( !!(fn && fn.constructor && fn.call && fn.apply) ) {
                            fn.apply(obj, data);
                        }
                    } else {
                        logger.error('Command "' + cmd + '" not supported');
                    }
                } catch (e) {
                    logger.error('Route Message "' + cmd + '" throw error:' + e, data);
                }
            }

        }
    })
;


