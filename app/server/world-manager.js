/**
 * Created by stefan on 06.12.16.
 */


var _ = require('underscore'),
    dispatcher = require('./event-dispatcher'),
    World = require('./world'),
    db;

dispatcher.global.appInit.once(function (core) {
    db = core.db;
    World = require('./world');
});


exports = module.exports = new WorldManager();

function WorldManager(){

    var loadedWorlds = {}

    this.getWorld = function(id){
        var world = db.Worlds.get(id, function(err, worlds){
            if(!err && worlds.length){
                return loadedWorlds[id] = new World(worlds[0]);
            }else{
                return createWorld(id);
            }
        })
    }

    function createWorld(id){
        db.Worlds.create({id: id}, function(err, world){
            return new World(world);
        });
    }


}