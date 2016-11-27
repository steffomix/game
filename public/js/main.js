/*
 * Copyright (C) 16.11.16 Stefan Brinkmann <steffomix@gmail.com>
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

(function () {

    var conf = {
        server: {
            host: 'game.com',
            port: '4343'
        },
        baseUrl: '/js/',
        paths: {

            // third party libs
            'logger': 'lib/loglevel.min', // https://github.com/pimterry/loglevel
            'underscore': 'lib/underscore.min', // http://underscorejs.org/
            'backbone': 'lib/backbone.min', // http://backbonejs.org/
            'jquery': 'lib/jquery.min', // http://jquery.com/
            'io': 'lib/socket.io.min', // http://socket.io/
            'stateMachine': 'lib/state-machine.min', // https://github.com/jakesgordon/javascript-state-machine
            'pixi': 'lib/pixi.min', // http://www.pixijs.com/
            'pathfinding': 'lib/pathfinding' // https://github.com/qiao/PathFinding.js
        },
        logger: {}
    };

    // format:
    // module name, path, loglevel
    // 1: trace
    // 2: info
    // 3: warn
    // 4: error
    // 5: off
    var modules = [

        // game
        ['util', 'util', 0],
        ['gameManager', 'game-manager', 0],
        ['workerMaster', 'worker-master', 0],
        ['gameSocket', 'game-socket', 0],
        ['interface', 'game-interface', 0],
        ['interfaceComponents', 'interface-components'],

        // worker: Server - Client Middleware
        ['workerManager', 'worker/worker-manager', 0],
        ['workerSocket', 'worker/worker-socket', 0],
        ['commandRouter', 'command-router', 0],
        ['commandFilter', 'command-filter', 0],
        ['gameCache', 'worker/game-cache', 2],
        ['pathfinder', 'worker/pathfinder', 2], // used by gamecache
        ['server', 'worker/server', 2],
        ['workerSlave', '/js/worker/worker-slave.js', 0] // must be full path
    ];

    // setup config for paths and logger
    // The logger is modified to prefix module name on loglevel trace
    modules.forEach(function (item) {
        var module = item[0],
            path = item[1],
            logLevel = item[2];

        conf.paths[module] = path;
        conf.logger[module] = logLevel;
        // conf.logger[module] = 1; // all trace
        // conf.logger[module] = 2; // all info
        // conf.logger[module] = 3; // all warn
        // conf.logger[module] = 4; // all error
        // conf.logger[module] = 5; // all off

    });

    // setup requirejs
    requirejs.config({paths: conf.paths, baseUrl: conf.baseUrl});

    // create config module to be loadable
    define('config', [], function () {
        return conf;
    });

    console.log('Start Game...');

    require(['gameManager'], function(gameManager){
    });



})();



















