/**
 * Created by stefan on 24.01.17.
 */

var Nedb = require('nedb'),
    fs = require('fs'),
    crypto = require('crypto'),
    dbPlayers = new Nedb({filename: './storage/players.json', autoload: true}),
    homes = {},
    modelUser = require('./model/model-user');

var ne = new Nedb();

// create default user
dbPlayers.find({name: 'user'}, function(err, users){
    if(!users.length){
        var user = {name: 'user', pwd: 'user'};
        console.log('create default user ', user);
        user.pwd = crypt(user.pwd);
        dbPlayers.insert(user);
    }
});


module.exports = {
    register: register,
    login: login,
    getPlayerHome: getPlayerHome,
    getPlayer: getPlayer,
    optimizeUsers: optimizeUsers
};

function optimizeUsers(){
    dbPlayers.persistence.compactDatafile();
}


/**
 * get player by id
 * @param id {string}
 * @param cb {function}
 */
function getPlayer(id, cb){
    dbPlayers.find({_id: id}, function(err, players){
        if(err){
            console.error('getPlayer', id);
            return false;
        }
        cb(players.length ? players[0] : false);
    })
}

/**
 * register new player
 * @param name
 * @param pwd
 * @param cb
 */
function register(name, pwd, cb){
    find(dbPlayers, {name: name}, function(players){
        if(!players.length){
            dbPlayers.insert({name: name, pwd: crypt(pwd)}, function(err, user){
                if(err){
                    console.error('register user', err, name);
                    return cb(false);
                }
                return cb(user);
            });
        }
    })
}

/**
 *
 * @param name
 * @param pwd
 * @param cb
 */
function login(name, pwd, cb){
    find(dbPlayers, {name: name, pwd: crypt(pwd)}, function(players){
            cb(players.length > 0 ? modelUser(players[0], dbPlayers) : false);
        });
}

/**
 *
 * @param id {string} nedb player _id
 */
function getPlayerHome(id) {
    return homes[id] || (homes[id] = new Nedb({filename: './db/homes/' + id + '.json', autoload: true}));
}

/**
 * internal module function
 * @param db
 * @param query
 * @param cb
 */
function find(db, query, cb){
    db.find(query, function(err, rows){
        if(err){
            console.error('db find', err, query);
            return cb([]);
        }
        return cb(rows);
    });
}

/**
 *
 * @param pwd
 * @returns {*}
 */
function crypt(pwd){
    return crypto.createHash('sha256').update(pwd).digest('hex');
}

