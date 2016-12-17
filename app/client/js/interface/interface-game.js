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


define(['config', 'logger', 'underscore', 'backbone', 'interfaceApp', 'gameApp', 'eventDispatcher'],
    function (config, Logger, _, Backbone, InterfaceApp, GameApp, dispatcher) {

        var instance,
            logger = Logger.getLogger('interfaceLogin');

        logger.setLevel(config.logger.interfaceLogin || 0);


        function getInstance() {
            if (!instance) {
                instance = createLogin();
            }
            return instance;
        }

        function createLogin() {

            return new (Backbone.View.extend(_.extend(new InterfaceApp(), new GameApp(), {
                /**
                 * backbone
                 */
                el: $('#game-stage'),
                events: {},
                initialize: function () {
                    var self = this;
                    // custom events
                    dispatcher.server.disconnect(this, this.hide);
                    dispatcher.server.logout(this, this.hide);
                    dispatcher.server.login(this, this.show);
                    /**
                     * router:
                     * interfaceLogin.login
                     */
                    this.router.addModule('interfaceGame', this, {
                        updateFloor: function(job){
                            this.floor = floorManager.updateFloor(job.data);
                        },
                        userLocation: function(job){

                        }
                    });
                },
                show: function () {
                    this.$el.fadeIn();
                },
                hide: function(){
                    this.$el.fadeOut();
                }

            })))();

        }

        return getInstance();

    });
