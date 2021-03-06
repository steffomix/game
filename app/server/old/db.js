var config = require('./config'),
    orm = require('orm');

exports = module.exports = {
    connect: connect
};

function connect(callback) {
    var tbl = {
            users: 'users',            // user data
            playerlocations: 'playerlocations',   // users recent spawn locations
            worlds: 'worlds',           // users worlds, names and configs
            tiles: 'tiles',            // tiles itself with image name, default behave etc...
            tilegroups: 'tilegroups',       // types of tiles itself
            ships: 'ships',            // ship names and data
            hometiles: 'hometiles',      // tiles from users homes
            universetiles: 'universetiles',   // tiles from mmo universe
            shiptiles: 'shiptiles'        // tiles from ships in mmo universe

        };

    orm.settings.set('connection.reconnect', false);

    var dbUri = config.db.driver + config.db.url;
    console.log('ORM::connect: ' + dbUri);

    orm.connect(dbUri, function (err, db) {
        if(err){
            return console.error('Connection failed. Please check Uri and make sure that required directories exists and are writeable', err);
        }

        var HomeTiles = exports.HomeTiles = db.define(tbl.hometiles,
            {
                id: {type: 'serial', key: true},
                user_id: {type: 'integer'},
                world_id: {type: 'integer'},
                tilegroups_id: {type: 'integer'},
                x: {type: 'integer'},
                y: {type: 'integer'},
                z: {type: 'integer'},
                data: {type: 'integer'}
            }
        );

        var ShipTiles = exports.ShipTiles = db.define(tbl.shiptiles,
            {
                id: {type: 'serial', key: true},
                user_id: {type: 'integer'},
                world_id: {type: 'integer'},
                ship_id: {type: 'integer'},
                tilegroups_id: {type: 'integer'},
                x: {type: 'integer'},
                y: {type: 'integer'},
                z: {type: 'integer'},
                data: {type: 'integer'}
            }
        );

        var UniverseTiles = exports.UniverseTiles = db.define(tbl.universetiles,
            {
                id: {type: 'serial', key: true},
                user_id: {type: 'integer'},
                world_id: {type: 'integer'},
                tilegroups_id: {type: 'integer'},
                x: {type: 'integer'},
                y: {type: 'integer'},
                z: {type: 'integer'},
                data: {type: 'integer'}
            }
        );

        var Tiles = exports.Tiles = db.define(tbl.tiles,
            {
                id: {type: 'serial', key: true},
                name: {type: 'text'},
                data: {type: 'text'}
            }
        );

        var Worlds = exports.Worlds = db.define(tbl.worlds,
            {
                id: {type: 'serial', key: true},
                user_id: {type: 'integer'},
                name: {type: 'text'},
                data: {type: 'text'}
            });

        var PlayerLocations = exports.PlayerLocations = db.define(tbl.playerlocations,
            {
                id: {type: 'serial', key: true},
                user_id: {type: 'integer'},
                world_id: {type: 'integer'},
                area_id: {type: 'integer'},
                x: {type: 'integer'},
                y: {type: 'integer'},
                z: {type: 'integer'}
            });

        var Users = exports.Users = db.define(tbl.users,
            {
                id: {type: 'serial', key: true},
                name: {type: 'text'},
                pass: {type: 'text'}
            });

        var TileGroups = exports.TileGroups = db.define(tbl.tilegroups,
            {
                id: {type: 'serial', key: true},
                name: {type: 'text'},
                data: {type: 'text'}
            });


        Worlds.hasOne('user', Users, {reverse: tbl.worlds});
        PlayerLocations.hasOne('user', Users, {reverse: tbl.playerlocations});
        UniverseTiles.hasOne('user', Users, {reverse: tbl.universetiles});
        UniverseTiles.hasOne('tilegroups', TileGroups, {reverse: tbl.universetiles});
        HomeTiles.hasOne('user', Users, {reverse: tbl.hometiles});
        HomeTiles.hasOne('tilegroups', TileGroups, {reverse: tbl.hometiles});
        ShipTiles.hasOne('user', Users, {reverse: tbl.shiptiles});
        ShipTiles.hasOne('tilegroups', TileGroups, {reverse: tbl.shiptiles});


        db.sync(function (err) {
            err && console.error('sync...' + err);
            Users.get(1, function (err, user) {
                if (!user) {
                    console.log('Create default User name:user, pass:user');
                    Users.create({
                            name: 'user',
                            pass: 'user'
                        },
                        function (err, user) {
                            err && console.error('Create default user failed: ' + err);
                        }
                    );
                    Worlds.create({user_id: 1, name: '1' + Math.random().toString(36).substring(3, 10)}, function(err, world){
                        if(err){
                            console.log('Create initial World failed: ', err);
                        }
                    });
                    PlayerLocations.create({
                        user_id: 1,
                        world_id: 1,
                        area_id: 1,
                        x: 0,
                        y: 0,
                        z: 0
                    }, function(err, location){
                        if(err){
                            condole.log('Create initial Location failed: ', err);
                        }
                    });
                }
            });

            [tbl.hometiles, tbl.shiptiles, tbl.universetiles].forEach(function (tbl) {
                try {
                    db.driver.execQuery('CREATE UNIQUE INDEX IF NOT EXISTS "position" on ' + tbl + ' (user_id ASC, world_id ASC, x ASC, y ASC, z ASC)',
                        function () {
                        });
                } catch (e) {
                    console.log(e);
                }
            });
            exports.db = db;

            exports.areas = {
                '1': HomeTiles,
                '2': ShipTiles,
                '3': UniverseTiles
            };

            callback(exports);
        });
    });
}







