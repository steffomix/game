/*
 * Copyright (C) 09.01.17 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'underscore', 'pathfinding', 'worldGenerator'],
    function (config, Logger, _, pathfinding, worldGenerator) {

        var pathfinder = new pathfinding.AStarFinder({
                allowDiagonal: true
            }),
            logger = Logger.getLogger('workerPathfinder');
        logger.setLevel(config.logger.workerPathfinder || 0);


        /**
         * Multi-terrain pathfinder
         * @param p1 {{x, y}} Player position
         * @param p2 {{x, y}} Mouse position
         * @param extend *{int} extend matrix for pathfinder
         */
        function WorkerPathfinder(p1, p2, extend) {

            // enlarge grid around min and max values
            var extendGrid = extend || 8;

            // matrix bounds
            var baseSpeed = worldGenerator.tile(p1.x, p1.y).walkSpeed,
                xMin = Math.min(p1.x, p2.x),
                xMax = Math.max(p1.x, p2.x),
                yMin = Math.min(p1.y, p2.y),
                yMax = Math.max(p1.y, p2.y),
                width = xMax - xMin,
                height = yMax - yMin,
                xOffset = 0,
                yOffset = 0,
                matrix = [],
                walkSpeeds = [],
                terrainLayers = [],
                paths = [],
                mappedPaths = [];

            // calculate offset
            // shift real grid positions to matrix positions
            if (xMin < 0) {
                xOffset = xMin * -1 + extendGrid;
            }
            if (xMax > width) {
                xOffset = (xMax - width - extendGrid) * -1;
            }
            if (yMin < 0) {
                yOffset = yMin * -1 + extendGrid;
            }
            if (yMax > height) {
                yOffset = (yMax - height - extendGrid) * -1;
            }

            this.find = function () {
                matrix = [];
                walkSpeeds = [];
                createBaseMatrix();

                terrainLayers = [];
                createTerrainLayers();

                paths = [];
                findTerrainPaths();

                mappedPaths = [];
                mapPaths();

                return findShortest() || [];

            };

            function findShortest() {
                var speeds = [],
                    path,
                    speed;
                for (var p = 0; p < mappedPaths.length; p++) {
                    path = mappedPaths[p];
                    speed = 0;
                    for (var i = 0; i < path.length; i++) {
                        speed += path[i].speed;
                    }
                    speeds.push(speed);
                }
                var fastest = Infinity,
                    fastestIndex = 0;
                for (var i = 0; i < speeds.length; i++) {
                    if (speeds[i] < fastest) {
                        fastest = speeds[i];
                        fastestIndex = i;
                    }
                }
                return mappedPaths[fastestIndex]
            }

            function mapPaths() {
                var node,
                    path,
                    mappedRow;
                for (var i = 0; i < paths.length; i++) {
                    path = paths[i];
                    mappedRow = [];
                    mappedPaths.push(mappedRow);
                    for (var n = 0; n < path.length; n++) {
                        node = path[n];
                        mappedRow[n] = {
                            x: node[0] - xOffset,
                            y: node[1] - yOffset,
                            speed: matrix[node[1]][node[0]].walkSpeed,
                            tile: matrix[node[1]][node[0]]
                        }
                    }
                }
            }

            function findTerrainPaths() {
                var grid,
                    path,
                    x1 = p1.x + xOffset, x2 = p2.x + xOffset,
                    y1 = p1.y + yOffset, y2 = p2.y + yOffset;

                for (var i = 0; i < terrainLayers.length; i++) {
                    grid = new pathfinding.Grid(terrainLayers[i]);
                    path = pathfinder.findPath(x1, y1, x2, y2, grid);
                    path.length && paths.push(path);
                }
            }

            function createTerrainLayers() {
                var speed,
                    layer, tileSpeed;
                for (var i = 0; i < walkSpeeds.length; i++) {
                    speed = walkSpeeds[i];
                    layer = [];
                    for (var y = 0; y < matrix.length; y++) {
                        layer[y] = [];
                        for (var x = 0; x < matrix[0].length; x++) {
                            // 0 walkable
                            // 1 blocked
                            tileSpeed = matrix[y][x].walkSpeed;
                            layer[y][x] = speed < tileSpeed ? 1 : 0;
                        }
                    }
                    terrainLayers.push(layer);
                }
            }

            function createBaseMatrix() {

                // create base matrix and collect walk speeds
                var speeds = {},
                    tile,
                    row;
                for (var y = yMin - extendGrid; y <= yMax + extendGrid; y++) {
                    row = [];
                    for (var x = xMin - extendGrid; x <= xMax + extendGrid; x++) {
                        tile = worldGenerator.tile(x, y);
                        speeds[tile.walkSpeed] = tile.walkSpeed;
                        row.push(tile);
                    }
                    matrix.push(row);
                }
                // sort collected walkSpeeds into array
                walkSpeeds = [];
                _.each(speeds, function (v) {
                    // don't add faster speeds which are walkable anyway,
                    // they give the same result
                    v >= baseSpeed && walkSpeeds.push(v);
                });
                walkSpeeds.sort(function (a, b) {
                    return a - b;
                });

            }
        }


        return WorkerPathfinder;

    });