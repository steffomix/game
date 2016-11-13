/* 
 * Copyright (C) 10.11.16 Stefan Brinkmann <steffomix@gmail.com>
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


function createMatrix(x, y) {
    var matrix = [];
    for (var iy = 0; iy < y; iy++) {
        matrix[iy] = [];
        for (var ix = 0; ix < x; ix++) {
            matrix[iy][ix] = parseInt(Math.random() * 1.3);
        }
    }
    return matrix;
}


define(
    ['io', 'underscore', 'pixi', 'gl', 'jquery', 'worker'],
    function start(io, _, pixi, gl, jquery, worker) {


        function start(connection) {
            console.log('Start Game');


            if (Worker) {
                var x = 100, y = 100, matrix = createMatrix(x, y);
                worker.run(
                    'find',
                    {
                        startX: 0,
                        startY: 0,
                        endX: x - 1,
                        endY: y - 1,
                        matrix: _.clone(matrix)
                    },
                    function (job) {
                        var grid = job.request.matrix,
                            path = job.response.path,
                            t = '', row;

                        for (var i = 0; i < path.length; i++) {
                            p = path[i];
                            var x = p[0], y = p[1];
                            // yes, y first
                            grid[y][x] = '*';
                        }

                        //create html
                        var colors = {
                            '0': 'fff',
                            '1': 'ccc',
                            '*': 'faa'
                        };
                        for (var i = 0; i < grid.length; i++) {
                            row = grid[i];
                            t += '<tr>';
                            for (var ii = 0; ii < row.length; ii++) {
                                t += '<td style="background-color: #' + colors[row[ii]] + '">' + row[ii] + '</td>';

                            }
                            t += '</tr>\n';
                        }
                        //jquery('#body').append('<table>' + t + '</table>');
                    }
                );


            }


        }

        //setInterval(find, 1000);

        for(var i = 1; i < 50; i++){
            find();
        }
        function find(){
            var x = 200, y = 200, matrix = createMatrix(x, y);
            var t = new Date().getTime();
            worker.run(
                'find',
                {
                    startX: 0,
                    startY: 0,
                    endX: x - 1,
                    endY: y - 1,
                    matrix: matrix
                },
                function (job) {
                    var t2 = new Date().getTime() - t;
                    jquery('#body').prepend('<div>' + t2 + ' ' + job.response.path.length + '</div>');
                }
            );
        }

        return {
            start: start
        }
    });
