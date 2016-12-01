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

define('interface', ['config', 'logger', 'backbone', 'underscore', 'gameSocket', 'interfaceApp','interfaceConnect',
        'interfaceLogin'],
    function (config, Logger, Backbone, _, socket, interfaceApp) {

        var instance,
            logger = Logger.getLogger('interface');
        logger.setLevel(config.logger.interface || 0);

        _.each([

        ], function(module){
            require([module], function(){});
        });

        return getInstance();
        function getInstance () {
            if ( !instance ) {
                instance = new Interface();
            }
            return instance;
        }



        function Interface () {

            new (Backbone.View.extend(_.extend(new interfaceApp(),
                {
                    el: $('#game-container'),
                    initialize: function () {
                        var self = this;
                        window.addEventListener('resize', function () {
                            self.globalEvents.trigger('resizeWindow');
                        });
                        this.accountEvents.trigger('serverDisconnect');

                        this.$el.fadeIn();
                    }
                })
            ))();

        }
    });

