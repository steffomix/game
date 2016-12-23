/**
 * Created by stefan on 08.12.16.
 */

    var expand = function () {
        var self = arguments[0],
            p = self;
        for (var i = arguments.length; i > 0; i--) {
            while (p.__proto__.__proto__) {
                p = p.__proto__;
            }
            p.__proto__ = arguments[i];
        }
        return self;
    };


function c1() {
    this.mc1 = 'mc1';
}

c1.prototype = {
    fc1: function () {
    }
};


function c2() {
    this.mc2 = 'mc2';
}

c2.prototype = {
    fc2: function () {
    }
}


var c4 = expand(new c2(), new c1())


var end = 0;


