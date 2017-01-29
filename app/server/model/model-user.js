/**
 * Created by stefan on 24.01.17.
 */


var db = require('../db'),
    Floor = require('../floor');

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
    db.find(dbPlayers, {name: name}, ['name'], function (players) {
        if (!players.length) {
            var player = {
                name: name,
                pwd: db.crypt(pwd),
                position: {
                    x: 0, y: 0, z: 0, w: 0
                },
                home: {
                    floors: {
                        '0': {
                            tiles: {}
                        },
                        '1': {
                            tiles: {}
                        }
                    }
                }
            };
            db.insert(dbPlayers, player, function (plr) {
                if (plr.length) {
                    cb(factory(plr[0]));
                }
            });
        } else {
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
    db.find(db.players, {name: name, pwd: db.crypt(pwd)}, ['name', 'position', 'home.floors'], function (users) {
        if (users.length) {
            var user = {
                    _id: users[0]._id,
                    name: users[0].name
                },
                homeFloors = users[0].home.floors,
                floors = Object.keys(homeFloors),
                position = users[0].position;

            for(var i = 0; i < floors.length; i++){
                homeFloors[floors[i]] = new Floor(user._id, floors[i], homeFloors[floors[i]]);
            }

            cb(factory(user, position, homeFloors));

        } else {
            cb(false);
        }
    });
}

function updatePositon(id, pos) {

    db.update(db.players, {_id: id}, {
        'position.x': pos.x,
        'position.y': pos.y,
        'position.z': pos.z,
        'position.w': pos.w
    }, function (err, data) {
        if (err) {
            logger.warn('Player update position ')
        }
    });
}

/**
 *
 * @param user {{_id: ObjectId, name: string}}
 * @param position {{x: number, y: number, z: number, w: number}}
 * @param homeFloors {{Floor}}
 * @returns {{onExit: onExit, updatePositon: updatePositon, gameState: gameState, enterGameState: enterGameState, id, name, x, y, z, w, x, y, z, w}}
 */
function factory(user, position, homeFloors) {

    position = position || {x: 0, y: 0, z: 0, w: 0};

    var currentFloors = homeFloors;

    return {
        onExit: function () {
            // does not work in most cases
            update(user);
        },
        updatePositon: function () {
            updatePositon(user._id, position);
        },
        gameState: function () {
            return {
                n: user.name,
                x: position.x,
                y: position.y,
                z: position.z,
                w: position.w
            }
        },
        enterGameState: function () {
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
            return position.x || 0;
        },
        get y() {
            return position.y || 0;
        },
        get z() {
            return position.z || 0;
        },
        get floor() {
             return currentFloors[position.z] || (currentFloors[position.z] = new Floor(user._id, position.z, {}));
        },
        // world context
        get w() {
            return position.w || 0;
        },
        set x(x) {
            if (isNaN(parseInt(x))) {
                return console.error('set user x', user.name, x);
            }
            position.x = x;
        },
        set y(y) {
            if (isNaN(parseInt(y))) {
                return console.error('set user y', user.name, y);
            }
            position.y = y;
        },
        set z(z) {
            if (isNaN(parseInt(z))) {
                return console.error('set user z', user.name, z);
            }
            if (z != position.z) {
                position.z = z;
                if(!currentFloors[z]){
                    currentFloors[z] = new Floor(user._id, z, {});
                }
            }
        },
        // world context
        set w(w) {
            // no world context yet
        }
    }


}
