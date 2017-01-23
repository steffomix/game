

function X(){
    var x = 1;
}

X.prototype.f = function(){
    console.log(x);
}

new X().f();