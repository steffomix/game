/**
 * Created by stefan on 07.12.16.
 */


var Floor = require('./floor');


exports = module.exports = new FloorManager();

function FloorManager() {

    var floors = {};

    this.floor = function (player) {

        var location = player.location,
            id = this.id(location);
        if (floors[id]) {
            player.floor = floors[id];
            floors[id].addPlayer(player);
        } else {
            player.floor = floors[id] = new Floor(location);
            floors[id].addPlayer(player);
        }

    };

    this.id = function (location) {
        return location.world_id + '_' + location.area_id + '_' + location.z;
    };

    this.emitFloor = function(player, data){
        var id = this.id(data);
        if(!floors[id]){
            floors[id] = new Floor(player);
        }
    }
}