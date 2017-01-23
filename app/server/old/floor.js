/**
 * Created by stefan on 07.12.16.
 */


var _ = require('underscore'),
    Tile = require('./tile'),
    db = require('./db');

exports = module.exports = Floor;

function Floor(location) {
    // floor bounds
    this.bounds = {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0
    };

    // get location from first entering player or unit
    this.world_id = location.world_id;
    this.area_id = location.area_id;
    this.z = location.z;
    // players on floor
    this.players = {};
    // tiles Tile
    this.tiles = {};
    //tiles as json string
    this.rawTiles = {};

    this.loadFloor(location);
}

Floor.prototype = {
    emitGameState: function(self, manager){
        var locations = {};
        _.each(self.players, function(player){
            locations[player.user.name] = player.location;
        });
        _.each(self.players, function(player){
            player.socket.emit('playerLocations', locations);
        })
    },

    onInsertTile: function (tile) {
        var self = this,
            id = tile.x + '_' + tile.y;

        this.tiles[id] = tile;
        this.rawTiles[id] = {
            x: tile.x,
            y: tile.y,
            z: tile.z,
            data: tile.data || {}
        };

        if (tile.x < this.bounds.minX || tile.x > this.bounds.maxX || tile.y < this.bounds.minY || tile.y > this.bounds.maxY) {
            this.updateBounds();
        }

        _.each(this.players, function (p) {
            p.socket.emit('onUpdateTile', {
                world_id: self.world_id,
                area_id: self.area_id,
                z: self.z,
                x: tile.x,
                Y: tile.y,
                data: tile.data
            })
        })
    },

    updateBounds: function () {
        var b = this.bounds;
        _.each(this.tiles, function (tile) {
            tile.x < b.minX && (b.minX = tile.x);
            tile.x > b.maxX && (b.maxX = tile.x);
            tile.y < b.minY && (b.minY = tile.y);
            tile.y > b.maxY && (b.maxY = tile.y);
        });
    },

    loadFloor: function (location) {
        var self = this,
            area = db.areas[location.area_id];
        area.find({
            world_id: location.world_id,
            z: location.z
        }, function (err, tiles) {
            var t = self.tiles,
                rt = self.rawTiles;
            if (!err && tiles.length) {
                // process tiles of loaded floor
                _.each(tiles, function (tile) {
                    var id = tile.x + '_' + tile.y;
                    // active tiles
                    t[id] = new Tile(self).fromDb(tile);
                    // tiles to send to client
                    rt[id] = {
                        x: tile.x,
                        y: tile.y,
                        data: tile.data
                    };
                });
            } else {
                var id = location.x + '_' + location.y;
                t[id] = new Tile(self).fromLocation(location);
                rt[id] = {};
            }
        });
    },

    onUpdateFloor: function (player) {
        var self = this;
        player ? notify(player) : _.each(this.players, notify);
        function notify(player) {
            player.socket.emit('onUpdateFloor', {
                world_id: self.world_id,
                area_id: self.area_id,
                z: self.z,
                tiles: self.rawTiles
            });
        }
    },

    addPlayer: function (player) {
        var id = player.user.name;
        try {
            this.players[id] && this.players[id].floor.removePlayer(id);
        } catch (e) {
            console.warn('Cant remove player from floor');
        }
        this.players[id] = player;
        this.onUpdateFloor(player);
    },

    removePlayer: function (id) {
        delete this.players[id];
    }
};
