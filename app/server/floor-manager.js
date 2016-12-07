/**
 * Created by stefan on 07.12.16.
 */


var Floor = require('./floor');


exports = module.exports = new FloorManager();

function FloorManager() {

    var floors = {};

    this.floor = function (player) {
        var id = this.createFloorId(player);
        if (floors[id]) {
            floors[id].addPlayer(player);
        } else {
            floors[id] = new Floor(player)
        }
    };

    this.createFloorId = function (player) {
        return player.location.world_id + '_' + player.location.area_id + '_' + player.location.z;
    }
}