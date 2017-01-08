/**
 * Created by stefan on 28.12.16.
 */


define(['config', 'logger', 'gameRouter', 'gamePlayer', 'debugInfo', 'eventDispatcher', 'tween', 'gameApp'],
    function (config, Logger, router, Player, DebugInfo, dispatcher, tween, gameApp) {

        var logger = Logger.getLogger('gamePlayer');
        logger.setLevel(config.logger.gamePlayer || 0);


        function MainPlayer(user) {
            Player.call(this, user);
            var self = this,
                animate = new tween.Tween(this.gamePosition),
                debug = new DebugInfo(this, 50, -100).debug;

            animate.easing(tween.Easing.Cubic.Out);

            this.debug = debug;

            router.addModule('mainPlayer', this, {
                walk: function(job){
                    walk(job.data);
                }
            });

            gameApp.set('mainPlayer', this);


            dispatcher.game.frameTick(function (t, l) {
                animate.update(t);

                var root = gameApp.get('pixiRoot'),
                    mouse = gameApp.get('mouse'),
                    screen = gameApp.get('screen');

                debug({
                    time: Math.round(t),
                    load: Math.round(l),
                    chunk: root.position.chunk,
                    screen: screen,
                    pixiRootPos: root.position.grid,
                    mousePos: mouse.position.tile
                });

                if (mouse.isDown) {
                    var pos = mouse.position.gridPos;
                    if(!mouse.position.grid.eq(self.gamePosition.grid)){
                        walk({
                            x: pos.x,
                            y: pos.y
                        });
                    }

                }
            });

            function walk(pos) {
                animate.to(pos, self.gamePosition.gridPos.dist(gameApp.get('mouse').position.gridPos) * 5).start();
            }

            dispatcher.game.mouseUp(function (mousePosition) {
                walk({
                    x: mousePosition.gridPos.x,
                    y: mousePosition.gridPos.y
                });
            });


            dispatcher.game.mouseDown(function (mousePosition) {
                walk({
                    x: mousePosition.gridPos.x,
                    y: mousePosition.gridPos.y
                });
            });


        }

        MainPlayer.prototype = Object.create(Player.prototype);
        MainPlayer.prototype.constructor = MainPlayer;

        return MainPlayer;

    });