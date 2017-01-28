/**
 * Created by stefan on 28.01.17.
 */


var db = require('./db'),
    dbFloors = db.homeFloors,
    floorsPool = {};

module.exports = new FloorsPool();


function FloorsPool(){

    this.getFloor = function(player, depths){
        db.find(dbFloors, {floor: player + depths})
    }



}
