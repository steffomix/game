/**
 * Created by stefan on 24.01.17.
 */

var updateCount = 0;

function update(user, db){

    db.update({_id: user._id}, {$set:{
        x: user.x,
        y: user.y,
        z: user.z,
        w: user.w
    }}, {}, function(err, numAffected, affectedDocuments, upsert){
        if(err){
            console.error('update user', e, user)
        }
    });
}



module.exports = function(user, db){


    return {
        onExit: function(){
            console.log('exit user');
            update(user, db);
        },
        update: function(){
            update(user, db);
        },
        // read-only
        get id(){
            return user._id;
        },
        // position
        get name(){
            return user.name;
        },
        get x(){
            return user.x || 0;
        },
        get y(){
            return user.y || 0;
        },
        get z(){
            return user.z || 0;
        },
        // world context
        get w(){
            return user.w || 0;
        },
        set x(x){
            if(isNaN(parseInt(x))){
                return console.error('set user x', user.name, x);
            }
            user.x = x;
        },
        set y(y){
            if(isNaN(parseInt(y))){
                return console.error('set user y', user.name, y);
            }
            user.y = y;
        },
        set z(z){
            if(isNaN(parseInt(z))){
                return console.error('set user z', user.name, z);
            }
            user.z = z;
        },
        // world context
        set w(w){
            // no world context yet
        }
    }


}
