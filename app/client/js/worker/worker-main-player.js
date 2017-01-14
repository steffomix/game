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


define(['config', 'logger', 'workerApp', 'eventDispatcher', 'pathfinder'],
    function (config, Logger, gameApp, dispatcher, Pathfinder) {

        var instance,
            logger = Logger.getLogger('workerMainPlayer');
        logger.setLevel(config.logger.workerMainPlayer || 0);

        var history = new MouseHistory(),
            mouseQueue = [],
            moveQueue = [];

        function movePlayer() {
            if (moveQueue.length) {
                var move = moveQueue.shift();
                try {
                    gameApp.send(dispatcher.gameMainPlayer.walk, move);
                    //socket.send('mainPlayer.walk', move);
                    setTimeout(movePlayer, move.speed * 5);
                } catch (e) {
                    setTimeout(movePlayer, 100);
                    logger.error('Worker move mainPlayer', e, move);
                }
            } else {
                setTimeout(movePlayer, 100);
            }

        }

        movePlayer();

        function addMouseHistory(move) {
            mouseQueue.push(move);
            while (mouseQueue.length > 3) {
                mouseQueue.shift()
            }
            return move;
        }

        function MouseHistory() {

            // detect mouse changed grid position
            this.mouseGridMoved = function () {
                var l = mouseQueue.length - 1;
                if (l > 0) {
                    var g1 = mouseQueue[l].mousePosition.grid,
                        g2 = mouseQueue[l - 1].mousePosition.grid;
                    if (g1.x != g2.x || g1.y != g2.y) {
                        return true;
                    }
                }
                return false;
            };

            // get moves from history: 0 = last
            this.getMove = function (back) {
                return mouseQueue[mouseQueue.length - 1 - (back || 0)];
            }
        }




        function WorkerMainPlayer() {
            // register router module

            dispatcher.workerMainPlayer.mouseGridMove(function(pos){
                var move = addMouseHistory(pos);
                if (history.mouseGridMoved()) {
                    var path = findPath(move);
                    gameApp.send(dispatcher.gameMainPlayer.showWalkPath, path);

                }
            });

            dispatcher.workerMainPlayer.walk(function(pos){
                moveQueue = findPath(pos);
            });

            function findPath(move){
                var path = new Pathfinder(move.playerPosition.grid, move.mousePosition.grid).find();
                path.shift();
                return path;
            }

        }

        function getInstance() {
            if (!instance) {
                instance = new WorkerMainPlayer();
            }
            return instance;
        }

        return getInstance();
    });