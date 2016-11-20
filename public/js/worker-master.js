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

    // Logger.setLevel(Logger.DEBUG);
    // Logger.setHandler(Logger.createDefaultHandler({defaultLevel: Logger.DEBUG}));


    var allWorkerId = 0;


    /**
     *
     * @param script {Array} List of scripts to load into the Worker.
     *          Full paths are required (like HTML head script paths).
     * @param name {string} optional Human readable Name
     * @param createWorkerCallback {function} Callback for initial infinite Job
     * @param createWorkerScope {object} optional apply object for callback
     * @returns {object}
     */
    function WorkMaster(script, name, createWorkerCallback, infiniteCallback, createWorkerScope) {


        var workerId = allWorkerId++;
        var logger = Logger.get('Worker Master #' + workerId + ' "' + name + '"');

        var setupLogger = Logger.get('Worker Master Setup #' + workerId + ' "' + name + '"');
        var jobId = 0;
        var worker = new Worker(config.paths.workerSlave);

        setupLogger.debug('Create Worker-master #' + workerId);
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

        function getId() {

            return (jobId++) + '_' + Math.random().toString(36).substring(2);
        }

        /**
         *
         * Copy and return jobs into an array
         * queue().length return count of open or running jobs
         * @returns {Object} {runs: Array, infinites: Array}
         */
        function queue() {
            var q = [],
                qi = [],
                job;

            for (var j in worker.jobs) {
                job = worker.jobs[j];
                if (worker.jobs.hasOwnProperty(j)) {
                    job.infinite ? qi.push(worker.jobs[j]) : q.push(worker.jobs[j]);
                }
            }

            return {
                runs: q,
                infinites: qi
            };
        }

        /**
         *
         * @param infinite {boolean} the job can response multiple times
         * @param cmd {string} Command for the Worker
         * @param data {any}
         * @param cb {function} callback
         * @param scope {object} optional scope
         * @returns Job {Job}
         */
        function _run(infinite, cmd, data, cb, scope) {
            logger.debug('Run ' + (infinite ? 'infinite Job' : 'Job') + ' with cmd: ' + cmd, data);
            var id = getId(),
                job = new Job(infinite, id, cmd, data);
            worker.jobs[id] = {
                job: job,
                infinite: infinite,
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
        function run(cmd, data, cb, scope) {
            return _run(false, cmd, data, cb, scope);
        }

        /**
         * Wrapper to _run().
         * Same as run, but the job will *NOT* (never) be deleted
         * and make endless, most likely setInterval-callbacks (responses) possible
         * to provide continously updates to the caller of the job.
         * @param cmd string
         * @param data any (even number, string, boolean... )
         * @param cb callback function
         * @param scope object optional, applied to callback
         * @returns Job {Job}
         */
        function infinite(cmd, data, cb, scope) {
            return _run(true, cmd, data, cb, scope);
        }

        /**
         *
         */
        function shutdown() {
            setupLogger.debug('Shutdown worker "' + name + '"')
            run('***worker shutdown***');
            run = infinite = function () {
                console.error('Worker "' + name + '" with scripts ' + scripts + ' is down.', new Error().stack);
            }
        }

        /**
         * The Job will be the argument of the callback function
         *
         * @param id {int}
         * @param cmd {string}
         * @param data {any}
         * @constructor
         */
        function Job(infinite, id, cmd, data) {
            this.getId = function () {
                return id;
            }
            this.cmd = cmd;
            this.request = data;
            this.response = null;
            this.event = null;
            if(infinite){
                this.run = run;
            }
        }

        function onMessage(e) {
            var id = e.data.id;
            var item = this.jobs[id],
                job, cb, scope;
            if (item) {
                job = item.job;
                job.event = e;
                cb = item.cb;
                scope = item.scope;

                logger.debug('Receive message with cmd "' + job.cmd + '"', e.data.data);

                if (!item.infinite) {
                    delete this.jobs[id];
                }else{
                    job.cmd = e.data.cmd;
                }
                job.response = e.data.data;
                if (cb) {
                    try {
                        scope ? cb.apply(scope, job) : cb(job);
                    } catch (e) {
                        console.log(e, console.trace(e));
                    }
                }
            } else {
                console.log('Response from deleted Job: ', e.data);
            }
        }

        function onWorkerSetup(e) {
            if (e.data.cmd == '***worker ready***') {
                setupLogger.debug('Setup slave with: ' + script);
                _run(
                    true,
                    '***worker start***',
                    {
                        id: workerId,
                        name: name || '',
                        script: script,
                        config: config
                    },
                    infiniteCallback,
                    createWorkerScope);
            } else if (e.data.cmd == '***worker started***') {
                setupLogger.debug('Slave "' + name + '" ready to go. Perform callback...');
                worker.removeEventListener('message', onWorkerSetup);
                this.addEventListener('message', onMessage);
                try {
                    var job = worker.jobs[e.data.id].job;
                    job.workerId = workerId;
                    createWorkerScope ? createWorkerCallback.apply(createWorkerScope, [job]) : createWorkerCallback(job);
                } catch (e) {

                }
            } else {

            }
        }

        /**
         *  setup worker
         */
        worker.addEventListener('message', onWorkerSetup);

        /**
         * workers first run, will load scripts
         */
        /*
        function setupWorker() {
            _run(
                true,
                '***worker start***',
                {
                    id: workerId,
                    name: name || '',
                    script: script,
                    config: config
                },
                createWorkerCallback,
                createWorkerScope);
        }
        */

        this.run = run;
        this.infinite = infinite;
        this.queue = queue;
    }


    return {
        WorkMaster: WorkMaster
    };

})
;
