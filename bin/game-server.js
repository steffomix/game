#!/usr/bin/env node


// Required modules
var express = require("express");
var app = express();
var http = require("http").Server(app);
var config = require("../config");
var game = require("../game/game");
var socket = require("../game/socket");



// Start listening with socket io
socket.listen(http);

// Initialize game and attach callbacks
game.start();

game.onUpdate = function (snapshot) {
    socket.sendUpdate(snapshot);
};
socket.onAddClient = function () {
    game.addPlayer();
};
socket.onRemoveClient = function () {
    game.removePlayer();
};
socket.onEnemyHit = function (enemyId) {
    game.hitsEnemy(enemyId);
};