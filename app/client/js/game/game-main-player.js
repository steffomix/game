/**
 * Created by stefan on 28.12.16.
 */


define(['config', 'logger', 'gamePlayer', 'eventDispatcher'],
    function (config, Logger, Player, dispatcher) {

        var logger = Logger.getLogger('gamePlayer');
        logger.setLevel(config.logger.gamePlayer || 0);


        function MainPlayer(user) {
            Player.call(this, user);

            this.frameTick = function (frameData) {
                frameData.gridPosition = this.gridPosition;
                Object.getPrototypeOf(MainPlayer.prototype).frameTick.call(this, frameData);
            };

            dispatcher.game.clickGrid(function(mousePosition){
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