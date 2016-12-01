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


define('interfaceLogin', ['config', 'logger', 'jquery', 'underscore', 'backbone', 'interfaceApp'],
    function (config, Logger, $, _, Backbone, interfaceApp) {

        var instance,
            logger = Logger.getLogger('interfaceLogin');

        logger.setLevel(config.logger.interfaceLogin || 0);

        return getInstance();
        function getInstance () {
            if ( !instance ) {
                instance = createLogin();
            }
            return instance;
        }

        function createLogin () {

            return new (Backbone.View.extend(_.extend(new interfaceApp(), {
                /**
                 * backbone
                 */
                el: $('#window-game-login'),
                el_user: '#input-game-login-name',
                el_pass: '#input-game-login-pass',
                el_msg: '#game-login-message',
                events: {
                    'click #button-game-login': 'login',
                    'click #input-game-login-name, #input-game-login-pass': 'resetMessage'
                },
                initialize: function () {
                    // grap template
                    this.grabTemplate();
                    this.viewData = this.translateKeys('login', [
                        'login', 'username', 'password'
                    ]);
                    // bind user events
                    _.bindAll(this, 'login');
                    // resize window
                    this.listenTo(this.globalEvents, 'resizeWindow', function () {
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
                        login: function (job) {
                            var self = this;
                            try{
                                if ( job.data.success ) {
                                    logger.info('Login success');
                                    //self.hide();
                                    self.globalEvents.trigger('startGame');
                                    $(this.el_msg).html(this.translate('login.success'));
                                } else {
                                    self.$el.fadeOut(1);
                                    setTimeout(function () {
                                        self.$el.fadeIn();
                                    }, 2000);
                                    $(this.el_msg).html(this.translate('login.fail'));
                                }
                            }catch(e){
                                logger.error(e, job);
                            }
                        }
                    });
                },
                onResize: function () {
                    this.util.centerWindowAsync(this.$body, this.$el);
                },
                login: function () {
                    var user = ($(this.el_user).val() || '');
                    var pass = ($(this.el_pass).val() || '');
                    if ( user && pass ) {
                        localStorage['server.login.user'] = user;
                        this.socket.send('server.login', {user:user, pass:pass});
                        //this.$el.fadeOut();
                    } else {
                        $(this.el_msg).text(this.translate('login.dataIncomplete'))
                    }
                },
                resetMessage: function () {
                    $(this.el_msg).html('&nbsp;');
                },
                show: function () {
                    this.render();
                    $(this.el_user).val(localStorage['server.login.user'] || '');
                    this.onResize();
                    this.$el.fadeIn();
                }
            })))();

        }
    });
