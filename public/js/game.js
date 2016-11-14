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

        var pathfinderWorker = worker.create('/js/pathfinder.js');
        var tilesWorker = worker.create('/js/tiles-interactive.js');
        //var petsWorker = worker.create('/js/pets.js');
        function start(connection) {


        }


        return {
            start: start
        }
    });