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

function __manageRequest__(){

};

(function () {

    Logger.setHandler(Logger.createDefaultHandler({
        defaultLevel: Logger.DEBUG
    }));
    Logger.setLevel(Logger.DEBUG);

    var ioLogger = Logger.get('GameSocket');

    var connection = null; // socket

    __manageRequest__ = function(job) {

        var cmd = job.cmd;
        var req = job.request;

        switch (cmd) {

            case 'login':
                 login(job);
                break;

            case 'logout':
                connection = null;
                break;

            default:
                job.error('cmd ' + cmd + ' not supported');

        }
    }

    function login(job) {
        var req = job.request,
            name = req.name,
            pass = req.pass;
 
        // todo game config io socket, domain and port
        ioLogger.debug('connect to game.com:4343');
        var con = io.connect('game.com:4343');

        con.on('login', function (data) {
            if (data.success === true) {
                ioLogger.debug('Response Login success: ' + data.name);
                connection = con;
                connection.off('login');
                job.response('login', data.name);
            } else {
                loginFailed();
            }
        });

        ioLogger.debug('Request User Login:', name);
        con.emit('login', {name: name, pass: pass});


    }

})();
