



var Login = require('./login'),
    connections = [],
    freeConnections = [];


module.exports  = new ConnectionPool();

function ConnectionPool(){

    this.addConnection = function(conn){
        console.log('new connection ', conn.id);

        var index,
            login = new Login(conn);

        if(freeConnections.length){
            index = freeConnections.pop();
            connections[index] = login;
        }else{
            connections.push(login);
            index = connections.length -1;
        }

        conn.on('disconnect', function(){
            login.onDisconnect();
            connections[index] = null;
            freeConnections.push(index);
        })
    };

    this.removeConnection = function(conn){
        connections[conn.id] = null;
    };

    this.getConnection = function(id){
        return connections[id] || false;
    }


}