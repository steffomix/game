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

define('commandRouter', ['config', 'logger', 'underscore'],
    function (config, Logger, _) {

        // predefined router
        var router = {},
            logger = Logger.getLogger('commandRouter');

        logger.setLevel(config.logger.commandRouter || 0);

        return {
            getRouter: _getRouter
        };


        /**
         *
         * @param name
         * @returns {*}
         * @private
         */

        function _getRouter(name){
            if(router[name]){
                return router[name];
            }else{
                var newRouter = new CommandRouter(name);
                name = '' + name;
                logger.info('Create CommandRouter ' + name);
                router[name] = newRouter;
                return newRouter;
            }
        }

        /**
         * Creates a command router instance
         * @param name {string} Only used as logging prefix
         * @constructor
         */
        function CommandRouter (name) {

            var modules = {},
                commandBlacklist = {},
                filter = new Filter();

            this.status = function(){
                logger.info('CommandRouter "' + name + '" Status: ', {
                    filter: filter.getFilter(),
                    blacklist: _.clone(commandBlacklist)
                });
            };

            /**
             * Add module to command receivers list and
             * combines name and command to command 'name.command'.
             * E.g. router.route('moduleName.command', []);
             * @param name {string} command prefix and module name
             * @param module {object}
             * @param commands {object} key<command>:value<boolean enabled> pairs
             */
            this.addModule = function (name, module, commands) {
                if ( modules[name] ) {
                    return logger.error('CommandRouter: Module "' + name + '" already set');
                } else {
                    modules[name] = module;
                    _.each(commands, function(value, key){
                        filter.addFilter(name + '.' + key, value);
                    });
                }
            };

            /**
             * add command to blacklist
             * @param command
             */
            this.deny = function(command){
                commandBlacklist['' + command] = true;
            };

            /**
             *
             * @param job {string} <module>.<command>
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
                if ( commandBlacklist[cmd] || !filter.allow(cmd) ) {
                    return logger.warn('Router ' + name + ' filter out command ' + cmd, args);
                }
                logger.info('Router ' + name + ' route Command: ' + cmd, args);
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
            };


            /**
             * Filter-List of **allowed** commands
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
                self.allow = function(cmd) {
                    return (!!filter[cmd]);
                };

                /**
                 * Add Filter
                 * @param k
                 * @param v
                 * @returns {boolean}
                 */
                self.addFilter = function(k, v) {
                    filter[k] = !!v;
                };

                /**
                 * Return a cloned list of current filters
                 */
                self.getFilter = function(){
                    return _.clone(filter);
                }
            }
        }


    });
