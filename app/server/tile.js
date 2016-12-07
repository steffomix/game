/**
 * Created by stefan on 07.12.16.
 */


var db = require('./db');

exports = module.exports = Tile;

function Tile(floor, tile, player) {
    var self = this;

    if (!tile) {
        var l = player.location,
            area = db.areas[l.area_id];

        area.create({
            user_id: player.user.id,
            world_id: l.world_id,
            x: l.x,
            y: l.y,
            z: l.z
        }, function (err, t) {
            if (!err) {
                tile = t;
            }
        })
    }else{
        this.tile = tile;
    }
}