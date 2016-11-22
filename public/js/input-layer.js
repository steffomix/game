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

        var instance,
            gameManager,
            logger = Logger.getLogger('inputScreen').setLevel(config.logger.inputScreen || 0);


        function getInstance () {
            if ( !instance ) {
                instance = new InputLayer();
                //setupStateMachine();
            }
            return instance;
        }

        var login = new (Backbone.View.extend({
            manager: instance,
            el: $('#window-connect'),
            el_host: $('#input-connect-host'),
            el_port: $('#input-connect-port'),
            initialize: function(){
                this.el_host.val(localStorage['server.host'] || 'game.com');
                this.el_port.val(localStorage['server.port'] || 4343);
            },
            events: {'click #button-connect': 'connect'},

            connect: function (e) {
                var host = (/[0-9a-z\.\/]+/.exec(this.el_host.val()) || [''])[0],
                    port = parseInt((/[0-9]+/.exec(this.el_port.val()) || [NaN])[0]);
                if(host && !isNaN(port)){
                    localStorage['server.host'] = host;
                    localStorage['server.port'] = port;
                    gameManager.socketSend('back.connect', [this.el_host.val(), this.el_port.val()]);
                }else{
                    logger.error('Useless Connect data', host, port);
                }
            }
        }))();

       // logger.warn('sshfskfhsk', $('#button-connect'));

        function InputLayer () {

            this.init = function (mng) {
                gameManager = mng;
            }
        }

        return getInstance();

    });
