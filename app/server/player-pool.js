/**
 * Created by stefan on 22.01.17.
 */

var Player = require('./player'),
    Tick = require('./tick');


module.exports = new PlayerPool();

function PlayerPool(){

    var players = {},
        playerKeys = [],
        playerTicker = new Tick(playerTick);

    playerTicker.fps = 10;
    playerTicker.start();


    /**
     *
     * @param user
     */
    this.addPlayer = function(user, connection){
        if(!players[user.name]){
            var player = new Player(user, connection);
            players[user.name] = player;
            playerKeys = Object.keys(players);
            return player;
        }
        return false;
    };

    this.removePlayer = function(id){
        players[id] = null;
    }

    function playerTick(){
        var player;
        for(var i = 0; i < playerKeys.length; i++){
            player = players[playerKeys[i]];
            if(player){
                player.tick();
            }
        }
    }



}