/**
 * Created by stefan on 29.01.17.
 */

var db = require('./db'),
    worldGenerator = require('./world-generator');

module.exports = Floor;

/**
 *
 * @param _id {ObjectId}
 * @param depth {number}
 * @param floor {{}}
 * @constructor
 */
function Floor(_id, depth, floor){

    if(!floor.tiles){
        floor.tiles = {};
    }

    var self = this,
        playerPool = {
        players: {},
        keys: []
    };



    /**
     *
     * @param x {number}
     * @param y {number}
     * @returns {string}
     */
    function id(x, y){
        return x + '_' + y;
    }

    /**
     *
     * @param player {Player}
     * @param floor {Floor}
     */
    this.addPlayer = function(player, floor){
        // autoremove player from previous floor
        floor && floor.removePlayer(player);
        // add player to list
        var name = player.getName();
        playerPool.players[name] = player;
        playerPool.keys.push(name);
        player.setFloor(self);
    };

    /**
     *
     * @param player {Player}
     */
    this.removePlayer = function(player){
        // deactivate player
        playerPool.players[player.getName()] = null;
        // rebuild keys of playerNames
        var keys = Object.keys(playerPool.players);
        playerPool.keys = [];
        for(var i = 0; i < keys.length; i++){
            if(playerPool.players[keys[i]]){
                playerPool.keys.push(keys[i]);
            }
        }
    };

    /**
     *
     * @param x {number}
     * @param y {number}
     * @returns {*|boolean}
     */
    this.getTile = function(x, y){
        var key = id(x, y)
        if(floor.tiles[key]){
            return floor.tiles[key];
        }

        if(depth == 0){
            return worldGenerator.tile(x, y);
        }
        return floor.tiles[id(x, y)] || false;
    };

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param tile
     */
    this.setTile = function (x, y, tile){
        var key = id(x, y),
            dbKey = 'home.floors.' + depth + '.tiles.' + key,
            dbData = {};
        dbData[dbKey] = tile;
        floor.tiles[key] = tile;

        db.update(db.players, {_id: _id}, dbData, function(tile){
            if(tile === false){
                console.warn('floor.setTile failed', dbData);
            }
        })
    }


}