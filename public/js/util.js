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


define('util', ['config', 'logger'], function (config, Logger) {

    var instance,
        logger = Logger.getLogger('gameUtil');
    logger.setLevel(config.logger.gameUtil || 0);

    return getInstance();

    function getInstance () {
        if ( !instance ) {
            instance = new Util();
        }
        return instance;
    }

    function Util () {

        /**
         * center window in frame async
         * @param frame {$} outer frame, usually frame
         * @param win {$} the window to center in frame
         */
        this.centerWindowAsync = function(frame, win){
            setTimeout(_centerWindow, 0, frame, win);
        };
        /**
         * center window in frame sync. If this function has no effect, try centerWindowAsync
         * @param frame
         * @param win
         * @returns {{left, top}|{int}}
         */
        this.centerWindow = function(frame, win){
            return _centerWindow(frame, win);
        };
        function _centerWindow (frame, win) {
            var bx = parseInt(frame.css('width')),
                by = parseInt(frame.css('height')),
                wx = parseInt(win.css('width')),
                wy = parseInt(win.css('height')),
                wTop = by / 2 - wy / 2,
                wLeft = bx / 2 - wx / 2;

            win.css({
                position: 'absolute',
                left: wLeft + 'px',
                top: wTop + 'px'
            });
            return {left: wLeft, top: wTop}
        }
        
    }
});
