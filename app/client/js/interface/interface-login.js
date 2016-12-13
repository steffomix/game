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


define(['config', 'logger', 'jquery', 'underscore', 'backbone', 'interfaceApp', 'eventDispatcher'],
    function (config, Logger, $, _, Backbone, interfaceApp, dispatcher) {

        var instance,
            logger = Logger.getLogger('interfaceLogin');

        logger.setLevel(config.logger.interfaceLogin || 0);

        return getInstance();
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
                el: $('#window-game-login'),
                el_user: '#input-game-login-name',
                el_pass: '#input-game-login-pass',
                el_pass2: '#input-game-login-pass2',
                el_reg: '#ck-game-register',
                el_msg: '#game-login-message',
                el_btLogin: '#button-game-login',
                el_btRegister: '#button-game-register',
                el_trPass2: '#row-login-pass2',
                events: {
                    'click #button-game-login': 'login',
                    'click #button-game-register': 'register',
                    //'click #input-game-login-name, #input-game-login-pass, #input-game-login-pass2': 'resetMessage',
                    'change #ck-game-register': 'switchRegister',
                    'keyup #input-game-login-pass, #input-game-login-pass2': 'checkPasswords'
                },
                initialize: function () {
                    // grap template
                    this.grabTemplate();
                    this.viewData = this.translateKeys('login', [
                        'login', 'register', 'username', 'password'
                    ]);
                    // custom events
                    dispatcher.global.windowResize(this, this.centerWindow);
                    dispatcher.interface.hideAll(this, this.hide);
                    dispatcher.server.connect(this, this.show);
                    dispatcher.server.logout(this, this.show);
                    dispatcher.server.login(this, this.hide);

                    /**
                     * router:
                     * interfaceLogin.login
                     */
                    this.router.addModule('interfaceLogin', this, {
                        login: function (job) {
                            try {
                                if (job.data.success) {
                                    logger.info('Login success');

                                    this.user = job.data.user;

                                    dispatcher.server.login.trigger();
                                    dispatcher.global.windowResize.trigger();
                                    $(this.el_msg).html(this.translate('login.login success'));
                                } else {
                                    $(this.el_msg).html(job.data.msg || this.translate('login.login failed'));
                                }
                            } catch (e) {
                                logger.error(e, job);
                            }
                        },
                        register: function (job) {
                            if (job.data.success) {
                                if ($(this.el_reg).is(':checked')) {
                                    $(this.el_reg).click();
                                    this.switchRegister();
                                }
                                $(this.el_msg).html(this.translate('login.register success'));
                            } else {
                                $(this.el_msg).html(job.data.msg || this.translate('login.register failed'));
                            }
                        },
                        logout: function (job) {
                            dispatcher.interface.hideAll.trigger();
                            dispatcher.server.logout.trigger();
                            $(this.el_msg).html(job.data.message);
                        }
                    });
                }

                ,
                login: function () {
                    this.resetMessage();
                    var user = ($(this.el_user).val() || '');
                    var pass = ($(this.el_pass).val() || '');
                    if (user && pass) {
                        localStorage['server.login.user'] = user;
                        this.socket.send('server.login', {user: user, pass: pass});
                    } else {
                        $(this.el_msg).text(this.translate('login.loginDataIncomplete'));
                    }
                }
                ,
                register: function () {
                    this.resetMessage();
                    var user = $(this.el_user).val(),
                        pass = $(this.el_pass).val();
                    if (this.checkPasswords() && user && pass) {
                        this.socket.send('server.register', {user: user, pass: pass});
                    }
                }
                ,
                switchRegister: function () {
                    if ($(this.el_reg).is(':checked')) {
                        $(this.el_trPass2).show();
                        $(this.el_btLogin).hide();
                        $(this.el_btRegister).show();
                    } else {
                        $(this.el_trPass2).hide();
                        $(this.el_btLogin).show();
                        $(this.el_btRegister).hide();
                    }
                }
                ,
                checkPasswords: function () {
                    if (!$(this.el_reg).is(':checked')) return false;
                    var p1 = $(this.el_pass).val(),
                        p2 = $(this.el_pass2).val();
                    if (!p1 || !p2 || p1 != p2) {
                        $(this.el_msg).text(this.translate('login.passwords not same'));
                        return false;
                    } else {
                        this.resetMessage();
                        return true;
                    }
                }
                ,
                resetMessage: function () {
                    $(this.el_msg).html('&nbsp;');
                }
                ,
                show: function () {
                    this.render();
                    this.switchRegister();
                    this.centerWindow();
                    $(this.el_user).val(localStorage['server.login.user'] || '');
                    this.$el.fadeIn();
                }
            })))();

        }
    })
;
