/**
 * Created by stefan on 24.01.17.
 */


var db = require('../db');

module.exports = {
    factory: factory,
    register: register,
    login: login
};


/**
 * register new player
 * @param name
 * @param pwd
 * @param cb
 */
function register(name, pwd, cb) {
    var dbPlayers = db.players;
    db.find(dbPlayers, {name: name}, function (players) {
        if (!players.length) {
            db.insert(dbPlayers, {name: name, pwd: db.crypt(pwd)}, function(user){
                if(user.length){
                    var id = user[0]._id;
                    db.insert(db.homes, {owner: user.name, floors: {'0': {}}}, function(floor){
                        if(floor){
                            cb(factory(user, floor[0]));
                        }
                    })
                }
                cb(factory(user));
            });
        }else{
            cb(false);
        }

    })
}

/**
 *
 * @param name
 * @param pwd
 * @param cb
 */
function login(name, pwd, cb) {
    db.find(db.players, {name: name, pwd: db.crypt(pwd)}, function (players) {
        if(players.length){
            var player = players[0];
            db.find(db.homes, {owner: player.name}, function(homes){
                if(homes.length){
                    var home = homes[0];
                    cb(factory(player, home));
                }else{
                    console.error('cant find home for player ', player.name);
                    cb(false);
                }
            })
        }
    });
}

function update(user, cb) {

    db.update(db.players,{_id: user._id}, {
            x: user.x,
            y: user.y,
            z: user.z,
            w: user.w
        }, cb);
}

function factory(user, db) {

    return {
        onExit: function () {
            // does not work in most cases
            update(user, db);
        },
        update: function () {
            update(user, db);
        },
        gameState: function () {
            return {
                n: user.name,
                x: user.x,
                y: user.y,
                z: user.z,
                w: user.w
            }
        },
        enterGameState: function(){
            return this.gameState();
        },
        // read-only
        get id() {
            return user._id;
        },
        // position
        get name() {
            return user.name;
        },
        get x() {
            return user.x || 0;
        },
        get y() {
            return user.y || 0;
        },
        get z() {
            return user.z || 0;
        },
        // world context
        get w() {
            return user.w || 0;
        },
        set x(x) {
            if (isNaN(parseInt(x))) {
                return console.error('set user x', user.name, x);
            }
            user.x = x;
        },
        set y(y) {
            if (isNaN(parseInt(y))) {
                return console.error('set user y', user.name, y);
            }
            user.y = y;
        },
        set z(z) {
            if (isNaN(parseInt(z))) {
                return console.error('set user z', user.name, z);
            }
            user.z = z;
        },
        // world context
        set w(w) {
            // no world context yet
        }
    }


}
