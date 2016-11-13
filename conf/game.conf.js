/*
 * Copyright (C) 09.11.16 Stefan Brinkmann <steffomix@gmail.com>
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
 * Server config
 */
exports.server = {
    name: 'Rotting Planet',
    env: process.env.NODE_ENV || "development",
    port: 4343,
    db: 'sqlite:///home/stefan/WebstormProjects/game/db/db.sqlite3',
    loginKeyMaxLifetime: 60 // login key must not be older than given seconds
}