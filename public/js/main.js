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
    'pathfinder': 'pathfinder',

    // worker: Server - Client Middleware
        'socketManager': 'socket-manager',
        'gameCache': 'game-cache',
        'socketFrontend': 'socket-frontend',
        'socketBackend': 'socket-backend',
        'workerSlave': '/js/worker-slave.js',

    // game
    'game': '/js/game'

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

require(['config', 'logger', 'jquery', 'worker', 'game'], function (config, Logger, jquery, worker, game) {

    Logger.setLevel(Logger.DEBUG);
    Logger.setHandler(Logger.createDefaultHandler({
        defaultLevel: Logger.DEBUG
    }));
    logger = Logger.get('Main');

    var com;

    logger.debug('App start, create worker...');
    var socketManager = new worker.WorkMaster(config.worker.gameSocket, 'GameSocket1', socketManagerReady, onSocketMessage);
    //socketManager.run('connect', config.server);

    function socketManagerReady(job){
        logger.debug('SocketManager ready', job);
        socketManager.run('back.connect', {host: config.server.host, port: config.server.port}, function(job){
            logger.debug('Connected', job);
        });
    }

    function onSocketMessage(job){
        var cmd = job.cmd;
        var data = job.data;
    }

    $('#btn-login').click(function (e) {
        var name = $('#inp-login-name').value || 'guest',
            pass = $('#inp-login-pass').value || 'guest';

        com.run('login', [name, pass], function (job) {
            var res = job.response;

            if (res.success) {
                game.start(socketManager, res.user);
            }

        })
    });


});





















