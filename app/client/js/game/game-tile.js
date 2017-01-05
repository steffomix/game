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

define(['config', 'logger', 'pixi', 'dataTypes'],
    function (config, Logger, pixi, dataTypes) {

        var logger = Logger.getLogger('gameTile');
        logger.setLevel(config.logger.gameTile || 0);

        var tileSize = config.game.tiles.size,
            scale = config.game.tiles.scale;

        function GameTile(x, y, texture) {
            pixi.Container.call(this);
            var sprite = new pixi.Sprite(pixi.Texture.fromImage('assets/tiles/' + texture+ '.png'));
            this.setTransform(x, y);
            this.gamePosition = dataTypes.gamePosition(this);

            sprite.anchor.set(.5);
            this.addChild(sprite);

        }

        GameTile.prototype = Object.create(pixi.Container.prototype);
        GameTile.prototype.constructor = GameTile;

        return GameTile;

    });