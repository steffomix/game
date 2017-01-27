/**
 * Created by stefan on 27.01.17.
 */


module.exports = Message;

function Message (connection){
    var msg;

    this.parse = function(data){
        var d = data.d, t = data.t;
        if(d && t){
            msg = {d: d, t: t};
            return d;
        }else{
            return false;
        }
    };

    this.create = function(data){
        msg = {d: data, t: new Date().getTime()};
        return this;
    };

    this.emit = function(cmd){
        connection.emit(cmd, msg);
    };

    this.emitTo = function(cmd, connection){
        connection.emit(cmd, msg);
    }

}