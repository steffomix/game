/* 
 * Copyright (C) 16.11.16 Stefan Brinkmann <steffomix@gmail.com>
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
 * socketManager
 * Web Worker entry point
 */
self.require(
    [__slaveModuleID__, 'logger', 'io', 'underscore', 'socketFrontend', 'socketBackend', 'gameCache'],
    function (slave, Logger, io, _, front, back, cache) {

        Logger.setHandler(Logger.createDefaultHandler({defaultLevel: Logger.DEBUG}));
        Logger.setLevel(Logger.DEBUG);
        var instance,
            logger = Logger.get('Socket-Manager');

        return getInstance();

        function getInstance () {
            if ( instance === undefined ) {
                instance = new Manager();
                slave.onMessage = instance.manageSlave;
            }
            return instance;
        }


        function Manager () {

            if ( instance ) {
                var e = 'Socket Manager Instance already created';
                logger.error(e, new Error().stack);
                throw(e);
            }

            var commands = {'back.connect': 1};

            this.manage = manage;
            this.manageSlave = manageSlave;

            front.init(this, slave);
            cache.init(this);
            back.init(this);

            // map workers for apply in method Manager::manage
            var socketWorkers = {front: front, cache: cache, back: back};


            function connect (domain, port, callback) {
                domain = domain || config.server.domain;
                port = port || config.server.port;

                logger.debug('connect to game.com:4343');
                var sock = io.connect(domain + ':' + port);
                if ( sock.connected ) {
                    socket = sock;
                    context ? callback.apply(context) : callback();
                }
            }

            function disconnect () {

            }

            function login (name, pass) {
                var req = job.request,
                    name = req.name,
                    pass = req.pass;

                // todo game config io socket, domain and port


                con.on('login', function (data) {
                    if ( data.success === true ) {
                        ioLogger.debug('Response Login success: ', data.user);

                        socket = new Socket(con);
                        con.off('login');

                        job.response({
                                success: true,
                                user: data
                            }
                        );
                    } else {
                        loginFailed();
                    }
                });

                ioLogger.debug('Request User Login:', name);
                con.emit('login', {name: name, pass: pass});
            }

            function logout () {

            }

            /**
             * Receive JobContext from slave, convert to manageable and forward to manage.
             * If Job.data is an array, all its items will be used as arguments.
             * In all other cases Job.data is used as one (first) function.argument
             * @param job
             */
            function manageSlave (job) {
                var cmd = job.cmd,
                    data = job.data,
                    args;

                if ( Array.isArray(data) ) {
                    data.unshift(cmd);
                    args = data;
                } else {
                    args = [cmd, data];
                }
                manage.apply(this, args);
            }


            /**
             * Manage commands to socket-frontend, socket-backend and game-cache
             * Commands loaded from Server:
             *      manage('front.<cmd>', arg1, arg2, ...)
             *      manage('back.<cmd>', arg1, arg2, ...)
             *      manage('cache.<cmd>', arg1, arg2, ...)
             *
             * Static Manager Commands:
             *      manage('connect')
             *      manage('disconnect')
             *      manage('login', name, pass)
             *      manage('logout')
             *
             * @returns {any} null on error or disabled commands, all other depends on command
             */
            function manage () {
                var args = _.toArray(arguments),
                    cmd = (args.shift() || '').split('.'),
                    scope = cmd[0], fn = cmd[1],
                    cmdReadable = scope + '.' + fn;

                if ( !scope || !socketWorkers[scope]) {
                    logger.error('Scope "' + scope + '" not set or invalid', new Error().stack);
                    return null;
                }

                if ( !fn || !scope[fn]){
                    logger.error('Function "' + fn + '" not set ot invalid', new Error().stack);
                    return null;
                }

                if ( commands[scope][cmd] === true ) {
                    // execute command
                    try {
                        logger.debug('Execute command ' + cmdReadable, args);
                        return socketWorkers[scope][cmd].apply(socketWorkers[scope][cmd], args);
                    } catch (e) {
                        logger.error('Command ' + cmdReadable + ' throw error: ' + e, args, new Error().stack);
                        return null;
                    }
                } else if ( commands[scope][cmd] === false ) {
                    // block command
                    logger.warn('Command ' + cmdReadable + ' disabled by Server.', args);
                    return null;
                } else {
                    logger.error('Execute (manage) command: ' + cmdReadable + ' impossible', args);
                    return null;
                }
            }
        }
    });


