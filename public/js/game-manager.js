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
    ['config', 'logger', 'jquery', 'gameScreen', 'hudScreen', 'inputScreen', 'dialogScreen'],
    function (config, Logger, jquery, gameScreen, hudScreen, inputscreen, dialogscreen) {

        var instance,
            screens = {
                game: gameScreen,
                hud: hudScreen,
                input: inputscreen,
                dialog: dialogscreen
            },
            logger = Logger.getLogger('gameManager').setLevel(config.logger.gameManager || 0);

        return getInstance();

        function getInstance () {
            if ( !instance ) {
                instance = new GameManager();
            }
            return instance;
        }

        function GameManager () {

            if ( instance ) {
                logger.error('Instance GameManager already created');
            }

            this.init = init;
            this.onSocketMessage = onSocketMessage;

            function init () {
                screens.dialog.init(this);
                screens.input.init(this);
                screens.hud.init(this);
                screens.game.init(this);
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
                            if ( screens[c1][c2] ) {
                                screens[c1][c2].apply(screens[c1][c2], [c.join('.')].concat(data));
                            }else{
                                logger.error('Command ' + cmd + ' not supported');
                            }
                            break;

                        default:
                            logger.error('Command ' + cmd + ' not supported');
                    }
                } catch (e) {
                    logger.trace('Forward Message to screen "' + cmd + '" failed: ', e, data);
                }
            }

        }
    });


