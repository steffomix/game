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


define(['config', 'logger', 'underscore', 'backbone', 'interfaceApp', 'eventDispatcher', 'pixi', 'gameFloorManager'],
    function (config, Logger, _, Backbone, interfaceApp, dispatcher, Pixi, floorManager) {

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

            return new (Backbone.View.extend(_.extend(new interfaceApp(), {
                /**
                 * backbone
                 */
                el: $('#game-stage'),
                events: {},
                renderer: null,
                stage: null,
                floor: {},
                initialize: function () {

                    // custom events
                    dispatcher.global.windowResize(this, this.resize);
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
                        }
                    });
                    this.initPixi();
                },
                show: function () {
                    this.$el.fadeIn();
                },
                hide: function(){
                    this.$el.fadeOut();
                },
                resize: function(){
                    var w = this.$body.width(),
                        h = this.$body.height();
                    this.renderer.resize(w, h);
                    this.stage.position.x = parseInt(w/2);
                    this.stage.position.y = parseInt(h/2);
                },
                initPixi: function(){
                    logger.info('Init Pixi...');
                    this.renderer = Pixi.autoDetectRenderer(this.$body.width(), this.$body.height(), {
                        'transparent':1
                    });
                    this.$el.append(this.renderer.view);
                    this.stage = new Pixi.Container();
                    this.resize();
                }

            })))();

        }

        return getInstance();

    });
