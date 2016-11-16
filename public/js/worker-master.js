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


define([], (function () {

        var workerId = 0;

        /**
         *
         * @param scripts {Array} List of scripts to load into the Worker.
         *          Full paths are required (like HTML head script paths).
         * @param name {string} optional Human readable Name
         * @returns {{run: run, infinite: infinite, queue: queue}}
         */
        function create(scripts, name) {

            var jobId = 0;

            workerId++;
            var worker = new Worker('/js/worker-slave.js');

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
                var id = getId(),
                    job = new Job(id, cmd, data);
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
             * The Job will be the argument of the callback function
             *
             * @param id {int}
             * @param cmd {string}
             * @param data {any}
             * @constructor
             */
            var Job = function (id, cmd, data) {
                this.getId = function(){
                    return id;
                }
                this.cmd = cmd;
                this.request = data;
                this.response = null;
                this.event = null;
            };

            /**
             *
             */
            worker.addEventListener('message', function (e) {
                var id = e.data.id;
                var item = this.jobs[id],
                    job, cb, scope;
                if (item) {
                    job = item.job;
                    job.event = e;
                    cb = item.cb;
                    scope = item.scope;
                    if (!item.infinite) {
                        delete this.jobs[id];
                    }
                    job.response = e.data.data;
                    if(cb){
                        try {
                            scope ? cb.apply(scope, job) : cb(job);
                        } catch (e) {
                            console.log(e, console.trace(e));
                        }
                    }
                } else {
                    console.log('Response from deleted Job: ', e.data);
                }
            });

            /**
             * workers first run, will load scripts
             */
            _run(
                false,
                '***start***',
                {
                    id: workerId,
                    name: name || '',
                    scripts: scripts
                },
                function (job) {
                    console.log('worker ' + job.request + ' started');
                });


            return {
                run: run,
                infinite: infinite,
                queue: queue
            }

        }

        return {
            create: create
        }
    })()
);
