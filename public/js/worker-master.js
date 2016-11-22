/*
 * Copyright (C) 10.11.16 Stefan Brinkmann <steffomix@gmail.com>
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
 *
 *  ### find
 *  jobId = worker.create(
 *      'find',
 *      {
 *          startX,
 *          startY,
 *          endX,
 *          endY,
 *          matrix
 *      },
 *      function (job) {
 *      },
 *      scope optional
 *  );
 *
 *
 */


define(['config', 'logger'], function (config, Logger) {


    var allWorkerId = 0;


    /**
     *
     * @param script {Array} List of scripts to load into the Worker.
     *          Full paths are required (like HTML head script paths).
     * @param name {string} optional Human readable Name
     * @param socketManagerReady {function} Callback for initial infinite Job
     * @param createWorkerScope {object} optional apply object for callback
     * @returns {object}
     */
    function WorkMaster (script, name, socketManagerReady, onSocketMessage, createWorkerScope) {

        var workerId = allWorkerId++;
        var logger = Logger.getLogger('Worker Master #' + workerId + ' "' + name + '"').setLevel(config.logger.worker || 0);

        var setupLogger = Logger.getLogger('Worker Master Setup #' + workerId + ' "' + name + '"').setLevel(config.logger.worker || 0);
        var jobId = 0;
        var worker = new Worker(config.paths.workerSlave);


        setupLogger.trace('Create Worker-master #' + workerId);
        /**
         * Container for running jobs
         * The contents will look like that:
         * worker.jobs {
             *      0: {
             *          id: jobId,
             *          job: Job {
             *              id: jobId,
             *              cmd: cmd,
             *              data: data
             *          },
             *          callback: function,
             *          scope: object
             *          },
             *       1: ...
             *  }
         *
         *
         * @type {{}}
         */
        worker.jobs = {};

        function getId () {

            return (jobId++) + '_' + Math.random().toString(36).substring(2);
        }

        /**
         *
         * Copy and return jobs into an array
         * queue().length return count of open or running jobs
         * @returns {Object} {runs: Array, infinites: Array}
         */
        function queue () {
            var q = [],
                qi = [],
                job;

            for (var j in worker.jobs) {
                job = worker.jobs[j];
                if ( worker.jobs.hasOwnProperty(j) ) {
                    job.sock ? qi.push(worker.jobs[j]) : q.push(worker.jobs[j]);
                }
            }

            return {
                runs: q,
                socks: qi
            };
        }

        /**
         *
         * @param sock {boolean} the job can response multiple times
         * @param cmd {string} Command for the Worker
         * @param data {any}
         * @param cb {function} callback
         * @param scope {object} optional scope
         * @returns Job {Job}
         */
        function _run (sock, cmd, data, cb, scope) {

            var id = getId(),
                job = new Job(sock, id, cmd, data);
            worker.jobs[id] = {
                job: job,
                sock: sock,
                cb: cb,
                scope: scope
            };
            worker.postMessage({
                id: id,
                cmd: cmd,
                data: data,
                callStack: new Error('Start Worker ' + (name || '')).stack.split('\n')
            });
            return job;
        }

        /**
         * Send a fire-and-forget message
         * @param cmd {string}
         * @param data any
         */
        function send (cmd, data) {
            try {
                logger.trace('Send cmd: ' + cmd, data);
                worker.postMessage({
                    id: null,
                    cmd: cmd,
                    data: data
                });
            } catch (e) {
                logger.error('Send message failed: ' + e);
            }
        }

        /**
         * Wrapper to _run().
         * Start a job that can response only one times
         * afterwards its deleted from workers joblist
         * and makes no further callbacks (response) possible.
         * @param cmd {string} command, optional, defaults to undefined
         * @param data {any} (even number, string, boolean... ) optional, defaults to undefined
         * @param cb {callback} function optional, if not set callback will be skipped quietly
         * @param scope {object} optional, applied to callback
         * @returns Job {Job} worker-master.js->Job
         */
        function request (cmd, data, cb, scope) {
            logger.trace('Request cmd: ' + cmd, data);
            return _run(false, cmd, data, cb, scope);
        }

        /**
         * Wrapper to _run().
         * Same as run, but the job will *NOT* (never) be deleted
         * and make endless, most likely setInterval-callbacks (responses) possible
         * to provide continously updates to the caller of the job.
         *
         * @param cmd string
         * @param data any (even number, string, boolean... )
         * @param cb callback function
         * @param scope object optional, applied to callback
         * @returns Job {Job}
         */
        function socket (cmd, data, cb, scope) {
            logger.trace('socket cmd: ' + cmd, data);
            return _run(true, cmd, data, cb, scope);
        }

        /**
         *
         */
        function shutdown () {
            setupLogger.trace('Shutdown worker "' + name + '"')
            send('***worker shutdown***');
            send = socket = request = function () {
                console.error('Worker "' + name + '" with script ' + script + ' is down.', new Error().stack);
            }
        }

        /**
         * Job will be the argument of the callback function
         *
         * To check if Job is request or response:
         *      isRequest = Job.data === Job.request
         *      isResponse = Job.data === Job.response
         *
         * WorkerMaster holds a reference of Job.request and put it back on response.
         * So Job.request is serialized and de-serialized only on Worker side
         * and can be compared with Job.request on Browser-side.
         *
         * @param sock {bool} true turns the job into a socket
         * @param id {int}
         * @param cmd {string}
         * @param data {any}
         * @constructor
         */
        function Job (sock, id, cmd, data) {
            var self = this;
            self.getId = function () {
                return id;
            };
            self.isSocket = function () {
                return sock;
            };
            self.cmd = cmd;
            self.data = self.request = data;
            self.response = null;
            if ( sock ) {
                self.send = send;
                self.request = request;
            }
        }

        /**
         *
         * @param e {Event}
         */
        function onMessage (e) {
            var id = e.data.id;
            if ( !id ) {
                logger.error('Receives Message without Id. Reject Message', e);
                return;
            }
            var item = this.jobs[id],
                job, cb, scope;
            if ( item ) {
                job = item.job;
                cb = item.cb;
                scope = item.scope;

                logger.trace('Receive ' + (item.sock ? 'socket' : 'response' ) + ' message with cmd "' + job.cmd + '"', e.data.data);

                if ( !item.sock ) {
                    delete this.jobs[id];
                } else {
                    job.cmd = e.data.cmd;
                }
                job.data = job.response = e.data.data;
                if ( cb ) {
                    try {
                        if ( scope ) {
                            cb.apply(scope, job);
                        } else {
                            cb(job);
                        }
                    } catch (e) {
                        logger.error('Invoke callback onMessage raised error: ', e);
                    }
                }
            } else {
                console.log('Response from deleted or never existed Job. Reject Message', e);
            }
        }

        /**
         * Handle Worker startup sequence
         * @param e {Event}
         */
        function onWorkerSetup (e) {
            if ( e.data.cmd == '***worker ready***' ) {
                setupLogger.trace('Setup slave with: ' + script);
                socket(
                    '***worker start***',
                    {
                        id: workerId,
                        name: name || '',
                        script: script,
                        config: config
                    },
                    onSocketMessage,
                    createWorkerScope);
            } else if ( e.data.cmd == '***worker started***' ) {
                setupLogger.trace('Slave "' + name + '" ready to go. Perform callback...');
                worker.removeEventListener('message', onWorkerSetup);
                this.addEventListener('message', onMessage);
                try {
                    var job = worker.jobs[e.data.id].job;
                    job.cmd = '';
                    job.request = null;
                    job.response = null;
                    createWorkerScope ? socketManagerReady.apply(createWorkerScope, [job]) : socketManagerReady(job);
                } catch (e) {

                }
            } else {

            }
        }

        /**
         *  setup worker
         */
        worker.addEventListener('message', onWorkerSetup);


        this.send = send;
        this.request = request;
        this.socket = socket;
        this.queue = queue;
    }


    return WorkMaster;

})
;
