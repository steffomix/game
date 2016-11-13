/* 
 * Copyright (C) 13.11.16 Stefan Brinkmann <steffomix@gmail.com>
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

/*
 AStarFinder
 BestFirstFinder
 BreadthFirstFinder
 DijkstraFinder
 IDAStarFinder.js
 JumpPointFinder
 OrthogonalJumpPointFinder
 BiAStarFinder
 BiBestFirstFinder
 BiBreadthFirstFinder
 BiDijkstraFinder
 */



self.addEventListener('message', function(e) {

    try{
        PF.Grid;
    }catch(e){
        console.log('Worker: Load Pathfinding.');
        self.importScripts('/js/lib/pathfinding.js');
    }

    var cmd = e.data.cmd,
        data = e.data.data;

    switch(cmd){

        case 'find':
            console.log(data.matrix);

            var finder = new PF.AStarFinder(),
                grid = new PF.Grid(data.matrix),
                gridBackup = grid.clone(),
                path = finder.findPath(data.startX, data.startY, data.endX, data.endY, grid);
                self.postMessage({path: path, grid: gridBackup});

            break;

        default:
            console.log('Worker Pathfinder: Command ' + cmd + ' not supported.');

    }

}, false);

