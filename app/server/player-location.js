/**
 * Created by stefan on 07.12.16.
 */


var db = require('./db'),
    floorManager = require('./floor-manager');


exports = module.exports = PlayerLocation;

function PlayerLocation(player) {
    var self = this;

    db.PlayerLocations.find({user_id: player.user.id}, function (err, locations) {
        if (!err && locations.length) {
            self.__proto__ =  locations[0];
            floorManager.floor(player);
        } else {
            db.PlayerLocations.create({
                user_id: player.user.id,
                area_id: 1,
                world_id: 1,
                x: 0,
                y: 0,
                z: 0
            }, function (err, loc) {
                if (!err) {
                    self.__proto__ = loc;
                    floorManager.floor(player);
                }else{
                    console.error('Cant create floor for player', location);
                }
            })
        }
    });

}
