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
            logger: 'bower/loglevel/dist/loglevel.min',
            seedrandom: 'bower/seedrandom/seedrandom',
            underscore: 'bower/underscore/underscore-min', // mapped (defined) as lodash
            lodash: 'bower/lodash/dist/lodash.min',
            backbone: 'bower/backbone/backbone-min',
            jquery: 'bower/jquery/dist/jquery.min',
            io: 'bower/socket.io-client/dist/socket.io',
            machina: 'bower/machina/lib/machina.min',
            tween: 'bower/tween.js/src/Tween',
            pixi: 'bower/pixi.js/dist/pixi',
            pathfinding: 'lib/pathfinding',
            easystar: 'bower/easystarjs/bin/easystar-0.3.1.min',

            // own libs
            noise: 'lib/noise',
            events: 'lib/events',
            eventFactory: 'lib/event-factory',
            tick: 'lib/tick',
            i18n: 'lib/i18n'

        },
        logger: {},
        game: {
            frameTick: 35, // ticks per second. Game calculations and pixi render per second...
            workerTick: 2, // ticks per second. Send mouse position to worker...
            tiles: {
                size: 120, // tile size in px
                scale: .5// scale tiles
            },
            chunks: {
                size: 5 // draw tiles per chunk: 5 = 5*5 tiles
            },
            worker: {
                gameWorker: 'js/worker/worker.js' // started in game/game-app.js
            }
        },
        worker: {}

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
        ['translation', 'translation', 3],
        ['eventDispatcher', 'event-dispatcher', 3],
        ['debugInfo', 'debug-info', 0],
        ['workerMaster', 'worker-master', 3],
        ['commandRouter', 'command-router', 3],
        ['worldGenerator', 'world-generator', 0],
        ['tileDefinitions', 'tile-definitions', 0],

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
        ['workerMainPlayer', 'worker/worker-main-player', 0],
        ['workerEvents', 'worker/worker-events', 0],
        ['workerDispatcher', 'worker/worker-dispatcher', 0],
        ['workerPathfinder', 'worker/worker-pathfinder', 0],

        // cache and matrix renderer
        ['workerMain', 'worker/worker-main', 0],
        ['workerCache', 'worker/cache/cache', 0],
        //['pathfinder', 'worker/cache/pathfinder', 0], // used by gamecache
        ['cacheFloorManager', 'worker/cache/cache-floor-manager', 0],
        ['cacheFloor', 'worker/cache/cache-floor', 0],

        // game
        ['gameApp', 'game/game-app', 0],
        ['gameLocation', 'game/game-location', 0],
        ['gamePosition', 'game/game-position', 0],
        ['gameRouter', 'game/game-router', 3],
        ['gameSocket', 'game/game-socket', 3],
        //['gameFloorManager', 'game/game-floor-manager', 0],
        ['gameFloor', 'game/game-floor', 0],
        ['gameTile', 'game/game-tile', 0],
        ['gameMainPlayer', 'game/game-main-player', 0], // extends gamePlayer
        ['gamePlayer', 'game/game-player', 0], // extends gameMobile
        ['gameMobile', 'game/game-mobile', 0], // extends pixi.Container
        ['gamePlayerManager', 'game/game-player-manager', 0],

        // pixi
        ['pixiRoot', 'pixilayer/pixilayer-root', 0],
        ['pixiTiles', 'pixilayer/pixilayer-tiles', 0],
        ['pixiPlayers', 'pixilayer/pixilayer-players', 0],
        ['pixiMainPlayer', 'pixilayer/pixilayer-mainplayer', 0]

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

    define('underscore', ['lodash'], function(_){
        return _;
    })

    // create config module to be loadable
    define('config', [], function () {

        return conf;
    });

})();



















