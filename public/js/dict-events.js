/* 
 * Copyright (C) 01.12.16 Stefan Brinkmann <steffomix@gmail.com>
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
 * help to keep track of all those millions of events
 */
define('dictEvents', [], function () {

    var globalEvents = {
        get windowResize () {
            return 'global.windowResize'
        },
        get serverConnect () {
            return 'global.serverConnect'
        },
        get serverDisconnect () {
            return 'global.serverDisconnect'
        }

    };

    var interfaceEvents = {
        get hideAll () {
            return 'interface.hideAll'
        }
    };

    var accountEvents = {
        get login () {
            return 'account.login'
        },
        get logout () {
            return 'account.logout'
        }
    };

    return {
        get global () {
            return globalEvents
        },
        get interface () {
            return interfaceEvents
        },
        get account () {
            return accountEvents
        }

    };

});
