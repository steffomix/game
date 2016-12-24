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

/**
 * Server config
 */

var path = require('path');

exports = module.exports = {
    tick: {
        sendGameState: .2 // ticks per second
    },
    server: {
        staticHtml: process.env.HEROKU_NODEJS_STATIC_HTML || process.env.OPENSHIFT_NODEJS_STATIC_HTML || path.join(__dirname, '../client'),
        ip: process.env.HEROKU_NODEJS_IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
        port: process.env.PORT || process.env.HEROKU_NODEJS_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080
    },
    db: {
        driver: 'sqlite://',
        url: path.join((process.env.HEROKU_NODEJS_STORAGE || process.env.OPENSHIFT_NODEJS_STORAGE || 'db'), 'db.sqlite3')
    },
    modules: {
        'server': './server',
        'eventDispatcher': './event-dispatcher',
        'db': './db',
        'connectionManager': './connection-manager',
        'player': './player',
        'playerLocation': './player-location',
        'socketManager': './socket-manager',
        'world': './world',
        'floorManager': './floor-manager',
        'floor': './floor',
        'worldManager': './world-manager',
        'tile': './tile'
    },
    loadedModules: {}
};