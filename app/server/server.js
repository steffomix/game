//


var config = require('./config'),
    http = require('http'),
    io = require('socket.io'),
    fs = require('fs'),
    path = require('path'),
    server = http.createServer(function (request, response) {
        console.log('request ', request.url);

        var filePath = request.url;
        if (filePath == '/') filePath = '/index.html';
        filePath = config.server.publicHtml + filePath;

        var extname = String(path.extname(filePath)).toLowerCase();
        var contentType = 'text/html';
        var mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.map': 'text/html',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.wav': 'audio/wav',
            '.mp3': 'audio/mp3',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.svg': 'application/image/svg+xml'
        };

        contentType = mimeTypes[extname] || 'application/octect-stream';

        fs.readFile(filePath, function (error, content) {
            if (error) {
                if (error.code == 'ENOENT') {
                    response.writeHead(200);
                    response.end('File not found: ' + error.code + '\n');
                    response.end();
                }
                else {
                    response.writeHead(500);
                    response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                    response.end();
                }
            }
            else {
                response.writeHead(200, {'Content-Type': contentType});
                response.end(content, 'utf-8');
            }
        });

    });

server.listen(config.server.port, config.server.ip);
console.log('Server running ' + config.server.ip + ':' + config.server.port);

var ioServer = http.createServer(function(){});
ioServer.listen(8000);
//io.set("transports", ["websocket"]);

exports = module.exports = {
    http: server,
    socket: io(ioServer)
};