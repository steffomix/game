
/*
// causes the error
function AnyClass() {
    PIXI.Sprite.call(this, PIXI.Sprite.fromImage('whatever-image'));
}
AnyClass.prototype = Object.create(PIXI.Sprite.prototype);

// works
function AnyClass() {
    PIXI.Sprite.call(this, PIXI.Texture.fromImage('whatever-image'));
}
AnyClass.prototype = Object.create(PIXI.Sprite.prototype);

// PIXI.Sprite.call(this, PIXI.Sprite.fromImage(...
// must be
// PIXI.Sprite.call(this, PIXI.Texture.fromImage(...
*/

    function BaseClass(){
        // add your stuff
    }
    var o = BaseClass.prototype;
    // add your prototype stuff
    o.stuff = 'whatever_except_getter_and_setter';


    // MiddleClass extends BaseClass
    function MiddleClass(){
        BaseClass.call(this);
        // add your stuff
    }
    var o = MiddleClass.prototype = Object.create(BaseClass.prototype);
    MiddleClass.prototype.constructor = MiddleClass;
    // add your prototype stuff
    o.stuff = 'whatever_except_getter_and_setter';


    // TopClass extends MiddleClass
    function TopClass(){
        MiddleClass.call(this);
        // add your stuff
    }
    var o = TopClass.prototype = Object.create(MiddleClass.prototype);
    TopClass.prototype.constructor = TopClass;
    // add your prototype stuff
    o.stuff = 'whatever_except_getter_and_setter';


    // to be continued...


    // To create an Instance with getter and setter
    function doNotExtendMe(toBePrivate){
        var morePrivates;
        return {
            // add getters, setters and any stuff you want
        }
    }