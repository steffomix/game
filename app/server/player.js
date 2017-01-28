/**
 * Created by stefan on 22.01.17.
 */

var db = require('./db'),
    Message = require('./message');

module.exports = Player;

/**
 *
 * @param user model/model-user.js factory
 * @param connection {Socket}
 * @constructor
 */
function Player(user, connection){

    // received actions waiting for processing
    var actions = {
        // player path
        moveQueue: []
    };

    // allow max 10 actions/sec
    var lastAction = 0;

    // holds timeout id or false
    var moving = false;

    this.connection = connection;
    /**
     * player init
     * set client player to last position
     */
    this.initialize = function(){
        emitPlayerMove(0);
    };

    this.onExit = function(){
        user.onExit();
    };

    this.onStorage = function(){
        // update database
        user.update();
    };

    this.tick = function(){
        moving == false && nextMove();
        return user.gameState();
    };

    this.getName = function(){
        return user.name;
    };

    this.emitGameState = function(){

    };

    // this.gameState = user.gameState;

    connection.on('playerMove', function(data){
        console.log('Player: onPlayerMove', data);
        try{
            var t = parseInt(data.t);
            if(!isNaN(t) && t - lastAction > 100){
                lastAction = t;
                actions.moveQueue = data.d;

            }
        }catch(e){
            console.error('onPlayerMove', e, data);
        }
    });

    function nextMove(){
        var step = actions.moveQueue.pop();
        if(step){
            try{
                step = move(step);
            }catch(e){
                console.error('player next move', e);
                actions.moveQueue = [];
                moving = false;
                return;
            }

            if(step){
                moving = setTimeout(function(){
                    moving = false;
                    nextMove();
                }, step.speed * 5);
            }

        }else{
            moving = false;
        }
    }

    /**
     *
     * -1,-1    0,-1    1,-1
     *
     * -1,0     0,0     1,0
     *
     * -1,1     0,1     1,1
     *
     * @param step
     */
    function move(step){

        var x = parseInt(step.x),
            y = parseInt(step.y),
            z = step.z === undefined ? user.z : parseInt(step.z);

        if(isNaN(x) || isNaN(y) || isNaN(z)){
            console.error('player step corrupted', user, step);
            // move stack is damaged
            // stop walking
            actions.moveQueue = [];
            return false;
        }

        // distance and diagonals
        var dx = Math.abs(x - user.x),
            dy = Math.abs(y - user.y),
            diag = dx + dy == 2;


        // distance to far?
        if(dx > 1 || dy > 1){
            console.error('player step distance to far', user, step)
            // stop walking
            actions.moveQueue = [];
            return false;
        }

        // change floor?
        if(z != user.z) {
            // change floor
            return changeFloor({x: x, y: y, z: z});
        }

        // position walkable?
        var speed = getTileSpeed(x, y, z);

        // normal walk
        if(speed > 0){
            user.x = x;
            user.y = y;
            // notify client
            return emitPlayerMove(speed);
        }

        // no move
        return false;
    }

    function emitPlayerMove(speed){
        var step = {
            x: user.x,
            y: user.y,
            z: user.z,
            speed: speed
        };
        new Message(connection).create(step).emit('mainPlayerMove');
        return step;
    }

    function getTileSpeed(x, y, z){
        return 100;
    }

    function changeFloor(z){
        console.info('change floor to', z);
        return true; // if player is moving now
    }

    function emit(cmd, data){
        connection.emit(cmd, {
            t: new Date().getTime(),
            d: data
        });
    }


}