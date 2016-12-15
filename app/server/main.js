var config = require('./config.js'),
    _ = require('underscore');

// load modules and sync sqlite database
require('./db').connect(function (db) {
    var lm = config.loadedModules = {};
    _.each(config.modules, function (v, k) {
        config.loadedModules[k] = require(v);
    });

    lm.server.socket.on('connect', function (so) {
        lm.eventDispatcher.io.connect.trigger(so);
    });

});






