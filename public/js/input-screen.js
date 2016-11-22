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


define('inputScreen', ['config', 'logger', 'stateMachine', 'viewConnect'], function (config, Logger, stateMachine, viewConnect) {

    var instance,
        manager,
        sm,
        logger = Logger.getLogger('inputScreen').setLevel(config.logger.inputScreen || 0);


    function getInstance () {
        if ( !instance ) {
            instance = new InputScreen();
            setupStateMachine();
        }
        return instance;
    }


    function InputScreen () {

        this.init = function (mng) {
            manager = mng;
        };

        this.showLogin = function (data) {
            viewConnect.show();
        };

        this.onstart = function (event, from, to, args) {
            console.log('onstart event: ' + event, 'from: ' + from, 'to: ' + to);
        };

        this.on_connect = function (event, from, to, args) {
            console.log('onconnect event: ' + event, args, 'from: ' + from, 'to: ' + to);
        };

        this.on_login = function (event, from, to, args) {
            console.log('onlogin event: ' + event, 'from: ' + from, 'to: ' + to);
        };

        this.on_disconnect = function (event, from, to, args) {
            console.log('ondisconnect event: ' + event, 'from: ' + from, 'to: ' + to);
        };

        this.on_running = function (event, from, to, args) {
            console.log('onrunning event: ' + event, 'from: ' + from, 'to: ' + to);
        };

        this.on_logout = function (event, from, to, args) {
            console.log('onlogout  event: ' + event, 'from: ' + from, 'to: ' + to);
        };
    }

    getInstance();

    instance._connect(1);
    instance._login(2);
    instance._logout(3);
    instance._disconnect(4);


    function setupStateMachine () {
        //var logger = logger;
        sm = stateMachine.create({
            initial: 'none',
            target: instance,
            error: function (eventName, from, to, args, errorCode, errorMessage, originalException) {
                //logger.error('event ' + eventName + ' was naughty :- ' + errorMessage);
            },
            events: [
                {name: '_connect', from: 'none', to: ['connect', 'running']},
                {name: '_login', from: 'connect', to: 'running'},
                {name: '_logout', from: ['none','running'], to: 'login'},
                {name: '_disconnect', from: ['login', 'running', 'connected'], to: 'connect'}
            ]
        });
    }


    // setup stateMachine

    return instance;
});
