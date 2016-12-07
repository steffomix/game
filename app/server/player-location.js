/**
 * Created by stefan on 07.12.16.
 */


var db = require('./db'),
    floorManager = require('./floor-manager');


exports = module.exports = PlayerLocation;

function PlayerLocation() {
    this.worldId = null;
    this.floor = null;
    this.tile = null;
    var self;

    this.initLocation = function () {
        self = this;
        db.PlayerLocations.find({user_id: self.user.id}, function (err, locations) {
            if (!err && locations.length) {
                self.location = locations[0];
                floorManager.floor(self);
            } else {
                db.PlayerLocations.create({
                    user_id: self.user.id,
                    area_id: 1,
                    world_id: 1,
                    x: 0,
                    y: 0,
                    z: 0
                }, function(err, loc){
                    if(!err){
                        self.location = loc;
                        floorManager.floor(self);
                    }
                })
            }
        })
    };

}
