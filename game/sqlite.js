
var sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('../db/db.sqlite3'),
    //tile = require('class/tile.class'),
    assert = require('assert');

var tbl = {
    users: 'users', // user data
    locations: 'user_locations', // users recent spawn locations
    worlds: 'worlds', // users worlds, names and configs
    tiles: 'tiles', // tiles itself with image name, default behave etc...
    areas: {
        home: 'homes_tiles', // tiles from users homes
        universe: 'universe_tiles', // tiles from mmo universe
        ship: 'ship_tiles', // tiles from ships in mmo universe
    }
};


/**
 * select one tile
 * @param user int
 * @param world int
 * @param area string ('home', 'universe', 'ships')
 * @param x int
 * @param y int
 * @param z int
 * @param callback function(tile data || false)
 */
exports.getTile = function getTile(user, world, area, x, y, z, callback){
    assert.notEqual(tbl.areas['area'], undefined, 'Area ' + area + ' not found');
    area = tbl.areas[area];
    var stmt = db.prepare(
            'SELECT t.data tile ' +
            ' FROM ' + area + ' t ' +
            ' WHERE user = ? AND world = ? AND x = ? AND y = ? AND  z = ? ' +
            ' ORDER BY x ASC, y ASC'
        );

        db.get(stmt, [user, world, x, y, z], function(err, row){
            assert(err, null, err);
            if(row){
                callback(
                    {
                        user: user,
                        world: world,
                        area: area,
                        x: x,
                        y: y,
                        z: z,
                        tile: row.tile
                    }
                )
            }else{
                callback(false);
            }
        })

}


/**
 * Select tiles of given range.
 * convert coordinates to x_y format
 *
 * @param user int
 * @param world int
 * @param area string ('home', 'universe', 'ships')
 * @param xMin int
 * @param xMax int
 * @param yMin int
 * @param yMax int
 * @param z int
 * @param callback function ( {user: int, world: int, area: string, range: {as given...}, tiles: { x_y: JSON string [, ...]} )
 */
exports.getTilesRange = function getTilesRange(user, world, area, xMin, xMax, yMin, yMax, z, callback) {
    assert.notEqual(tbl['area'], undefined, 'Area ' + area + ' not found');

    var area = tbl['area'],
        tiles = {},
        stmt = db.prepare(
        'SELECT t.x x, t.y y, t.data d ' +
        ' FROM ' + area + ' t ' +
        ' WHERE user = ? AND world = ? AND x >= ? AND x <= ? AND y >= ? AND y <= ? AND z = ? ' +
        ' ORDER x ASC, y ASC'
    );

    // map tiles positions to names: [x, y] will be 'x_y'
    stmt.each([user, area, xMin, xMax, yMin, yMax, z],
        function (err, row) {
            tiles[row.x + '_' + row.y] = row.d;
        },
        function () {
            stmt.finalize();
            callback({
                user: user,
                world: world,
                area: area,
                range: {
                    xMin: xMin,
                    xMax: xMax,
                    yMin: yMin,
                    yMax: yMax,
                    z: z
                },
                tiles: tiles
            });
        });
}
