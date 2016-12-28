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
        debug: true, // show debug info on screen
        baseUrl: '/js/',
        paths: {
            // third party libs
            'logger': 'lib/loglevel.min', // https://github.com/pimterry/loglevel
            'underscore': 'lib/underscore', // http://underscorejs.org/
            'backbone': 'lib/backbone', // http://backbonejs.org/
            'jquery': 'lib/jquery.min', // http://jquery.com/
            'io': 'lib/socket.io.min', // http://socket.io/
            'stateMachine': 'lib/state-machine.min', // https://github.com/jakesgordon/javascript-state-machine
            'pixi': 'lib/pixi_v4.3.0', // http://www.pixijs.com/
            'pathfinding': 'lib/pathfinding' // https://github.com/qiao/PathFinding.js
        },
        logger: {},
        game: {
            fps: 30, // game calculations and pixi render per second
            tiles: {
                size: 100 // tile size in px
            }
        },
        server: {
            fps: 2 // send game updates per second
        }

    };

    // format:
    // module name, path, loglevel
    // 1: trace
    // 2: info
    // 3: warn
    // 4: error
    // 5: off
    var modules = [

        // game/shared
        ['util', 'util', 3],
        ['i18n', 'i18n', 3],
        ['translation', 'translation', 3],
        ['eventDispatcher', 'event-dispatcher', 3],
        ['tick', 'tick', 4],
        ['dataTypes', 'data-types', 0],
        ['debugInfo', 'debug-info', 0],
        ['gameRouter', 'game-router', 3],
        ['workerMaster', 'worker-master', 3],
        ['gameSocket', 'game-socket', 3],
        ['commandRouter', 'command-router', 3],

        // interface
        // ['interface', 'interface/interface', 0],
        ['interfaceApp', 'interface/interface-app', 0],
        ['interfaceConnect', 'interface/interface-connect', 0],
        ['interfaceLogin', 'interface/interface-login', 0],
        ['interfaceTopnav', 'interface/interface-topnav', 0],
        ['interfaceChat', 'interface/interface-chat', 0],
        ['interfaceGame', 'interface/interface-game', 0],

        // worker: Server - Client Middleware
        ['workerSlave', '/js/worker/worker-slave.js', 3], // must be full path
        ['server', 'worker/server', 0],
        ['workerSocket', 'worker/worker-socket', 4],
        ['workerRouter', 'worker/worker-router', 4],

        // cache and matrix renderer
        ['cache', 'worker/cache/cache', 0],
        //['pathfinder', 'worker/cache/pathfinder', 0], // used by gamecache
        ['cacheFloorManager', 'worker/cache/cache-floor-manager', 0],
        ['cacheFloor', 'worker/cache/cache-floor', 0],

        // game
        ['gameApp', 'game/game-app', 0],
        ['gameFloorManager', 'game/game-floor-manager', 0],
        ['gameFloor', 'game/game-floor', 0],
        ['gameTile', 'game/game-tile', 0],
        ['gamePlayer', 'game/game-player', 0],
        ['gameMainPlayer', 'game/game-main-player', 0],
        ['gamePlayerManager', 'game/game-player-manager', 0],

        // pixi
        ['pixiApp', 'pixi/pixi-app', 0],
        ['pixiRootContainer', 'pixi/container/pixi-root-container', 0],
        ['pixiTilesContainer', 'pixi/container/pixi-tiles-container', 0],
        ['pixiPlayerContainer', 'pixi/container/pixi-player-container', 0],

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
    requirejs.config({
        paths: conf.paths,
        baseUrl: conf.baseUrl
    });

    // create config module to be loadable
    define('config', [], function () {
        return conf;
    });

    define('gameRouter', ['commandRouter'], function (commandRouter) {
        var instance;
        return getInstance();
        function getInstance() {
            if (!instance) {
                try {
                    instance = commandRouter.getRouter('GameRouter');
                } catch (e) {
                    console.error('Module gameRouter create Instance: ', e);
                }
            }
            return instance;
        }
    });

    require(['backbone', 'jquery'], function (backbone, $) {
        backbone.$ = $;
    });

    console.log('Start Game...');
    require(['interfaceApp', 'gameApp', 'pixiApp'], function () {
    });


})();



















