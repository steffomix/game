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

define(['config', 'logger', 'underscore', 'workerSocket', 'workerRouter', 'workerDispatcher', 'workerPathfinder'],
    function (config, Logger, _, socket, router, dispatcher, Pathfinder) {

        var instance,
            logger = Logger.getLogger('workerMainPlayer');
        logger.setLevel(config.logger.workerMainPlayer || 0);

        var mouseQueue = [],
            moveQueue = [];

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
            var history = new MouseHistory(),
                mouseGridMove = dispatcher.mainPlayer.mouseGridMove.claimTrigger(this),
                mouseUp = dispatcher.mainPlayer.mouseUp.claimTrigger(this),
                mouseDown = dispatcher.mainPlayer.mouseDown.claimTrigger(this),
                pathWeights = config.game.worldGenerator.pathWeights;

            // register router module
            router.addModule('mainPlayer', this, {
                mouseMove: function (job) {
                    var move = addMouseHistory(job.data);
                    if (history.mouseGridMoved()) {
                        var path = new Pathfinder(move.playerPosition.grid, move.mousePosition.grid).find();
                        socket.send('tilesGrid.showPath', path);

                    }
                },
                mouseUp: function (job) {
                    var move = addMouseHistory(job.data);
                    mouseDown(move, history);
                },
                mouseDown: function (job) {
                    var move = addMouseHistory(job.data);
                    mouseUp(move, history);
                }
            });


        }

        function getInstance() {
            if (!instance) {
                instance = new WorkerMainPlayer();
            }
            return instance;
        }

        return getInstance();
    });