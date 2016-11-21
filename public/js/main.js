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

var srcScripts = {

    // third party libs
    'stacktrace': 'lib/stacktrace.min',
    'logger': 'lib/logger',
    'underscore': 'lib/underscore.min',
    'jquery': 'lib/jquery.min',
    'io': 'lib/socket.io-client',
    'pixi': 'lib/pixi.min',
    'pathfinding': 'lib/pathfinding',

    // common shared
    'worker': 'worker-master',

    // worker: Server - Client Middleware
    'socketManager': 'socket-manager',
    'gameCache': 'game-cache',
    'pathfinder': 'pathfinder', // used by gamecache
    'socketFrontend': 'socket-frontend',
    'socketBackend': 'socket-backend',
    'workerSlave': '/js/worker-slave.js', // must be full path

    // game
    'gameManager': 'game-manager',
    // html screen container from top to bottom
    'dialogScreen': 'dialog-screen',
    'inputScreen': 'input-screen',
    'hudScreen': 'hud-screen',
    'gameScreen': 'game-screen'
};

requirejs.config({paths: srcScripts, baseUrl: '/js/'});

define('config', [], function () {

    return {
        server: {
            host: 'game.com',
            port: '4343'
        },
        paths: srcScripts,
        worker: {
            gameSocket: srcScripts.socketManager,
            pathfinder: srcScripts.pathfinder
        }
    }

});

require(['config', 'logger', 'worker', 'gameManager'], function (config, Logger, WorkMaster, gameManager) {

    Logger.setLevel(Logger.DEBUG);
    Logger.setHandler(Logger.createDefaultHandler({
        defaultLevel: Logger.DEBUG
    }));
    logger = Logger.get('Main');
    logger.debug('App start, create worker...');
    var socketManager = new WorkMaster(config.worker.gameSocket, 'GameSocket1', socketManagerReady, onSocketMessage);


    function socketManagerReady (job) {
        logger.debug('SocketManager ready', job);
        connect();
    }



    function connect(){
        //socketManager.send('back.connect', {host: config.server.host, port: config.server.port});
        var sock = socketManager.socket('test', 'testmessage', function(job){

        }, {c: 2342});
        logger.debug('Connecting...');
    }

    function onSocketMessage (job) {
        var cmd = (job.cmd || '').split('.');
        var data = job.response;

        var c1 = cmd.shift();
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





















