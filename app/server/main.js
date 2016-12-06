#!/usr/bin/env node

var server = require('./server'),
    coreModules = {
        config: require('./config.js'),
        dispatcher: require('./event-dispatcher'),
        http: server.http,
        socket: server.socket,

        /**
         * preload modules to receive appInit event
         */
        socketManager: require('./socket-manager'),
        Player: require('./player'),
        worldManager: require('./world-manager'),
        world: require('./world')
    };



// load and sync sqlite database
require('./db').connect(function (db){
    coreModules.db = db;

    // dispatch appInit with all coreModules
    coreModules.dispatcher.global.appInit.trigger(coreModules);

    var so = coreModules.socket,
        dsp = coreModules.dispatcher.io;

    so.on('connect', function (so) {
        dsp.connect.trigger(so);
    });

});





