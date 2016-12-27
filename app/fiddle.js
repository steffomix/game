


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

    o.a = [];
    var i = new TopClass();
    i.a.push(1);

    var i2 = new TopClass();

    var x;