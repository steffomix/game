/**
 * Created by stefan on 24.01.17.
 */

var mongoClient = require('mongodb').MongoClient,
    // fallback database
    Nedb = require('nedb'),
    isMongo = false,
    crypto = require('crypto');

// collections
var playersCollection;


module.exports = {
    initialize: initialize,
    optimizePlayersCollection: optimizePlayersCollection,
    find: find,
    update: update,
    insert: insert,
    crypt: crypt,
    get players(){
        return playersCollection;
    },
    get homes(){
        return homesCollection;
    }
};

function initialize(cb) {
    mongoClient.connect('mongodb://localhost:27017/rotting_universe', function (err, db) {
        if (err) {
            console.log('Fallback to local Database NeDb due to Error', err);
            playersCollection = new Nedb({filename: './storage/players.json', autoload: true});
        } else {
            playersCollection = db.collection('players');
            isMongo = true;
        }
        cb();
    });
}

/**
 * NeDb only
 */
function optimizePlayersCollection() {
    !isMongo && playersCollection.persistence.compactDatafile();
}


/**
 * internal module function
 * @param db
 * @param query {{}}
 * @param fields {{}}
 * @param cb {function}
 */
function find(db, query, fields, cb) {

    // NeDb has no cursor
    isMongo ? db.find(query, fields).toArray(fn) : db.find(query, fields, fn);

    function fn(err, rows) {
        if (err) {
            console.warn('db find', err, query);
            return cb && cb([]);
        }
        return cb && cb(rows);
    }

}

function update(collection, selector, data, cb) {
    // affectedDocuments is not NeDb - MongoDb compatible
    collection.update(selector, {$set: data}, {}, function (err, numAffected, affectedDocuments, upsert) {
        if (err) {
            console.warn('update user', err, selector, data);
            cb && cb(false);
        }else{
            cb && cb(numAffected);
        }
    });
}

function insert(collection, data, cb){
    collection.insert(data, function(err, rows){
        if(err){
            console.warn('db insert', err, data);
            cb && cb(false);
        }else{
            cb && cb(isMongo ? rows.ops : rows);
        }
    });
}


/**
 *
 * @param pwd
 * @returns {*}
 */
function crypt(pwd) {
    return crypto.createHash('sha256').update(pwd).digest('hex');
}

