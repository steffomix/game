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

define(['config', 'logger', 'workerSocket', 'workerRouter', 'pathfinding', 'workerDispatcher', 'worldGenerator'],
    function (config, Logger, socket, router, pathfinding, dispatcher, worldGenerator) {

        var instance,
            logger = Logger.getLogger('workerMainPlayer');
        logger.setLevel(config.logger.workerMainPlayer || 0);

        var mouseQueue = [],
            pathfinder = new pathfinding.AStarFinder({
                allowDiagonal: false
            });

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
                        var path = findPath(move.playerPosition.grid, move.mousePosition.grid);
                        socket.send('tilesGrid.showPath', path);
                        mouseGridMove(move, history);

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

            function findPath(p1, p2) {
                logger.info(p1, p2);
                var extendGrid = 1,
                    // get bounds of real grid
                    xMin = Math.min(p1.x, p2.x),
                    xMax = Math.max(p1.x, p2.x),
                    yMin = Math.min(p1.y, p2.y),
                    yMax = Math.max(p1.y, p2.y),
                    width = xMax - xMin,
                    height = yMax - yMin,
                    // where the player actually stands
                    baseWeight = pathWeights[worldGenerator.tile(p1.x, p1.y)];

                if (baseWeight == Infinity) {
                    // no path found from within water or wall
                    return [];
                }

                // create base matrix
                var matrix = [], row, weight, maxWeight = 0;
                for (var y = yMin - extendGrid; y <= yMax + extendGrid; y++) {
                    row = [];
                    for (var x = xMin - extendGrid; x <= xMax + extendGrid; x++) {
                        weight = pathWeights[worldGenerator.tile(x, y)] - baseWeight;
                        if (weight < Infinity) {
                            maxWeight = Math.max(maxWeight, weight);
                        }
                        row.push(Math.max(0, weight));
                    }
                    matrix.push(row);
                }


                var xOffset = 0, yOffset = 0;

                // shift real grid positions to matrix positions
                xMin < 0 && (xOffset = xMin * -1 + extendGrid);
                xMax > width && (xOffset = (xMax - width - extendGrid) * -1);
                yMin < 0 && (yOffset = yMin * -1 + extendGrid);
                yMax > width && (yOffset = (yMax - height - extendGrid) * -1);

                // assign shift to positions
                var x1 = p1.x + xOffset, x2 = p2.x + xOffset,
                    y1 = p1.y + yOffset, y2 = p2.y + yOffset;


                // create paths
                // add weights to paths
                var grid, paths = [], weights = [], path, weight = 0;
                do {
                    // create path
                    grid = new pathfinding.Grid(matrix);
                    path = pathfinder.findPath(x1, y1, x2, y2, grid);
                    paths.push(path);

                    // calculate weight of path
                    weight = 0;
                    for (var i = 0; i < path.length; i++) {
                        // calculate weight and shift positions back to its origin
                        path[i] = {
                            x: path[i][0] - xOffset,
                            y: path[i][1] - yOffset,
                            weight: pathWeights[worldGenerator.tile(path[i][0], path[i][1])]
                        };
                        weight += path[i].weight;
                    }
                    weights.push(weight);

                    // reduce matrix weight an repeat
                    maxWeight--;
                    maxWeight >= 0 && reduceMatrixWeight(matrix);
                } while (maxWeight >= 0);


                // find most cheap path
                var cheap = Infinity, cheapest;
                for (var i = 0; i < weights.length; i++) {
                    if (paths[i].length && weights[i] < cheap) {
                        cheap = weights[i];
                        cheapest = i;
                    }
                }

                var path = paths[cheapest] || [];

                // logger.info(path);
                return path;

            }

            function reduceMatrixWeight(matrix) {
                var row;
                for (var y = 0; y < matrix.length; y++) {
                    row = matrix[y];
                    for (var x = 0; x < row.length; x++) {
                        row[x] = Math.max(0, row[x] - 1);
                    }
                }
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