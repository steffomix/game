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
        '_':    '/js/lib/underscore-min',
        'io':   '/js/lib/socket.io-client',
        'pixi': '/js/lib/pixi.min',
        'gl':   '/js/lib/pixi-gl-core.min',

        'game': '/js/game'
    }
});




login('123', '123');

function loginFailed(){
    alert('Login failed');
}



function login(name, pass) {
    require(
        [
            'io',
            '_',
            'pixi',
            'gl',
            'game'
        ],
        function (socket, _, pixi, gl, game) {
            console.log('Modules loaded.');
            var io = socket.connect('game.com:4343');
            io.on('login', function(data){
                if(data.success === true){
                    io.off('login');
                    game.start(socket, _, pixi, gl);
                }else{
                    loginFailed();
                }
            })


            io.emit('login', {name: '123', pass: '123'});



        }
    );
}


