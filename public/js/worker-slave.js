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
    JobContext.prototype.run = function (cmd, data) {
        self.postMessage({
            id: this.getId(),
            cmd: cmd,
            data: data
        });
    };

    var slave = {
        socket: null,
        onMessage: function(job){
            console.warn('Overwrite worker-slave -> slave -> onMessage');
        },
        send: function(cmd, data){
            this.socket.run(cmd, data);
        }
    };

    var slaveId,
        slaveName,
        slaveConfig,
        slaveScript;

        self.addEventListener('message', function (e) {
            var job = new JobContext(e);
            if (job.cmd == '***worker start***') {

                console.log('Start Worker #' + slaveId + ' ' + slaveName);

                slaveId = job.request.id;
                slaveName = job.request.name;
                slaveScript = job.request.script;
                slaveConfig = job.request.config.paths;

                requirejs.config({paths: slaveConfig});

                self.importScripts(slaveScript + '.js');

                job.cmd = '';
                slave.socket = job;

            } else if (job.cmd == '***worker shutdown***') {
                console.log('Shutdown Worker' + slaveId + ' "' + slaveName + '" with Scripts: ', slaveScripts);
                close();
            } else {
                slave.onMessage(job);
            }
        });

    self.postMessage({cmd: '***worker ready***'})

    return slave;

})());

