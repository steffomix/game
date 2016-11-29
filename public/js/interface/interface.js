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


define('interfaceApp', ['config', 'logger', 'backbone', 'underscore', 'gameSocket', 'util'],
    function (config, logger, Backbone, _, socket, groups) {

        var instance;
        return getInstance();
        function getInstance () {
            if ( !instance ) {
                instance = new InterfaceBase();
            }
            return instance;
        }

        function InterfaceBase () {
            this.app = {
                events: _.extend({}, Backbone.Events),
                interfaceGroups: {
                    none: 0,
                    account: 1
                }
            }
        }
    });


define('interface', ['config', 'logger', 'backbone', 'underscore', 'gameSocket',
        'interfaceApp', 'interfaceAccount'],
    function (config, Logger, Backbone, _, socket, app, account) {

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

        function Interface () {

            // Register this at socket to receive commends through
            socket.addModule('interface', this, {
                onConnect: function () {
                    components.showLogin();
                },
                onLogin: function () {

                }
            });

            var components = {
                gameContainer: new (Backbone.View.extend(
                    _.extend(app, {
                        el: $('#game-container'),
                        initialize: function () {
                            this.$el.hide();
                            _.bindAll(this, ['show']);
                        },
                        show: function () {
                            this.$el.show();
                        }
                    })
                ))(),
                account: account
            }

            app.app.events.trigger('showConnect');


        }


    });
