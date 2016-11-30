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

define('interfaceApp', ['config', 'logger', 'i18n', 'backbone', 'underscore', 'util'],
    function (config, Logger, i18n, Backbone, _, util) {

        var logger = Logger.getLogger('interfaceApp');
        logger.setLevel(config.logger.interfaceApp || 0);

        var views = {},
            accountEvents = _.extend({}, Backbone.Events);

        function registerView (name, view) {
            if(views[name]){
                return logger.error('InterfaceApp::registerView "' + name + '" already set.', view);
            }
            views[name] = view;
        }

        function InterfaceApp () {
            this.registerView = registerView;
            this.accountEvents = accountEvents;
            this.translate = i18n.translate;
            this.util = util;

        }

        return InterfaceApp;
    });

