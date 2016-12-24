/**
 * Created by stefan on 08.12.16.
 */


var expand = function () {
    var self = arguments[0],
        p = self;
    for (var i = 1; i < arguments.length; i++) {
        while (p.__proto__.__proto__) {
            p = p.__proto__;
        }
        p.__proto__ = arguments[i];
    }
    return self;
};


function extend(self, ext) {
    var p = self;
    while (p.__proto__.__proto__) {
        p = p.__proto__;
    }
    p.__proto__ = ext;
    return self;

}

function O1() {
    var _p1 = 10;
    return {
        set p1(i) {
            _p1++;
        },
        get p1 (){
            return _p1;
        }
    }
}

function O2(){
    var _p2 = 20;
    return {
        set p1 (i){
            _p2 ++;
        },
        get p1 (){
            return _p1;
        }
    }
}

var o12 = expand(O1(), O2());

var o1 = O1();

o12.p1 = 1;
o12.p2 = 1;
o12.p2 = 5;
o12.p1 = 7;
var p12 = o12.p1;
var p1 = o1.p1;

var end = 0;


