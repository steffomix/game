/**
 * Created by stefan on 05.12.16.
 */


var _ = require('underscore'),
    dispatcher = require('./event-dispatcher'),
    db;



exports = module.exports = World;

function World(id){
    this.id = id;
}



