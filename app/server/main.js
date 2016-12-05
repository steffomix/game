#!/usr/bin/env node

var server = require('./server'),
    coreModules = {
        config: require('./config.js'),
        dispatcher: require('./event-dispatcher'),
        http: server.http,
        socket: server.socket
    };

// load and sync sqlite database
require('./db').connect(onDbConnect);

// preload Modules for appInit event
require('./socket-events');
require('./player');
require('./world');

// start app on loaded db
function onDbConnect(db){
    coreModules.db = db;

    var so = coreModules.socket,
        dsp = coreModules.dispatcher.io;

    so.on('connect', function (so) {
        dsp.connect.trigger(so);
    });

    so.on('disconnect', function(e){
        dsp.disconnect.trigger(e);
    });

    // dispatch appInit with all coreModules
    coreModules.dispatcher.global.appInit.trigger(coreModules);
}





