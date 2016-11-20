/*
 * Copyright (C) 14.11.16 Stefan Brinkmann <steffomix@gmail.com>
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

self.importScripts('/js/lib/require.js');

var __slaveModuleID__ = Math.random().toString(36).substring(2) + new Date().getTime();

// create slave with unique module name
define(__slaveModuleID__,
    [],
    (function () {

        function JobContext(e) {
            this.cmd = e.data.cmd;
            this.request = e.data.data;
            // private id
            var id = e.data.id;
            this.getId = function () {
                return id;
            }
        }

        /**
         * response with cmd from request
         * @param data any
         */
        JobContext.prototype.response = function (data) {
            self.postMessage({
                id: this.getId(),
                cmd: this.cmd,
                data: data,
                callStack: (this.callStack || '') + (slaveName || '') + new Error('Worker finished').stack.split('\n')
            });
        };

        /**
         * response with other cmd
         * most likely for infinite Jobs
         * @param cmd
         * @param data
         */
        JobContext.prototype.send = function (cmd, data) {
            self.postMessage({
                id: this.getId(),
                cmd: cmd,
                data: data
            });
        };

        var slave = {
            socket: null,
            /**
             * There sometimes is a timing problem on Google Chrome when the first job occurs
             * before the slave is fully loaded, initialized an onMessage finally overwritten.
             * To make the trouble perfect, this problem occurs mostly (if not only) when there is no Debugger running.
             *
             * In that case the Job must be resend as long as onMessage is not overwritten.
             * Through the overwriting of onMessage occurs another problem: The reference of
             * onMessage can not be used directly (self.onMessage) because its replaced with the new one.
             * It has to be called with an evaluated identifier (self['onMessage'])
             *
             *
             * @param job
             */
            // todo Google Chrome (only **without** debugger) seems to bounce initialization and call it twice :-S WTF?!?
            onMessage: function (job) {
                var self = this;
                console.warn('Overwrite worker-slave -> slave -> onMessage. Resend Message in 100ms', {job: job});
                setTimeout(function ress(j){
                    if(!j){
                        console.warn('no Job set');
                    }
                    console.warn('Resend message' + j.cmd, {job: j});
                    self['onMessage'](j);
                }, 20, job);
            },
            send: function (cmd, data) {
                console.log('Socket-slave send ' + cmd, data, this.onMessage)
                this.socket.send(cmd, data, this.onMessage);
            }
        };

        var logger,
            slaveId,
            slaveName,
            slaveConfig,
            slaveScript;

        function onStart(e) {
            var job = new JobContext(e);


            slaveId = job.request.id;
            slaveName = job.request.name;
            slaveScript = job.request.script;
            slaveConfig = job.request.config;

            // config requirejs with data from worker-master
            requirejs.config({paths: slaveConfig.paths});

            // load slave main script (entry point)
            self.importScripts(slaveScript + '.js');

            // delete command
            job.cmd = '';

            // register infinite job as main socket
            slave.socket = job;
            slave.config = slaveConfig;

            // remove starting listener
            self.removeEventListener('message', onStart);
            // add runtime listener
            self.addEventListener('message', onMessage);

            job.send('***worker started***');
            console.log('Slave #' + slaveId + ' ' + slaveName + ' with script: "' + slaveScript + '\n Send cmd "***worker started***"');
        }

        function onMessage(e) {
            console.log('Worker Slave onMessage: ', e.data);
            var job = new JobContext(e);
            if (job.cmd == '***worker shutdown***') {
                console.log('Shutdown Worker' + slaveId + ' "' + slaveName + '" with Scripts: ', slaveScripts);
                close();
            } else {
                slave.onMessage(job);
            }
        }

        self.addEventListener('message', onStart);

        self.postMessage({cmd: '***worker ready***'})

        console.log('Worker Slave waking up. Send cmd "***worker ready***"')
        return slave;

    })());

require([__slaveModuleID__], function(slave){});