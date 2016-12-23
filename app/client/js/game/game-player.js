/*
 * Copyright (C) 16.12.16 Stefan Brinkmann <steffomix@gmail.com>
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


define(['config', 'logger', 'underscore', 'gameMobile', 'pixiMobile'],
    function (config, Logger, _, gameMobile, pixiMobile) {

        var logger = Logger.getLogger('gamePlayer');
        logger.setLevel(config.logger.gamePlayer || 0);

        function factory(user) {
            var mob = gameMobile.factory(),
                pl = player(user),
                px = pixiMobile.factory('devil.png');

            var o = _.expand(px, pl, mob);
            return o;
        }

        function player(user) {

            return {
                user: user,
                get id() {
                    return user.id;
                },
                get name() {
                    return user.name;
                }

            }

        }


        return {
            factory: factory
        };

    });

