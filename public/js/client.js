/* 
 * Copyright (C) 09.11.16 Stefan Brinkmann <steffomix@gmail.com>
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

requirejs.config({
    paths: {
        'jquery':    '/js/lib/jquery.min',
        'underscore':    '/js/lib/underscore-min',
        'io':   '/js/lib/socket.io-client',
        'pixi': '/js/lib/pixi.min',
        'gl':   '/js/lib/pixi-gl-core.min',
        'worker': '/js/worker-master',
        'game': '/js/game'
    }
});


login('stefan', 'user');

function loginFailed(){
    alert('Login failed');
}



function login(name, pass) {
    require(
        [
            'underscore',
            'io',
            'game'
        ],
        function (_, io, game) {
            console.log('Modules loaded.');
            var connection = io.connect('game.com:4343');
            connection.on('login', function(data){
                if(data.success === true){
                    connection.off('login');
                    game.start(connection);
                }else{
                    loginFailed();
                }
            })


            connection.emit('login', {name: name, pass: pass});



        }
    );
}


