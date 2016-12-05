/**
 * Created by stefan on 04.12.16.
 */

var _ = require('underscore'),
    dispatcher = require('./event-dispatcher'),
    db;

dispatcher.global.appInit.once(function (core) {
    db = core.db;
});

var coreModules;
exports = module.exports = Player;


function Player(so){

}