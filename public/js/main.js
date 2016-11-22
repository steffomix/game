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
            'logger': 'lib/loglevel-mod', // https://github.com/pimterry/loglevel ***modified***
            'underscore': 'lib/underscore.min', // http://underscorejs.org/
            'backbone': 'lib/backbone', // http://backbonejs.org/
            'jquery': 'lib/jquery.min',
            'io': 'lib/socket.io-client',
            'pixi': 'lib/pixi.min',
            'pathfinding': 'lib/pathfinding', // https://github.com/qiao/PathFinding.js
            'stateMachine': 'lib/state-machine' // https://github.com/jakesgordon/javascript-state-machine
        },
        logger: {}
    };

    // format:
    // module name, path, loglevel
    // 0: trace <- modified: prepend modulename
    // 1: debug
    // 2: info
    // 3: warn
    // 4: error
    // 5: off
    var modules = [

        // game
        ['gameManager', 'game-manager', 0],
        ['dialogLayer', 'dialog-layer', 0],
        ['inputLayer', 'input-layer', 0],
        ['hudLayer', 'hud-layer', 0],
        ['gameLayer', 'game-layer', 0],

        // worker: Server - Client Middleware
        ['socketManager', 'socket-manager', 0],
        ['gameCache', 'game-cache', 2],
        ['pathfinder', 'pathfinder', 2], // used by gamecache
        ['socketFrontend', 'socket-frontend',2],
        ['socketBackend', 'socket-backend', 2],
        ['workerMaster', 'worker-master', 0],
        ['workerSlave', '/js/worker-slave.js', 0], // must be full path

    ];

    // setup config for paths and logger
    // The logger is modified to prefix module name on loglevel trace
    modules.forEach(function (item) {
        conf.paths[item[0]] = item[1];
        conf.logger[item[0]] = item[2]
    });

    // setup requirejs
    requirejs.config({paths: conf.paths, baseUrl: conf.baseUrl});

    // create config module to be loadable
    define('config', [], function () {
        return conf;
    });

    console.log('Start Game...');

    require(['gameManager'], function(gameManager){
        gameManager.connect();
    });



})();



















