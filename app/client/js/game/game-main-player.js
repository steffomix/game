/**
 * Created by stefan on 28.12.16.
 */


define(['config', 'logger', 'gamePlayer', 'eventDispatcher', 'gameApp'],
    function (config, Logger, Player, dispatcher, gameApp) {

        var logger = Logger.getLogger('gamePlayer');
        logger.setLevel(config.logger.gamePlayer || 0);


        function MainPlayer(user) {
            Player.call(this, user);
            var self = this;
            this.tick = function () {
                Object.getPrototypeOf(MainPlayer.prototype).tick.call(this);
            };

            dispatcher.game.initialize(function(){
                gameApp.addModule('mainPlayer', this);
            });

            dispatcher.game.mousedown(function(mousePosition, mouseState, gameApp){
                var grid = mousePosition.grid;
                logger.info('click grid', grid);
                self.location.x = grid.x;
                self.location.y = grid.y;
            });

        }

        MainPlayer.prototype = Object.create(Player.prototype);
        MainPlayer.prototype.constructor = MainPlayer;

        return MainPlayer;

    });