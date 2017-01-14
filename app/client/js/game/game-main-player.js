/**
 * Created by stefan on 28.12.16.
 */


define(['config', 'logger', 'gamePlayer', 'debugInfo', 'gameEvents', 'tween', 'gameApp'],
    function (config, Logger, Player, DebugInfo, events, tween, gameApp) {

        var logger = Logger.getLogger('gameMainPlayer');
        logger.setLevel(config.logger.gameMainPlayer || 0);

        var tileSize = config.game.tiles.size;

        function MainPlayer(user) {
            Player.call(this, user);
            var self = this,
                animate = new tween.Tween(this.gamePosition),
                debug = new DebugInfo(this, 50, -100).debug;

            //animate.easing(tween.Easing.Quintic.InOut);

            this.debug = debug;

            events.mainPlayer.walk(walk);

            gameApp.set('mainPlayer', this);


            events.game.frameTick(function (t, l) {
                var s = self;
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

            /**
             * animate player to given position
             * @param pos {{x: int, y: int, speed: int}}
             */
            function walk(pos) {
                animate.to({
                    x: pos.x * tileSize,
                    y: pos.y * tileSize
                },
                pos.speed * 5).start();
            }

            events.game.mouseUp(function (mousePosition) {
            });


            events.game.mouseDown(function (mousePosition) {
            });


        }

        MainPlayer.prototype = Object.create(Player.prototype);
        MainPlayer.prototype.constructor = MainPlayer;

        return MainPlayer;

    });