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


define('interfaceAccount', ['config', 'logger', 'jquery', 'underscore', 'backbone', 'interfaceApp'],
    function (config, Logger, $, _, Backbone, interfaceApp) {

        var instance,
            logger = Logger.getLogger('interfaceAccount');

        logger.setLevel(config.logger.interfaceAccount || 0);

        return getInstance();
        function getInstance () {
            if ( !instance ) {
                instance = new InterfaceAccount();
            }
            return instance;
        }


        function InterfaceAccount () {

            /**
             * login
             */
            this.login = new (Backbone.View.extend(_.extend(new interfaceApp(), {
                /**
                 * backbone
                 */
                el: $('#window-game-login'),
                el_user: '#input-game-login-user',
                el_pass: '#input-game-login-pass',
                el_msg: '#game-login-message',
                events: {'click #button-game-login': 'login'},
                initialize: function () {
                    // grap template
                    this.prepareTemplate();
                    // bind user events
                    _.bindAll(this, 'login');
                    // resize window
                    this.listenTo(this.globalEvents, 'resizeWindow', function(){
                        this.util.centerWindowAsync(this.$body, this.$el);
                    });
                    // hide all
                    this.listenTo(this.interfaceEvents, 'hideAll', this.hide);
                    // show on connect
                    this.listenTo(this.accountEvents, 'showLogin', this.show);

                    /**
                     * router:
                     * interfaceLogin.login
                     */
                    this.router.addModule('interfaceLogin', this, {
                        // server send login success or fail
                        login: function(job){
                            if(job.data.success) {
                                this.hide();
                                this.accountEvents.trigger('startGame');
                            }else{
                                this.el_msg.val(this.translate('Login failed. Please check your data.'));
                            }
                        }
                    });
                },
                login: function () {
                    var user = (this.el_user.val() || '');
                    var pass = (this.el_pass.val() || '');
                    if ( user && pass ) {
                        localStorage['server.login.user'] = user;
                        this.socket.send('server.login', [user, pass]);
                    }
                },
                show: function () {
                    this.render();
                    $(this.el_user).val(localStorage['server.login.user']);
                    this.onResize();
                    this.$el.fadeIn();
                }
            })))();

            /**
             * connect
             */
            this.connect = new (Backbone.View.extend(_.extend(new interfaceApp(), {
                /**
                 * backbone
                 */
                el: $('#window-game-connect'),
                el_host: '#input-game-connect-host',
                el_port: '#input-game-connect-port',
                el_msg: '#game-connect-message',
                initialize: function () {
                    this.template = this.$el.html();
                    this.$el.html('')
                    this.viewData = this.translateKeys('connect', [
                        'connect', 'host', 'port'
                    ]);
                    this.listenTo(this.interfaceEvents, 'resizeWindow', this.onResize);
                    this.listenTo(this.interfaceEvents, 'hideAll', this.hide);
                    this.listenTo(this.accountEvents, 'serverDisconnect', this.onShow);

                    $(this.el_host).val(localStorage['server.host'] || 'game.com');
                    $(this.el_port).val(localStorage['server.port'] || 4343);

                    this.router.addModule('interfaceConnect', this, {
                        connect: function(){
                            this.interfaceEvents.trigger('hideAll');
                            this.accountEvents.trigger('showLogin');
                        },
                        disconnect: function(){
                            this.interfaceEvents.trigger('hideAll');
                            this.globalEvents.trigger('serverDisconnect');
                            this.show();
                        }
                    })

                },
                events: {
                    'click #button-game-connect': 'connect',
                    'hide': 'hide',
                    'all': 'test'
                },
                connect: function (e) {
                    var host = (/[0-9a-z\.\/]+/.exec($(this.el_host).val()) || [''])[0],
                        port = parseInt((/[0-9]+/.exec($(this.el_port).val()) || [NaN])[0]);
                    if ( host && port && !isNaN(port) ) {
                        localStorage['server.host'] = host;
                        localStorage['server.port'] = port;
                        this.socket.send('server.connect', {
                            host: host,
                            port: port
                        });
                    } else {
                        $(this.el_msg).html('Please check Host and Port Data')
                        logger.error('Useless Connect data', host, port);
                    }
                },
                /**
                 * components
                 */
                onResize: function () {
                    this.util.centerWindowAsync(this.$body, this.$el);
                },
                onShow: function (id) {
                    this.render();
                    $(this.el_host).val(localStorage['server.host']);
                    $(this.el_port).val(localStorage['server.port']);
                    this.$el.fadeIn();
                    this.onResize();
                }
            })))();

        }
    })
;
