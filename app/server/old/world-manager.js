/**
 * Created by stefan on 06.12.16.
 */


var db = require('./db');


exports = module.exports = new WorldManager();

function WorldManager(){

    var loadedWorlds = {}

    this.getWorld = function(player, callback){
        var id = player.location.worldId;

        if(!id){
            return createWorld(player);
        }
        if(loadedWorlds[id]){
            return loadedWorlds[id];
        }
        db.Worlds.get(id, function(err, world) {
            if (!err) {
                return loadedWorlds[id] = new World(world);
            } else {
                return createWorld(player);
            }
        });

    };

    function createWorld(player){
        var id = player.user.id;
        db.Worlds.create({user_id: id}, function(err, world){
            return new World(world);
        });
    }


}