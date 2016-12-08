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
    fromPlayer: function(player){
        // init with defaults
        this.x = player.location.x;
        this.y = player.location.y;
        this.data = {};

        var self = this,
            l = player.location,
            area = db.areas[l.area_id],
            newTile = {
                user_id: player.user.id,
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
                self.floor.onInsertTile(this);
            }else{
                console.error('Create Tile failed.', newTile);
                self.floor.onInsertTile(this);
            }
        });
        return this;
    },
    getBlank: function(player){

        return {
            world_id: player.location.world_id,
            area_id: player.location.area_id,
            x: player.location.x,
            y: player.location.y,
            z: player.location.z,
            data: {}
        }
    }
};
