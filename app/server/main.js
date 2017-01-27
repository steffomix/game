var config = require('./config.js'),
    events = require('./server-events'),
    connectionPool = require('./connection-pool'),
    playerPool = require('./player-pool'),
    server = require('./server.js'),
    db = require('./db');

process.stdin.resume();


process.on('exit', function(){
    // force playerPool to save
    playerPool.onExit();
    db.optimizeUsers();
    var e = new Error();
    e.message && console.log(e.message, e.stack);
    process.exit(0);
});

process.on('SIGINT', function () {
    // forward to exit
    process.exit(0);
});

process.on('uncaughtException', function(e){
    console.error(e);
    process.exit(1);
});


db.initialize(function(){
    server.socket.on('connect', connectionPool.addConnection);
});











