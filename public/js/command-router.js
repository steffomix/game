/* 
 * Copyright (C) 24.11.16 Stefan Brinkmann <steffomix@gmail.com>
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

define('commandRouter', ['config', 'logger'], function (config, Logger) {
    var logger = Logger.getLogger('commandRouter');
    logger.setLevel(config.logger.commandRouter || 0);

    function CommandRouter (name) {

        var modules = {};

        this.addModule = function (key, module) {
            if ( modules[key] ) {
                logger.warn('CommandRouter: Module "' + key + '" already set');
            }else{
                modules[key] = module;
            }
        };

        this.removeModule = function(key) {
            delete modules[key];
        };

        /**
         *
         * @param cmd {string} <module>.<command>
         * @param args {array} [args...]
         */
        this.route = function (job, args) {
            var cmd;
            if(typeof job === 'string'){
                cmd = job;
            }else{
                cmd = job.cmd;
                args = job.data;
            }
            logger.info('Router ' + name + ' route Command: "' + cmd + '" with: ' + args);
            var c = cmd.split('.'),
                c1 = c.shift();
            try {
                if ( modules[c1] ) {
                    var obj = modules[c1],
                        c2 = c.shift(),
                        fn = modules[c1][c2];
                    // isFunction check from underscore
                    if ( !!(fn && fn.constructor && fn.call && fn.apply) ) {
                        fn.apply(obj, args);
                    }
                } else {
                    logger.error('Command target "' + cmd + '" not found', args);
                }
            } catch (e) {
                logger.error('Route Message "' + cmd + '" throw error:' + e, args);
            }
        }
    }

    return CommandRouter;

});
