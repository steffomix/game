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
        urlArgs: "c=" + (new Date().getTime()),
        paths: {
            // third party libs
            'logger': 'lib/loglevel.min', // https://github.com/pimterry/loglevel
            'seedrandom': 'lib/seedrandom', // https://github.com/davidbau/seedrandom
            'noise': 'lib/noise', // https://github.com/josephg/noisejs
            'underscore': 'lib/underscore', // http://underscorejs.org/
            'backbone': 'lib/backbone', // http://backbonejs.org/
            'jquery': 'lib/jquery.min', // http://jquery.com/
            'io': 'lib/socket.io.min', // http://socket.io/
            'stateMachine': 'lib/state-machine.min', // https://github.com/jakesgordon/javascript-state-machine
            'tween': 'lib/tween', // https://github.com/tweenjs/tween.js
            'pixi': 'lib/pixi_v4.3.0', // http://www.pixijs.com/
            'pathfinding': 'lib/pathfinding' // https://github.com/qiao/PathFinding.js
        },
        logger: {},
        game: {
            fps: 30, // game calculations and pixi render per second
            tiles: {
                size: 128, // tile size in px
                scale: .5 // scale tiles
            },
            chunks: {
                size: 5, // draw tiles per chunk: 5 = 5*5 tiles
                draw: 2 // visible chunks: 1 = 3*3 chunks, 2 = 5*5 chunks ...
            }
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
        //['gameFloorManager', 'game/game-floor-manager', 0],
        ['gameFloor', 'game/game-floor', 0],
        ['gameTile', 'game/game-tile', 0],
        ['gameMainPlayer', 'game/game-main-player', 0], // extends gamePlayer
        ['gamePlayer', 'game/game-player', 0], // extends gameMobile
        ['gameMobile', 'game/game-mobile', 0], // extends pixi.Container
        ['gamePlayerManager', 'game/game-player-manager', 0],

        // pixi
        ['pixiRootLayer', 'pixilayer/pixilayer-root', 0],
        ['pixiTilesLayer', 'pixilayer/pixilayer-tiles', 0],
        ['pixiPlayerLayer', 'pixilayer/pixilayer-player', 0],

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
        baseUrl: conf.baseUrl,
        depths: {}
    });

    // create config module to be loadable
    define('config', [], function () {
        return conf;
    });




    var groups = ['lib', 'game', 'pixilayer', 'interface'],
        preloadModules = ['backbone', 'jquery', 'eventDispatcher'],
        p;
    for (var m in conf.paths) {
        if (conf.paths.hasOwnProperty(m)) {
            p = conf.paths[m];
            groups.forEach(function (g) {
                if (p.indexOf(g + '/') != -1) {

                    preloadModules.push(m);
                }
            })
        }
    }

    console.log('Preload modules: ', preloadModules);

    define('rottingUniverse', preloadModules, function(backbone, $, dispatcher){
        backbone.$ = $;
        console.log('Trigger game initialize');
        dispatcher.game.initialize.claimTrigger('main.js')();
    });

    require(['rottingUniverse'], function () {
        console.log('game start...')
    });

})();



















