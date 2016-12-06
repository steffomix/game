/* 
 * Copyright (C) 03.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');


var listener = {};
var e = function(key, fn){};
exports = module.exports = {

    global: {
        appInit: e
    },
    db: {
        connect: e
    },
    io: {
        connect: e
    },
    player: {
        disconnect: e,
        login: e,
        logout: e
    },
    world: {

    }


};

_.each(exports, function(groupObj, groupName){
    listener[groupName] = new EventEmitter();
    groupObj.off = function(fn){
        _.each(groupObj, function(item) {
            item.off(fn);
        });
    };
    groupObj.getEmitter = function(){
        return listener[groupName];
    };
    _.each(groupObj, function(itemObj, itemName){

        groupObj[itemName] = function(fn){
            listener[groupName].on(itemName, fn);
        };
        groupObj[itemName].trigger = function(){
            listener[groupName].emit.apply(listener[groupName], [itemName].concat(Array.prototype.slice.call(arguments)));
        };
        groupObj[itemName].once = function(fn){
            listener[groupName].once(itemName, fn);
        };
        groupObj[itemName].off = function(fn){
            fn ? listener[groupName].removeListener(itemName, fn) : listener[groupName].removeAllListeners(itemName);
        }
    })
});

