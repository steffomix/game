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

define('commandRouter', ['config', 'logger'],
    function (config, Logger) {

        var logger = Logger.getLogger('commandRouter');
        logger.setLevel(config.logger.commandRouter || 0);


        function CommandRouter (name) {

            var modules = {},
                filter = new Filter();

            /**
             * Set allowed command
             * @type {string}
             */
            this.setFilter = filter.setFilter;


            this.removefilter = filter.removeFilter;

            this.addModule = function (key, module) {
                if ( modules[key] ) {
                    logger.warn('CommandRouter: Module "' + key + '" already set');
                } else {
                    modules[key] = module;
                }
            };

            /**
             *
             * @param cmd {string} <module>.<command>
             * @param args {array} [args...]
             */
            this.route = function (job, args) {
                var cmd;
                if ( typeof job === 'string' ) {
                    cmd = job;
                } else {
                    cmd = job.cmd;
                    args = job.data;
                }
                if ( !filter.filter(cmd) ) {
                    logger.warn('Router ' + name + ' filter out command ' + cmd, args);
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


            /**
             * Filter-List of **allowed** commands
             *
             * @param commands {string || object} Object keys should have a true value to enable command.
             * @param value {bool} only required when command is a string.
             *
             * @constructor
             */

            function Filter () {

                var filter = {},
                    self = this;

                /**
                 * Check if command is allowed
                 * @param cmd
                 * @returns {boolean}
                 */
                self.filter = function(cmd) {
                    return (!!filter[cmd]);
                };

                /**
                 * Add or overwrite Filter
                 * @param k
                 * @param v
                 * @returns {boolean}
                 */
                self.setFilter = function(k, v) {
                    filter[k] = !!v;
                };

                /**
                 * Delete filter from list
                 * @param k
                 */
                self.removeFilter = function(k) {
                    delete filter[k];
                }
            }
        }

        return CommandRouter;

    });
