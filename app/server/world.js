/**
 * Created by stefan on 05.12.16.
 */


var _ = require('underscore'),
    dispatcher = require('./event-dispatcher'),
    db;

dispatcher.global.appInit.once(function (core) {
    db = core.db;
});