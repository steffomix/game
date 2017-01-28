/**
 * Created by stefan on 27.01.17.
 */


module.exports = Message;

/**
 *
 * @param connection {Socket}
 * @constructor
 */
function Message (connection){
    /**
     * @type {{t: Number, d: {}}}
     */
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

    /**
     *
     * @param data {{}}
     * @returns {Message}
     */
    this.create = function(data){
        msg = {d: data, t: new Date().getTime()};
        return this;
    };

    /**
     *
     * @returns {{t: Number, d: {}}}
     */
    this.getMsg = function(){
        return msg;
    };

    /**
     *
     * @param cmd {string}
     * @returns {Message}
     */
    this.emit = function(cmd){
        connection.emit(cmd, msg);
        return this;
    };

    /**
     *
     * @param cmd {string}
     * @param connection {Socket}
     * @returns {Message}
     */
    this.emitTo = function(cmd, connection){
        connection.emit(cmd, msg);
        return this;
    }

}