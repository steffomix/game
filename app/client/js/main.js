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


require(['config', 'eventDispatcher'], function(config, events){

    var groups = ['bower', 'lib', 'game', 'pixilayer', 'interface'],
        preloadModules = ['backbone', 'jquery', 'eventDispatcher'];

    // collect list of modules to preload
    for (var module in config.paths) {
        if (config.paths.hasOwnProperty(module)) {
            var path = config.paths[module];
            groups.forEach(function (group) {
                if (path.indexOf(group + '/') != -1) {
                    preloadModules.push(module);
                }
            })
        }
    }

    console.log('Preload modules: ', preloadModules);

    define('rottingUniverse', preloadModules, function (backbone, $, dispatcher) {
        backbone.$ = $;
        console.log('Trigger game initialize');


    });

    require(['rottingUniverse'], function () {
        console.log('game start...', performance.now())
    });
});



















