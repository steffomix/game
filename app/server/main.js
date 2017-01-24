var config = require('./config.js'),
    events = require('./server-events'),
    pool = require('./connection-pool'),
    players = require('./player-pool'),
    server = require('./server.js'),
    db = require('./db');

process.stdin.resume();



process.on('SIGINT', function () {
    // forward to exit
    process.exit(0);
});
process.on('exit', function(){
    // force players to save
    players.onExit();
    process.exit(0);
});

server.socket.on('connect', pool.addConnection);











