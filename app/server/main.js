
var debug = require('debug');

try{
    var config = require('./config.js'),
        dispatcher = require('./event-dispatcher'),
        server = require('./server'),
        http = server.http,
        socket = server.socket;

// load and sync sqlite database
    require('./db').connect(function (db) {

        // preload modules
        var socketManager = require('./socket-manager'),
            Player = require('./player'),
            worldManager = require('./world-manager'),
            World = require('./world'),
            floorManager = require('./floor-manager'),
            Floor = require('./floor'),
            Tile = require('./tile');

        socket.on('connect', function (so) {
            dispatcher.io.connect.trigger(so);
        });

    });
}catch(e){
    console.log(e);
    debug.log(e);
}






