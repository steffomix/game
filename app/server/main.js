var config = require('./config.js'),
    events = require('./server-events'),
    pool = require('./connection-pool')
    server = require('./server.js');

server.socket.on('connect', pool.addConnection);











