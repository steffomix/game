//


var publicHtml = '../public',
    config = require('./config'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    server = http.createServer(function (request, response) {
        console.log('request ', request.url);

        var filePath = request.url;
        if ( filePath == '/' ) filePath = '/index.html';
        filePath = publicHtml + filePath;

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
            if ( error ) {
                if ( error.code == 'ENOENT' ) {
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
server.listen(config.server.port);
console.log('Server running at http://127.0.0.1:' + config.server.port);

exports.httpServer = server;