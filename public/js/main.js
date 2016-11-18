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
    'stacktrace': '/js/lib/stacktrace.min',
    'logger': '/js/lib/logger',
    'underscore': '/js/lib/underscore.min',
    'jquery': '/js/lib/jquery.min',
    'io': '/js/lib/socket.io-client',
    'pixi': '/js/lib/pixi.min',
    'pathfinding': '/js/lib/pathfinding',

    // common shared
    'worker': '/js/worker-master',
    'pathfinder': '/js/pathfinder',

    // worker
    'gameData': '/js/gamesocket',
        'socketRequest': '/js/socketrequest',
        'socketResponse': '/js/socketresponse',

    // game
    'game': '/js/game'

};

requirejs.config({paths: srcScripts});

define('config', [], function () {

    return {
        paths: srcScripts,
        worker: {
            gameSocket: srcScripts.gameData,
            pathfinder: srcScripts.pathfinder
        }

    }

});

require(['config', 'logger', 'jquery', 'worker', 'game'], function (config, Logger, jquery, worker, game) {

    Logger.setLevel(Logger.DEBUG);
    Logger.setHandler(Logger.createDefaultHandler({
        defaultLevel: Logger.DEBUG
    }));



    var io = worker.create(config.worker.gameSocket, 'GameSocket');

    $('#btn-login').click(function (e) {
        var name = $('#inp-login-name').value || 'guest',
            pass = $('#inp-login-pass').value || 'guest';

        io.run('login', {name: name, pass: pass}, function (job) {
            var res = job.response;

            if (res.success) {
                game.start(io, res.user);
            }

        })
    });


});





















