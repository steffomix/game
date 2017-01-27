/**
 * Created by stefan on 24.01.17.
 */

var Nedb = require('nedb'),
    mongoClient = require('mongodb').MongoClient,
    isMongo = false,
    fs = require('fs'),
    crypto = require('crypto'),
    dbPlayers = new Nedb({filename: './storage/players.json', autoload: true}),
    homes = {},
    modelUser = require('./model/model-user');


module.exports = {
    initialize: initialize,
    register: register,
    login: login,
    getPlayerHome: getPlayerHome,
    getPlayer: getPlayer,
    optimizeUsers: optimizeUsers,
    get isMongo(){
        return isMongo;
    }
};

function initialize(cb){
    mongoClient.connect('mongodb://localhost:27017/rotting_universe', function(err, db){

        if(err){
            console.error('Fallback to local Database NeDb due to Error', err);
            dbPlayers = new Nedb({filename: './storage/players.json', autoload: true});
        }else{
            dbPlayers = db.collection('players');
            //dbPlayers.insert({"name":"user","pwd":"04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb","x":-4,"y":7,"z":"0","w":"0"});
            isMongo = true;
        }
        cb();
    });
}

// create default user
dbPlayers.find({name: 'user'}, function(err, users){
    if(!users.length){
        var user = {name: 'user', pwd: 'user'};
        console.log('create default user ', user);
        user.pwd = crypt(user.pwd);
        dbPlayers.insert(user);
    }
});



function optimizeUsers(){
    dbPlayers.persistence && dbPlayers.persistence.compactDatafile();
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

    isMongo ? db.find(query).toArray(fn) : db.find(query, fn);

    function fn (err, rows){
        if(err){
            console.error('db find', err, query);
            return cb([]);
        }
        return cb(rows);
    }

}

/**
 *
 * @param pwd
 * @returns {*}
 */
function crypt(pwd){
    return crypto.createHash('sha256').update(pwd).digest('hex');
}

