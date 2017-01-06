/**
 * Created by stefan on 28.12.16.
 */


define(['config', 'logger', 'gamePlayer', 'debugInfo', 'eventDispatcher', 'tween', 'gameApp'],
    function (config, Logger, Player, DebugInfo, dispatcher, tween, gameApp) {

        var logger = Logger.getLogger('gamePlayer');
        logger.setLevel(config.logger.gamePlayer || 0);


        function MainPlayer(user) {
            Player.call(this, user);
            var self = this,
                anim = {
                    x: 0,
                    y: 0
                },
                animate = new tween.Tween(this.gamePosition),
                debug = new DebugInfo(this, 50, -100).debug;

            animate.easing(tween.Easing.Sinusoidal.Out);
            gameApp.setMainPlayer(this);

            this.debug = debug;

            this.tick = function (t, l) {
                animate.update(t);

                debug({
                    time: Math.round(t),
                    load: Math.round(l),
                    chunk: gameApp.pixiRoot.position.chunk,
                    screen: gameApp.screen,
                    pixiRootPos: gameApp.pixiRoot.position.grid,
                    mousePos: gameApp.mouse.position.grid
                });

                if (gameApp.mouse.isDown) {
                    var pos = gameApp.mouse.position.gridPos;
                    if(!gameApp.mouse.position.grid.eq(self.gamePosition.grid)){
                        walk({
                            x: pos.x,
                            y: pos.y
                        });
                    }

                }
            };

            dispatcher.game.mousedown(function (mousePosition) {
                walk({
                    x: mousePosition.gridPos.x,
                    y: mousePosition.gridPos.y
                });
            });

            function walk(pos) {
                animate.to(pos, self.gamePosition.gridPos.dist(gameApp.mouse.position.gridPos) * 3).start();
            }

        }

        MainPlayer.prototype = Object.create(Player.prototype);
        MainPlayer.prototype.constructor = MainPlayer;

        return MainPlayer;

    });