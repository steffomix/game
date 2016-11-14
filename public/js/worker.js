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


define([], (

    function () {

        /**
         *
         *  '/js/thread.js'
         * @param string path must be full path
         * @returns Object {{run: run, queue: queue}}
         */
        function create (path) {

            var jobId = 0;
            var worker = new Worker(path);

            worker.jobs = {};


            function getId() {
                return (jobId++);
            }

            /**
             * Copy and return into an array
             * queue().length return count of open or running jobs
             * @returns {Array}
             */
            function queue() {
                var q = [];
                for (var j in worker.jobs) {
                    if (worker.jobs.hasOwnProperty(j)) {
                        q.push(worker.jobs[j]);
                    }
                }
                return q;
            }


            /**
             *
             * @param cmd string Command for the Worker
             * @param data object|array data for the command (will be serialized to JSON)
             *
             * @param cb function callback
             * @param scope object optional scope
             * @returns Job
             */
            function run(cmd, data, cb, scope) {
                var id = getId();
                worker.jobs[id] = {
                    job: new Job(id, cmd, data),
                    cb: cb,
                    scope: scope
                };
                worker.postMessage({
                    id: id,
                    cmd: cmd,
                    stay: false,
                    data: data
                });
                return id;
            }

            var Job = function (id, cmd, data) {
                this.id = id;
                this.cmd = cmd;
                this.request = data;
                this.response = null;
            };

            var onMessage = function (e) {
                var id = e.data.id;
                if(this.jobs[id]){
                    job =   this.jobs[id].job,
                    cb =    this.jobs[id].cb,
                    scope = this.jobs[id].scope;
                    if(!e.data.stay){
                        delete this.jobs[id];
                    }
                    job.response = e.data.data;
                    scope ? cb.apply(scope, job) : cb(job);
                }
            };

            worker.addEventListener('message', onMessage);

            run('--start--', path, function(job){
                console.log('worker ' + job.response + ' started');
            });

            return {
                run: run,
                queue: queue
            }

        }

        return {
            create: create
        }
    }
    )()
);
