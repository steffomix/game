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

    // All scripts used, even from workers
    // Worker-slaves will add '.js' to file names
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
        'gameSocket': '/js/gamesocket'

    };

    requirejs.config({
        paths: srcScripts
    });

    // worker-slave will add .js to each filename
    var workerScripts = {
        gameSocket: [
            srcScripts.stacktrace,
            srcScripts.logger,
            srcScripts.io,
            srcScripts.underscore,
            srcScripts.gameSocket
        ],
        pathfinder: [
            srcScripts.stacktrace,
            srcScripts.logger,
            srcScripts.pathfinding,
            srcScripts.pathfinder
        ]
    };


    require(['stacktrace', 'logger', 'underscore', 'jquery', 'pixi', 'worker'],
        function (Stacktrace, Logger, _, $, Pixi, worker) {
            Logger.setLevel(Logger.DEBUG);
            Logger.setHandler(Logger.createDefaultHandler({
                defaultLevel: Logger.DEBUG
            }));

            var pathfinder = worker.create(workerScripts.pathfinder, 'Pathfinder Main');
            var io = worker.create(workerScripts.gameSocket, 'GameSocket');

            $('#btn-login').click(function (e) {
                var name = $('#inp-login-name').value || 'guest',
                    pass = $('#inp-login-pass').value || 'guest';

                io.run('login', {name: name, pass: pass}, function (job) {
                    var res = job.response,
                        success = res.success,
                        name = res.name;

                    if (success) {
                        startGame(name);
                    }

                })
            })
        });

    function Game(io, Pathfinder) {

    }


})();






















