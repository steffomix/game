/**
 * Created by stefan on 07.12.16.
 */


var Tile = require('./tile'),
    db = require('./db');

exports = module.exports = Floor;

function Floor(player){
    var self = this;
    this.players = {};
    this.tiles = {};
    this.rawTiles = {};
    this.z = player.location.z;
    this.addPlayer(player);

    // create floor from database tiles, if any
    var worldId = player.location.world_id,
        floorId = player.location.z,
        area = db.areas[player.location.area_id];

    area.find({
        world_id: worldId,
        z: floorId
    }, function(err, tiles){
        // lookup closure
        var t = self.tiles,
            rt = self.rawTiles,
            T = Tile,
            p = player,
            id;
        if(!err && tiles.length){
            for(var i = 0; i < tiles.length; i++){
                id = tiles[i].x + '_' + tiles[i].y;
                rt[id] = tiles[i].data;
                t[id] = new T(this, tiles[i]);
            }
        }else{
            t[p.location.x + '_' + p.location.y] = new Tile(this, null, p);
        }
        p.onUpdateFloor(self);
    });

}

Floor.prototype = {
    addPlayer: function(player){
        var id = player.socket.id;
        this.players[id] && this.players[id].floor.removePlayer(id)
        this.players[id] = player;
    },
    removePlayer: function(id){
        delete this.players[id];
    }
};
