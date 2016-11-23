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


define('gameManager',
    ['config', 'logger', 'workerMaster', 'jquery', 'underscore', 'backbone', 'gameLayer', 'hudLayer', 'inputLayer', 'dialogLayer'],
    function (config, Logger, WorkerMaster, $, _, backbone, gameLayer, hudLayer, inputLayer, dialogLayer) {

        var instance,
            layer = {
                game: gameLayer,
                hud: hudLayer,
                input: inputLayer,
                dialog: dialogLayer
            },
            logger = Logger.getLogger('gameManager');
        logger.setLevel(config.logger.gameManager || 0);

        function User(user){
            this.getName =  function(){
                return user.name;
            }
        }


        /**
         * GameManager
         * @constructor
         */
        function GameManager () {

            var gameSocket = new WorkerMaster('socketManager', 'GameSocket', socketManagerReady, onSocketMessage);
            /**
             * init layer
             */
            try{
                _.each(layer, function(ly){
                    ly.init(this);
                }, this);
            }catch(e){
                logger.error('Init Layer failed', e);
            }

            /**
             * hide all components of all layer
             */
            this.hideAll = function(){
                _.each(layer, function(ly){
                    ly.hideAll();
                });
            };

            // user data
            var user = null;
            this.startGame = function(usr){
                user = usr;
            };

            /**
             * send message through gameSocket to worker
             */
            this.socketSend = gameSocket.send;
            this.socketRequest = gameSocket.request;
            this.socketCreate = gameSocket.socket;

            var gameContainer = new (backbone.View.extend({
                el: $('#game-container'),
                initialize: function(){
                    this.$el.hide();
                    _.bindAll(this, ['show']);
                },
                show: function(){
                    this.$el.show();
                }
            }))();

            function socketManagerReady (job) {
                try{
                    logger.trace('GameManager: SocketManager ready', job);
                    layer.input.displayConnect();
                    gameContainer.show();
                }catch(e){
                    logger.error('connect to server failed', e, job);
                }
            }

            function onSocketMessage (cmd, data) {
                var c = cmd.split('.'),
                    c1 = c.shift();
                try {
                    switch (c1) {
                        case 'game':
                        case 'hud':
                        case 'input':
                        case 'dialog':
                            var c2 = c.shift();
                            if ( layer[c1][c2] ) {
                                try{
                                    layer[c1][c2].apply(gameLayer[c1][c2], [c.join('.')].concat(data));
                                }catch(e){
                                    logger.error('Invoke Command: "' + c1 + '.' + c2 + '" failed.', data);
                                }
                            } else {
                                logger.error('Command "' + cmd + '" not supported');
                            }
                            break;

                        default:
                            logger.error('Command "' + cmd + '" not supported');
                    }
                } catch (e) {
                    logger.trace('Forward Command "' + cmd + '" failed: ', e, data);
                }
            }


        }


        function getInstance () {
            if ( !instance ) {
                instance = new GameManager();

            }
            return instance;
        }

        return getInstance();
    });


