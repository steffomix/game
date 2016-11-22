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
    // 1 DEBUG
    // 2 INFO
    // 4 WARN
    // 8 ERROR
    // 99 OFF
    var modules = [

        ['main', 'main', 0],

        // common shared
        ['worker', 'worker-master', 2],

        // worker: Server - Client Middleware
        ['socketManager', 'socket-manager', 2],
        ['gameCache', 'game-cache', 2],
        ['pathfinder', 'pathfinder', 2], // used by gamecache
        ['socketFrontend', 'socket-frontend',2],
        ['socketBackend', 'socket-backend', 2],
        ['workerSlave', '/js/worker-slave.js', 2], // must be full path

        // game
        ['gameManager', 'game-manager', 2],
        // html screen container from top to bottom
        ['dialogScreen', 'dialog-screen', 2],
        ['inputScreen', 'input-screen', 2],
        ['hudScreen', 'hud-screen', 2],
        ['gameScreen', 'game-screen', 2],

        // views
        ['viewConnect', 'view/viewConnect', 0]
    ];

    modules.forEach(function (item) {
        conf.paths[item[0]] = item[1];
        conf.logger[item[0]] = item[2]
    });

    requirejs.config({paths: conf.paths, baseUrl: conf.baseUrl});

    define('config', [], function () {
        return conf;
    });

    define('main', ['config', 'logger', 'worker', 'gameManager'], function (config, Logger, WorkMaster, gameManager) {

        var logger = Logger.getLogger('main').setLevel(config.logger.main || 0);

        logger.trace('App start, create worker...');
        var socketManager = new WorkMaster('socketManager', 'GameSocket1', socketManagerReady, onSocketMessage);


        function socketManagerReady (job) {
            logger.trace('SocketManager ready', job);
            connect();
        }

        function connect () {
            socketManager.send('back.connect', [config.server.host, config.server.port]);

            logger.trace('Connecting...');
        }

        /**
         * Forward Message
         * @param job
         */
        function onSocketMessage (job) {
            var cmd = (job.cmd || '').split('.'),
                data = job.data,
                c1 = cmd.shift();

            try {
                switch (c1) {
                    case 'screen':
                        gameManager.onSocketMessage(cmd.join('.'), data);
                        break;
                    default:
                        logger.error('Socket Message "' + cmd + '" not supported', job, new Error().stack);

                }
            } catch (e) {
                logger.error('Forward socketMessage failed: ' + e, job);
            }
        }


    });

    require(['main'], function(){});

})();



















