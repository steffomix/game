/**
 * Created by stefan on 28.12.16.
 */


define(['config', 'logger', 'gameRouter', 'gamePlayer', 'debugInfo', 'eventDispatcher', 'tween', 'gameApp'],
    function (config, Logger, router, Player, DebugInfo, dispatcher, tween, gameApp) {

        var logger = Logger.getLogger('gamePlayer');
        logger.setLevel(config.logger.gamePlayer || 0);

        var tileSize = config.game.tiles.size;

        function MainPlayer(user) {
            Player.call(this, user);
            var self = this,
                animate = new tween.Tween(this.gamePosition),
                debug = new DebugInfo(this, 50, -100).debug;

            //animate.easing(tween.Easing.Quintic.InOut);

            this.debug = debug;

            router.addModule('mainPlayer', this, {
                walk: function(job){
                    var pos = job.data;
                    pos.x *= tileSize;
                    pos.y *= tileSize;
                    walk(pos);
                }
            });

            dispatcher.gameMainPlayer.walk(function(pos){
                walk({
                    x: pos.x * tileSize,
                    y: pos.y * tileSize
                })
            });

            gameApp.set('mainPlayer', this);


            dispatcher.game.frameTick(function (t, l) {
                animate.update(t);

                var mouse = gameApp.get('mouse'),
                    screen = gameApp.get('screen');
/*
                debug({
                    time: Math.round(t),
                    load: Math.round(l),
                    chunk: root.position.chunk,
                    screen: screen,
                    screenPos: root.position.grid,
                    mousePos: mouse.position.tile
                });
*/
            });

            function walk(pos) {
                animate.to({
                    x: pos.x,
                    y: pos.y
                },
                pos.speed * 5).start();
            }

            dispatcher.game.mouseUp(function (mousePosition) {
            });


            dispatcher.game.mouseDown(function (mousePosition) {
            });


        }

        MainPlayer.prototype = Object.create(Player.prototype);
        MainPlayer.prototype.constructor = MainPlayer;

        return MainPlayer;

    });