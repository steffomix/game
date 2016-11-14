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





(function () {

    function JobContext(e){
        this.id = e.data.id;
        this.cmd = e.data.cmd;
        this.data = e.data.data;
    }

    JobContext.prototype.response = function(data){
        self.postMessage({
            id: this.id,
            cmd: this.cmd,
            data: data
        });
    }

    self.addEventListener('message', function (e) {

        var job = new JobContext(e);

        console.log('Starting job #' + job.id + ' ' + job.cmd + ' with data: \n', job.data);

        switch (job.cmd) {

            case '--start--':
                self.importScripts('/js/lib/underscore-min.js');
                self.importScripts('/js/lib/pathfinding.js');
                self.importScripts('/js/lib/socket.io-client.js');

                job.response(job.data);

                var c = _;
                break;

            default:
                console.error('cmd ' + job.cmd + ' not supported');
        }


    });

})();
