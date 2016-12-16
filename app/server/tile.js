/**
 * Created by stefan on 07.12.16.
 */


var db = require('./db');

exports = module.exports = Tile;

function Tile(floor) {
    this.floor = floor;
}

Tile.prototype = {
    fromDb: function(tile){
        this.x = tile.x;
        this.y = tile.y;
        this.data = tile.data || {};
        return this;
    },
    fromLocation: function(location){
        // init with defaults
        this.x = location.x;
        this.y = location.y;
        this.data = {};

        var self = this,
            l = location,
            area = db.areas[l.area_id],
            newTile = {
                world_id: l.world_id,
                x: l.x,
                y: l.y,
                z: l.z
            };


        area.create(newTile, function (err, t) {
            if (!err) {
                self.x = t.x;
                self.y = t.y;
                self.data = t.data;
                self.floor.onInsertTile(self);
            }else{
                console.error('Create Tile failed.', newTile);
                self.floor.onInsertTile(self);
            }

        });
        return this;
    },
    getBlank: function(location){

        return {
            world_id: location.world_id,
            area_id: location.area_id,
            x: location.x,
            y: location.y,
            z: location.z,
            data: {}
        }
    }
};
