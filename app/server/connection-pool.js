

var db = require('./db'),
    Connection = require('./connection'),
    connectionPool = [],
    freeConnectionPool = [],
    Tick = require('./tick');


module.exports  = new ConnectionPool();

function ConnectionPool(){

    var storageTicker = new Tick(storageTick),
        lastStorageIndex = 0;

    // storage all 10 seconds
    storageTicker.fps = .015;
    storageTicker.start();

    /**
     * storage next batch of users
     * and optimize userTable every round of all users stored
     */
    function storageTick(){
        var storeCount = Math.ceil(connectionPool.length / 2);
        console.log('storage tick', storeCount);
        do{
            connectionPool[lastStorageIndex] && connectionPool[lastStorageIndex].onStorage();
            lastStorageIndex++;
            if(lastStorageIndex > connectionPool.length){
                lastStorageIndex = 0;
                db.optimizeUsers();
            }
            storeCount--;
        }while(storeCount >= 0);
    }


    this.addConnection = function(conn){
        console.log('new connection ', conn.id);

        var index,
            connection = new Connection(conn);

        if(freeConnectionPool.length){
            index = freeConnectionPool.pop();
            connectionPool[index] = connection;
        }else{
            connectionPool.push(connection);
            index = connectionPool.length -1;
        }

        conn.on('disconnect', function(){
                connection.onDisconnect();
                connectionPool[index] = null;
                freeConnectionPool.push(index);
        });
    };



}