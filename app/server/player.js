/**
 * Created by stefan on 22.01.17.
 */


module.exports = Player;

function Player(user, connection){

    var self = this;



    // received actions waiting for processing
    var actions = {
        // player path
        moveQueue: []
    };

    // allow max 10 actions/sec
    var lastAction = 0;

    // holds timeout id or false
    var moving = false;

    // position
    var gamePosition = {x: 0, y: 0, z: 0};


    this.tick = (function(){
        moving == false && nextMove();
    }).bind(this);


    this.getName = function(){
        return user.name;
    };

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
            z = 0;//parseInt(step.z);

        if(isNaN(x) || isNaN(y) || isNaN(z)){
            // move stack is damaged
            // stop walking
            actions.moveQueue = [];
            return false;
        }

        // distance and diagonals
        var dx = Math.abs(x - gamePosition.x),
            dy = Math.abs(y - gamePosition.y),
            diag = dx + dy == 2;


        // distance to far?
        if(dx > 1 || dy > 1){
            // stop walking
            actions.moveQueue = [];
            return false;
        }

        // change floor?
        if(z != gamePosition.z) {
            // change floor
            return changeFloor({x: x, y: y, z: z});
        }

        // position walkable?
        var speed = getTileSpeed(x, y, z);

        // normal walk
        if(speed > 0){
            gamePosition.x = x;
            gamePosition.y = y;
            // notify player to walk

            step = {
                x: x,
                y: y,
                speed: Math.round(getTileSpeed(x, y, z) * (diag ? 1.414 : 1))
            };

            emit('mainPlayerMove', step);
            return step;
        }

        // no move
        return false;


    }

    function getTileSpeed(x, y, z){
        return 500;
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