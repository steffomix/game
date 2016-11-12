var orm = require('orm'),
    tbl = {
        users: 'users', // user data
        locations: 'user_locations', // users recent spawn locations
        worlds: 'worlds', // users worlds, names and configs
        tileGroups: 'tile_groups',
        tiles: 'tiles', // tiles itself with image name, default behave etc...
        tileTypes: 'tile_types', // types of tiles itself
        ships: 'ships', // ship names and data
        areas: {
            home: 'homes_tiles', // tiles from users homes
            universe: 'universe_tiles', // tiles from mmo universe
            ship: 'ship_tiles' // tiles from ships in mmo universe
        }
    };

orm.settings.set('connection.reconnect', false);

function onSync(err){
    if(err){
        console.log(err);
    }
}

exports.connect = function (uri, callback) {
    var db = orm.connect(uri);

    var HomeTiles = exports.HomeTiles = db.define(tbl.areas.home,
        {
            user_id: {type: 'integer'},
            world_id: {type: 'integer'},
            group_id: {type: 'integer'},
            x: {type: 'integer'},
            y: {type: 'integer'},
            z: {type: 'integer'},
            data: {type: 'integer'}
        }
    );

    var ShipTiles = exports.ShipTiles = db.define(tbl.areas.ship,
        {
            user_id: {type: 'integer'},
            world_id: {type: 'integer'},
            ship_id: {type: 'integer'},
            group_id: {type: 'integer'},
            x: {type: 'integer'},
            y: {type: 'integer'},
            z: {type: 'integer'},
            data: {type: 'integer'}
        }
    );

    var UniverseTiles = exports.UniverseTiles = db.define(tbl.areas.universe,
        {
            user_id: {type: 'integer'},
            world_id: {type: 'integer'},
            group_id: {type: 'integer'},
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

    var UserLocations = exports.UserLocations = db.define(tbl.locations,
        {
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

    var TileTypes =  exports.TileTypes = db.define(tbl.tileTypes,
        {
            id: {type: 'serial', key: true},
            name: {type: 'text'},
            data: {type: 'text'}
        });



    Users.hasMany('worlds', Worlds);
    Worlds.hasOne('user', Users);

    Users.hasMany('locations', UserLocations);
    UserLocations.hasOne('user', Users);

    Users.hasMany('universeTiles', UniverseTiles);
    UniverseTiles.hasOne('user', Users);

    Users.hasMany('homeTiles', HomeTiles);
    HomeTiles.hasOne('user', Users);

    Users.hasMany('shipTiles', ShipTiles);
    ShipTiles.hasOne('user', Users);

    TileTypes.hasMany('universeTiles', UniverseTiles);


    TileTypes.hasMany('homeTiles', HomeTiles);
    TileTypes.hasMany('shipTiles', ShipTiles);



    db.sync(function(err){
        err && console.log(err);
    });

    callback(db);

};