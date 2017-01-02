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

            gameApp.setMainPlayer(this);

            dispatcher.game.mousedown(function(mousePosition){
                self.location.x = mousePosition.grid.x;
                self.location.y = mousePosition.grid.y;
                this.tween.to(mousePosition);
            });

        }

        MainPlayer.prototype = Object.create(Player.prototype);
        MainPlayer.prototype.constructor = MainPlayer;

        return MainPlayer;

    });