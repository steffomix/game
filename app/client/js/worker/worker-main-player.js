/*
 * Copyright (C) 07.01.17 Stefan Brinkmann <steffomix@gmail.com>
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


define(['config', 'logger', 'workerApp', 'gameEvents', 'pathfinder'],
    function (config, Logger, gameApp, events, Pathfinder) {

        var instance,
            logger = Logger.getLogger('workerMainPlayer');
        logger.setLevel(config.logger.workerMainPlayer || 0);

        var speedAcc = config.game.tiles.speedAcc,
            lastMouseGridPos,
            moveQueue = [];


        /**
         * find path by given start- and endpoints
         * @param move
         * @returns { [{x: int, y: int, speed: int}, ...] }
         */
        function findPath(move){
            return new Pathfinder(move.playerPosition.grid, move.mousePosition.grid).find();
        }

        /**
         * walk received path
         */
        (function movePlayer(iv) {
            if (moveQueue.length) {
                var move = moveQueue.shift();
                try {
                    gameApp.send(events.mainPlayer.walk, move);
                    //socket.send('mainPlayer.walk', move);
                    setTimeout(movePlayer, move.speed / speedAcc);
                } catch (e) {
                    setTimeout(movePlayer, iv);
                    logger.error('Worker move mainPlayer', e, move);
                }
            } else {
                setTimeout(movePlayer, iv);
            }
        })(100);

        function showWalkPath(move){
            gameApp.send(events.mainPlayer.showWalkPath, findPath(move));
        }

        /**
         *
         * @constructor
         */
        function WorkerMainPlayer() {

            /**
             * user clicked on tile to walk to
             */
            events.mainPlayer.walk(function(pos){
                moveQueue = findPath(pos);
            });

            // mouse moved to another tile
            events.game.mouseGridMove(function(move){
                lastMouseGridPos = move;
                showWalkPath(move);
            });

            // screen scrolled to another tile
            events.game.screenGridMove(showWalkPath);

            // mainPlayer received position to move to
            events.mainPlayer.gridMoving(showWalkPath);

        }

        function getInstance() {
            if (!instance) {
                instance = new WorkerMainPlayer();
            }
            return instance;
        }

        return getInstance();
    });