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


define('inputLayer', ['config', 'logger', 'jquery', 'underscore', 'backbone'],
    function (config, Logger, $, _, Backbone) {

        var inputLayer,
            gameManager,
            logger = Logger.getLogger('inputScreen');
        logger.setLevel(config.logger.inputScreen || 0);

        function getInputLayer () {
            if ( !inputLayer ) {
                inputLayer = new InputLayer();
                //setupStateMachine();
            }
            return inputLayer;
        }

        function InputLayer () {

            this.init = function (mng) {
                gameManager = mng;
            };

            /**
             * hide all inputLayer conponents
             */
            this.hideAll = function () {
                _.each(components, function(comp){
                    comp.hide();
                });
            };

            this.displayConnect = function(){
                gameManager.hideAll();
                components.connect.show();
            };

            var components = {

                login: new (Backbone.View.extend({
                    /**
                     * backbone
                     */
                    el: $('#window-game-login'),
                    el_user: $('#input-game-login-user'),
                    el_pass: $('#input-game-login-pass'),
                    el_msg: $('#game-login-message'),
                    initialize: function () {
                        this.el_user.val(localStorage['server.login.user']);
                        _.bindAll(this, 'show', 'hide');
                    },
                    events: {'click #button-game-login': 'login'},
                    login: function () {
                        var user = (this.el_user.val() || '');
                        var pass = (this.el_pass.val() || '');
                        if ( user && pass ) {
                            localStorage['server.login.user'] = user;
                            gameManager.socketRequest('back.login', [user, pass], this.onLogin, this);
                        }
                    },
                    onLogin: function (failMsg, user) {
                        if ( failMsg ) {
                            // todo i18n
                            el_msg.val('Login failed. Check your data.');
                        } else {
                            gameManager.startGame(user);
                        }
                    },
                    show: function(){
                        this.$el.show();
                    },
                    hide: function(){
                        this.$el.hide();
                    }

                }))(),

                connect: new (Backbone.View.extend({
                    /**
                     * backbone
                     */
                    el: $('#window-game-connect'),
                    el_host: $('#input-game-connect-host'),
                    el_port: $('#input-game-connect-port'),
                    el_msg: $('#game-connect-message'),
                    initialize: function () {
                        this.el_host.val(localStorage['server.host'] || 'game.com');
                        this.el_port.val(localStorage['server.port'] || 4343);
                        _.bindAll(this, 'show', 'hide');
                    },
                    events: {'click #button-game-connect': 'connect'},
                    connect: function (e) {
                        var host = (/[0-9a-z\.\/]+/.exec(this.el_host.val()) || [''])[0],
                            port = parseInt((/[0-9]+/.exec(this.el_port.val()) || [NaN])[0]);
                        if ( host && !isNaN(port) ) {
                            localStorage['server.host'] = host;
                            localStorage['server.port'] = port;
                            gameManager.socketRequest('back.connect', [this.el_host.val(), this.el_port.val()], this.onConnect, this);
                        } else {
                            logger.error('Useless Connect data', host, port);
                        }
                    },
                    onConnect: function (failMsg) {
                        if ( failMsg ) {
                            this.el_msg.val(failMsg);
                        } else {
                            this.el_msg.val('');
                            this.hide();
                            login.show();
                        }
                    },
                    /**
                     * inputLayer
                     */
                    show: function () {
                        this.el_host.val(localStorage['server.host']);
                        this.el_port.val(localStorage['server.port']);
                        this.$el.show();
                    },
                    hide: function () {
                        this.$el.hide();
                    }
                }))()


            }
        }

        return getInputLayer();

    });
