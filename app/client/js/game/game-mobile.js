/**
 * Created by stefan on 23.12.16.
 */


define(['config', 'logger', 'pixiMobile'],
    function (config, Logger) {

        var logger = Logger.getLogger('gameMobile');
        logger.setLevel(config.logger.gameMobile || 0);

        var tileSize = config.game.tiles.size;




        function Mobile(){

            var _location = {};



        }

        Mobile.prototype = {

        }










        function factory() {
            var _location = {};

            function int(n) {
                n = parseInt(n);
                if (isNaN(n)) {
                    logger.error('GamePlayer::pInt is not a Number: ', n);
                    return 0;
                }
                return n;
            }

            function changeFloor(n){
                _location.z = n;
            }

            function changeWorld(id){
                _location.world_id = id;
            }

            function changeArea(id){
                _location.area_id = id;
            }


            return {
                tick: function(){
                    var px = _location.x * tileSize,
                        py = _location.y * tileSize,
                        dx = (px - this.position.x) / 20,
                        dy = (py - this.position.y) / 20;
                    this.position.x += dx;
                    this.position.y += dy;
                },
                get area() {
                    return _location.area_id;
                },
                get world() {
                    return _location.world_id;
                },
                get x() {
                    return _location.x;
                },
                get y() {
                    return _location.y;
                },
                get floor() {
                    return _location.z;
                },
                set location(loc){
                    try{
                        this.world = loc.world_id;
                        this.area = loc.area_id;
                        this.z = loc.z;
                        this.x = loc.x;
                        this.y = loc.y;
                    }catch(e){
                        logger.error('GamePlayer::setLocation: ', e, loc);
                    }
                },

                set x(n) {
                    n = int(n);
                    _location.x = n;
                    var pos = this.position;
                    this.position.x = Math.round(tileSize * n);
                },
                set y(n){
                    n = int(n);
                    _location.y = n;
                    var pos = this.position;
                    this.position.y = Math.round(tileSize * n);
                },
                set z(n){
                    n = int(n);
                    n != this.floor && changeFloor(n);
                },
                set world(id){
                    id = int(id);
                    if(id){
                        id != this.world && changeWorld(id);
                    }else{
                        logger.error('GamePlayer::setWorld id must be greater than 0', id);
                    }
                },

                set area(id){
                    id = int(id);
                    if(id){
                        id != this.world && changeArea(id);
                    }else{
                        logger.error('GamePlayer::setArea id must be greater than 0', id);
                    }
                }
            }
        }

        return {
            factory: factory
        };

    });