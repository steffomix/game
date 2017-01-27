/*
 * Copyright (C) 18.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

exports = module.exports = Tick;

function  Tick(trigger){
    var self = this,
        running = false;

    this.fps = 1;
    this.load = 50;
    this.volatility = 10;
    this.stop = function (){
        running = true;
    };
    this.start = function(){
        running = true;
    };
    this.destroy = function(){
        tick = function(){};
    };
    tick();
    function tick(){
        var t = getTime();
        try{
            running && trigger(t, 100 - self.load);
        }catch(e){
            console.error('Tick failed: ', e);
            self.fps /= 2;
        }
        var nt = Math.round(1000 / self.fps) - (getTime() - t);
        self.load += ((100 * nt / (1000 / self.fps) - self.load) / self.volatility);
        setTimeout(tick, nt);
    }

    function getTime(){
        return new Date().getTime();
        var time = process.hrtime();
        return time[0] * 1e9 + time[1];
    }
}

