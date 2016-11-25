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


define('commandFilter', ['config', 'logger'], function (config, Logger) {

        var instance,
            logger = Logger.getLogger('commandFilter');
        logger.setLevel(config.logger.commandFilter || 0);

        return getInstance();

        function getInstance () {
            if ( !instance ) {
                instance = new CommandFilter();
            }
            return instance;
        }

        function CommandFilter () {

            var _filter = {};

            /**
             * Check if command is allowed
             * @param cmd
             * @returns {boolean}
             */
            this.filter = function (cmd) {
                return (!!_filter[cmd]);
            };

            /**
             * Add or overwrite Filter
             * @param k
             * @param v
             * @returns {boolean}
             */
            this.setFilter = function (k, v) {
                _filter[k] = !!v;
            };

            /**
             * Delete filter from list
             * @param k
             */
            this.removeFilter = function (k) {
                delete _filter[k];
            }

        }
    }
);
