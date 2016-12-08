/**
 * Created by stefan on 07.12.16.
 */


var _ = require('underscore'),
    Tile = require('./tile'),
    db = require('./db');

exports = module.exports = Floor;

function Floor(player) {
    // floor bounds
    this.bounds = {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0
    };

    // get location from first entering player or unit
    this.world_id = player.location.world_id;
    this.area_id = player.location.area_id;
    this.z = player.location.z;
    // players on floor
    this.players = {};
    // tiles Tile
    this.tiles = {};
    //tiles as json string
    this.rawTiles = {};

    this.addPlayer(player);
    this.loadFloor(player);
}

Floor.prototype = {
    onInsertTile: function (tile) {
        var id = tile.x + '_' + tile.y;
        this.tiles[id] = tile;
        this.rawTiles[id] = tile.data;
        if (tile.x < this.bounds.minX || tile.x > this.bounds.maxX || tile.y < this.bounds.minY || tile.y > this.bounds.maxY) {
            this.updateBounds();
        }
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
    loadFloor: function (player) {
        var self = this,
            area = db.areas[player.location.area_id];
        area.find({
            world_id: player.location.world_id,
            z: player.location.z
        }, function (err, tiles) {
            var t = self.tiles,
                rt = self.rawTiles;
            if (!err && tiles.length) {
                _.each(tiles, function (tile) {
                    var id = tile.x + '_' + tile.y;
                    t[id] = new Tile(this).fromDb(tile);
                    rt[id] = tile.data || {};
                });
            } else {
                var id = player.location.x + '_' + player.location.y;
                t[id] = new Tile(this).fromPlayer(player);
                rt[id] = {};
            }
            self.onUpdateFloor();
        });
    },
    onUpdateFloor: function(){
        var self = this;
        _.each(this.players, function(player){
            player.socket.emit('onUpdateFloor', {
                world_id: self.world_id,
                area_id: self.area_id,
                z: self.z,
                tiles: self.rawTiles
            });
        });
    },

    addPlayer: function (player) {
        var id = player.socket.id;
        this.players[id] && this.players[id].floor.removePlayer(id);
        this.players[id] = player;
    },

    removePlayer: function (id) {
        delete this.players[id];
    }
};
