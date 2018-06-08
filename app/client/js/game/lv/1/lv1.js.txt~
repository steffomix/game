/*
 * Copyright (C) 17.12.16 Stefan Brinkmann <steffomix@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

define(['config', 'logger', 'underscore', 'gameEvents', 'gameMainPlayer', 'gamePlayer', 'pixiPlayers', 'gameApp'],
    function (config, Logger, _, events, MainPlayer, Player, playerContainer, gameApp) {

        var instance,
            logger = Logger.getLogger('gamePlayerManager');
        logger.setLevel(config.logger.gamePlayerManager || 0);

        return getInstance();

        function getInstance() {
            if (!instance) {
                instance = new GamePlayerManager();
            }
            return instance;
        }

        function GamePlayerManager() {

            var mainPlayer = '',
                players = {};

            events.game.initialize(function(){
                logger.info('Game initialize PlayerManager');
                gameApp.set('playerManager', this);
            });

            events.server.logout(function(){
                reset();
                mainPlayer = '';
            });

            events.game.frameTick(function(t, l){
                _.each(players, function(p){
                    p.frameTick(t, l);
                })
            });

            events.game.workerTick(function(t, l){
                _.each(players, function(p){
                    p.workerTick(t, l);
                })
            });

            /*
            events.server.tick(function (gameState) {

                var mobiles = gameState.received.mobiles;

                // set mainPlayer to gameState
                players[mainPlayer] && (gameState.state.mainPlayer = players[mainPlayer]);


                // create not existing Players
                if (mobiles) {
                    _.each(mobiles, function (location, name) {
                        if(!players[name]){
                            location.name = name
                            addPlayer(location);
                        }
                    });
                }
                // remove players without location except mainPlayer and update with serverData
                _.each(players, function (player) {
                    try {
                        if (!mobiles[player.name] && player.name != mainPlayer) {
                            removePlayer(player.name);
                        }else{
                            // mobiles may not have been send yet
                            mobiles[player.name] && player.updateLocation(mobiles[player.name], gameState);
                            player.serverTick(gameState);
                        }
                    } catch (e) {
                        logger.error('PlayerManager.serverTick: ', e, gameState);
                    }
                });
            });
*/




define(['config', 'logger'],
    function (config, Logger) {

        var tileSize = config.game.tiles.size,
            chunkSize = config.game.chunks.size,
            scale = config.game.tiles.scale,
            logger = Logger.getLogger('gamePosition');
        logger.setLevel(config.logger.gamePosition || 0);


        function factory(self, relative){
            return relative ? gamePositionRelative(self, relative) : gamePosition(self);
        }

        return {
            factory: factory
        };

        /**
         * Create calculators for position, grid and chunk
         * @param p1
         * @private
         */
        function calculators(p1) {
            /**
             * calculate if p1 and p2 is same
             * @param p2 {{x, y}}
             * @returns {boolean}
             * @private
             */
            p1.eq = function (p2) {
                return (p1.x == p2.x && p1.y == p2.y);
            };
            /**
             * calculate distance
             * @param p2 {{x, y}}
             * @returns {number}
             */
            p1.dist = function (p2) {
                return Math.sqrt(Math.pow(Math.abs(p1.x - p2.x), 2) + Math.pow(Math.abs(p1.y - p2.y), 2));
            };
            /**
             * calculate difference
             * Usage for movements: {x, y} = diff(posIsNow, posMoveTo)
             * @param p2 {{x, y}}
             * @param minX {number} threshold, below defaults to 0
             * @param minY {number} threshold, below defaults to 0
             * @returns {{x, y}}
             */
            p1.diff = function (p2, minX, minY) {
                var x = p2.x - p1.x,
                    y = p2.y - p1.y;
                !minX && (minX = 0);
                !minY && (minY = 0);
                return {
                    x: Math.abs(x) >= minX ? x : 0,
                    y: Math.abs(y) >= minY ? y : 0
                }
            };
        }

        /**
         * calculate grid and chunk coordinates
         * and integer mouse position in px of inside tile where 0,0 is center of.
         *
         * Calculates in Units:
         * px,
         * grid (px * tileSize)
         * chunk (grid * chunkSize or  px * tileSize * chunkSize)
         *
         * @param self {{x, y}}
         * @returns {{x, y, grid, chunk}}
         */
        function gamePosition(self) {

            // position in px inside of tile where 0,0 is top left
            // max x, y range: 0 to tileSize
            var tile = {
                get x() {
                    return self.x - gridPos.x + tileSize / 2;
                },
                get y() {
                    return self.y - gridPos.y + tileSize / 2;
                },
                set x(x) {
                    self.x = gridPos.x + Math.max(0, Math.min(x, tileSize)) - tileSize / 2;
                },
                set y(y) {
                    self.y = gridPos.y + Math.max(0, Math.min(y, tileSize)) - tileSize / 2;
                }
            };

            // tiles position in grid, eq to database location and user-location
            var grid = {
                get x() {
                    return Math.round(self.x / tileSize)
                },
                get y() {
                    return Math.round(self.y / tileSize);
                },
                set x(x) {
                    self.x = Math.round(x * tileSize);
                },
                set y(y) {
                    self.y = Math.round(y * tileSize);
                }
            };

            // tiles position in px on the tiles-grid
            var gridPos = {
                get x() {
                    return grid.x * tileSize;
                },
                get y() {
                    return grid.y * tileSize;
                }
            };

            var pos = {
                get x() {
                    return self.x;
                },
                get y() {
                    return self.y;
                },
                set x(x) {
                    self.x = x;
                },
                set y(y) {
                    self.y = y;
                },
                get tile() {
                    return tile; // position inside tile in px
                },
                get grid() {
                    return grid; // tile id in grid
                },
                get gridPos() {
                    return gridPos; // global grid position in px
                },
                get worker(){
                    return {
                        x: self.x,
                        y: self.y,
                        grid: {
                            x: grid.x,
                            y: grid.y
                        },
                        tile: {
                            x: tile.x,
                            y: tile.y
                        }
                    }
                }
            };

            calculators(pos);
            calculators(tile);
            calculators(grid);
            calculators(gridPos);

            return pos;
        }

        /**
         * calculate relative coordinates of another container
         * calculate grid coordinates
         * and integer mouse position in px of inside tile where 0,0 is center of.
         * Used only by pixiRoot to calculate mouseEvent position on the grid
         * @param self {{x, y}}
         * @param rel {{x, y}}
         * @returns {{x, y, grid, chunk}}
         */
        function gamePositionRelative(self, rel) {
            var pos = {
                get x() {
                    return (rel.x - self.x) / scale;
                },
                get y() {
                    return (rel.y - self.y) / scale;
                }
            };

            var tile = {
                get x (){
                    return pos.x - gridPos.x + tileSize / 2;
                },
                get y (){
                    return pos.y - gridPos.y + tileSize / 2;
                }
            };

            var grid = {
                get x() {
                    return Math.round(pos.x / tileSize);
                },
                get y() {
                    return Math.round(pos.y / tileSize);
                }
            };

            var gridPos = {
                get x() {
                    return grid.x * tileSize;
                },
                get y() {
                    return grid.y * tileSize;
                }
            };

            var position = {
                get x(){
                    return pos.x;
                },
                get y(){
                    return pos.y;
                },
                get tile() {
                    return tile;
                },
                get grid() {
                    return grid;
                },
                get gridPos() {
                    return gridPos;
                },
                get worker(){
                    return {
                        x: pos.x,
                        y: pos.y,
                        grid: {
                            x: grid.x,
                            y: grid.y
                        },
                        tile: {
                            x: tile.x,
                            y: tile.y
                        }
                    }
                }
            };

            calculators(pos);
            calculators(tile);
            calculators(grid);
            calculators(gridPos);

            return position;
        }


    });







### Hello, sorry for the late
# just returned from odd places {stuff your hat}


++++ use:
material:
	2 different branches
	a stone
	cristal
	net
	compass
	magnet
	mirror
	two plants with roots
	blue, red and black edding
	
images:
	several books of life
	several hole patterns to simulate a soul
	less developed books of life
	tree of life
	




### Lets start with a little warmup over 3 very easy, maybe stupid looking things
# hopefully you understand all 3 properly, otherwise you may run in deep trouble


### 1. about words and meanings
# when we take a word like a "branch", it can have several meanings
# So, when You say branch, you probably mean this {take a branch} or this {take a different branch}
# stupid huh?!
# But when I give you a meaning direct through spirit, this looks a little different
# In this case it depends on your earthly experiences, how spirit meanings will be rendered into to a matter form like this branch
# And to make it even worse, everyone will need a little different time to render a result
# So when someone say a meaning to all people on earth on the same time, the results can be very variant in time and form
# more on this later


### 2. about stones and words
# when you throw a stone to another person, there is a chance that he react to it somehow, maybe the stone comes back
# stubid huh?!
# but when you throw a stone to a person with relationships to other persons and they are able to communicate, there is a probability that a bunch of stones come back
# and the more stones come back, the higher is the pobability that even you react on the reaction
# and then we are in a situation of a recursion
# now think about speaking words to masses of people which hurt them or turn out to lead into unpleasant situations which hurt them then
# just think about


### 3. about the meaning of white bread and soured bread
# white bread is made out of white flour, that has kept pure and holy through the whole lifecircle of making the bread
# soured bread is making out of white flour, that is messed up with life experiences during the making process
# when you eat only soured bread, you loose connection to your source, get lost and die
# when you eat only white bread, you never come in contact with life and therefore never become living
# its getting steep hu?!
# well, it will continue that steep the whole time...


### Lets go into the real thing
# imagine this air here is nothing, so actually you can't see anything
# and all this nothing is God
# in this timeless nothingness there is a 50/50 chance, that in this nothingness grows some kinda at this point undefined striving
# and whis this undefined striving God get aware of himself
# and by getting aware of himself he creates himself into himself
# and he cant create anything else then himself, because the is nothing else then himself
# now we have God in God and the only thing that separates both from each other is the relationship to each other
# so when now God in God get aware of God around him, we have a situation as if you hold two mirrors against each other, which creates infinite Gods in God
# but because God is infinite in itself, it doesn't matter how much you separate away from him, he stays always infinite


### ok let's take some stuff to visualize this
# {cristal} a piece of God (polished rock cristal)
# {net} some relationships
# {compass} some striving with a nice dumping device, we come later to it and a mirror, all in one, nice
# {magnet} some other striving influence
# now take a piece of God and put some relationships on it {put cristal into net}
# every time one being or piece of God get aware of another one it or he can accept it to pe part of it or repell it
# that way we come a little close to the meaning of striving
# when we allow someone to be part of us, we will care about him as if it is us, no matter what, unconditional, we call this love
# when we don't allow someone to be part of ourself, we will repell him like something that hurts us, no matter what, unconditional, we call this hate
# but because the other is yust another aspect of ourself, we truly repell ourself out of ourself, or integrate ourself into ourself
# that way you become or loose mass, this cristal becomes heavier and with it, its striving becomes more effective and stable


### lets look a bit deeper into the striving
# when all this relationships become more complex, this striving becomes a more clearly meaning
# so when we care about something we tend to do this in a servant way
# but when we have to live with beings we can't repell them for whatever reason, we tend to rule over them to gain at least a bit advantage out of this nasty beings
# so the most (or nearly most) basic or primitive striving is all about ruling and serving
# {show striving scale image} and with this we become something like a grayscale from white for servant to black for ruling


### now we have this nice dumping device, let's go into it's meaning
# look, in spirit reality without our body, every time when another striving being comes close {take another magnet} it influences its striving, but as soon as we go away we return to the striving of our global environment
# but within our body we have something like a separated micro environment
# this micro environment isolates us from the global striving we are part of in spirit realm
# and when we now get in contact with another striving, every time this dumping device moves a little and realign our striving to a new point where we feel comfortable
# when we do this often we would call this magnetizing or decieving
# and without our brain we would be complete helpless against this decieving effects
# but with our brain we can figure out technics to work against this effects
# the downside is, that we are going to get used to our striving and barely get aware in what state it actually is or has grown to
# to become an idea in what striving we are in the global spirit reality, we have to stack all ruling actions against others as well as all servant actions for others and then look to what we tend more
# in additiin to this, there is a contradicting effect of striving while in matter live
# when two or more souls in a matter body come close, they react to each other like magnets
# the servant become more servant in presence of a ruler and the ruler become more ruler in presence of a servant
# that way they neutralize its overall striving and become together neutral
# this works even in a group of many souls who always try to become alltogether a neutral striving
# therefor when two strong servents come close together it becomes pretty difficult for both to stay servant
# on the other hand, when two rulers come together, they have the same difficult task to stay ruling


### let's look into the body and spirit behavior {take two plants}
# this side in the air reflects your spirit reality, the soul being you grow to
# and the roots reflects the life in your body
# and the earth reflects the matter reality
# so, when you now make an intention in your soul, this intention has to materialize itself through the roots into the earth, or at least has to be rendered in your brain into an idea or inspiration
# because there are many stages, this materialisation process will take time
# whereas a direct communication in spirit takes no time at all, even the most complex conversation can be transmitted within a fingersnip
# but because of the lack of time consuming conversation we become a what-causes-what riddle
# this riddle is like the question, what was first, the egg or the chicken
# this riddle works as well like one magnet try to influence another one{move magnet to compass} where you can not say what magnet is acting and which is reacting
# this lack of time consuming interactions makes it impossible to make experiences about what-causes-what or who was acting first
# but when we live in a body, where everyone is encapsulatet in his own spirit reality and the conversation takes time through all this separation- and translation layers like across all the roots to the roots of another plant, we can very well experience what-causes-what
# that way we can make very profound decisions, what we allow to be part of us, what we want to repell and how we want to align our striving in general


### let's look a little deeper into relationships
# every time we have a relationship that tries to force us to something we have some kinda nasty beasty marks of entanglement like this nodes here {point to the nodes of the net} representing or reflecting the relationship we feel a force to
# this marks doesn't stand only for repelling, it stands for every kind of force caused by this relationship, it can be as well the idea we have to repay a pleasant action, for something good, so that the idea of a dept force us to this relationship and cause a mark
# in a strong servant environment every action from others is percived as a blessing and embraced and accepted in unconditional forgiveness
# in a strong ruling environment every action from others is percived as an attack and repelled and judged as unforgiveable
# to get rid of this marks we just have to ignore this imagination of a force against us by forgiving it and allow this relationship to be part of us


### let's look at  the meaning of the book of life
# when we now look into all the souls, who have integrated other souls, and all of them have done that in their own way, every soul developes a unique set of ingrediences, that defines its spirit name or colorset
# so when we now combine the black-white gradient {show black-white gradient image} of striving with all the colors {show rgb colorset image}, we become something like a map {show book of life} like this image
# here we see the inner more lightning range of servant striving and the outer, more dark range of ruling striving and in the middle we see how the both strivings clashes together
# now everyone has his own book of life of what he has allowed to be part of himself {use mask to show only a part of the book of life}
# when we now start a life on earth as a servant soul, but become a ruling striving through this and throw out all, or most of our servant souls, we begin to vanish out of the servant book of life and become a member of the ruling book of death {move mask from light servant to dark ruling area}
# therefore the book of life is more likely a book of states a soul can have, so when we focus on a soul and compare its state with this book, we know where it currently is
# and when this soul is in a state we have not yet experienced, for us this soul is vanished out of our book of life
# {show cristal without net} that's what we should look like to enter the global servant reality, pure like this cristal, may have some breaks that doesn't matter, but whatever happened to us, all should be forgiven and embraced within us in unconditional love {show book of life} which defines our prosperity we love to care for
# {stuff the cristal into a large net} that's a being from a ruling reality, where the repelling relationships cause at the same time an attracting force of judgement and hatred {show a galaxy} which defines its ruling power
# both look somehow similar but don't be fooled, they are the exact opposide


### let's look another times in the book of life and the abilities of souls
# {take a book of life and mask to separate a souls ingredients}
# let's say a soul like this begins as a servant being in a mostly servant environment on earth
# but during lifetime this soul gets more and more cought up by the pleasures of a ruling striving
# {move mask into dark area}
# when this soul dies in this state it really get lost in the book of death and becomes part of the general ruling environment in the spirit reality
# but this soul can also grow by accepting more and more diversity, even the ruling ones and becomes more and more mass through this
# however, to bear the contradicting strivings is not an easy task and needs a lot of experiences to keep all that in order


### Keep your house in order
# every time we come across something that is not part of us or at least close to us, it feels disturbing {draw a contrast color point on a separated book of life}
# in a situation like this contrast color point it can become pretty difficult to integrate this without being in pain about the borders
# so mostly we are going to repell such things out of our life by creating rules, which are used for judgement and the more we do that, the more we reduce ourself 
# but when we grow up in our experiences, become more diversity and with it more mass within us, we may be able to integrate things that we thought it is impossible to be with
# so the more we allow to be part of us, the more mass we become
# and the more mass we become, the more difficult it becomes to change our striving and with this we become more integrity and stability
# but when we are in a ruling striving, we continously loose mass caused by its repelling nature
# this can get so far, that we are going to reakt on the slightest disturbing act and are going to be so unstable, that we are continously reacting and literaly continously freaking out, so that there can not be peace at all


### let's look a little deeper into the overall growing process
# {take a less developed book of life}
# compared to the more colorfull book of life we see here the beginning stage of Gods selfawareness or consciousness
# to get an understanding of it, we need to get aware of a third kind of striving, the neutral, undefined or, when we look into a body, a distorted or messed up striving 
# with this we become a somehow smooth grayscale from the white servants to the black rulers
# this green, undefined or distorted striving is basicly the food of both striving poles
# the rulers abuse them to get some kinda distance to themself, because rulers hate and repell rulers, but with some neutrals in between the can come together somehow
# and the servants love them and want to intergate them to increase the joy of beauty of diversity and to feel more complete
# but this development process becomes more and more wavy over time, so that the book of life begin to look like slice of a tree trunk
# and when we add the growing waves to it, we become a picture like this {show 3d tree of life}
# the matter world develops in this most coloful area, where servants and rulers come together
# and when we make a cut to open this, we can see how it becomes more and more strange with every wave
# this magnetic field lines, which are drawn wrong for the purpose to see them all,
# and in the tip of every mountain of wave we see the most beauty of God in this magnetic field lines
# but as you can see, until recently we never managed to come into a state of infinity where a soul of God managed to integrate the whole thing, to carry all life experiences in one Boat and stay in peace with all existence


### Let's talk about Boats
# the is a nice ancient fairy tail of a man who attempt to build a boat to carry all life on earth for a certain time secure over the rising waters, probably you have heard of it
# the story began on land where this man had a solid stand, what means he was living in the spirit realm and was secure in the striving of the global spirit environment
# but the contradicting striving began to rise up and the land become unsecure due to rising waters
# but his beloved wasn't strong andvexperienced enougth to swim for the time the water was too high
# so he began to build a Boat, strong and big enough to carry all Life of his striving over the waters of the contradicting striving
# so the waters rised up and the bout become swimming and all the land began to vanish under water
# and from time to time this man was going on deck of his boat where he had a little dovecote
# he took a dove from it to send a spirit message in the hope of a response from land
# and said to the dove: "bring me something, where cristal clear oil of unconditional love and forgiveness drips out. There we will head on and build our new home"
# so he did every day and you won't believe with what kinda trash the dove did come back, that did not fit to this mans requirements
# but one day the dove did come back with a branch where cristal clear oil of unconditional love and forgiveness dripped out.
# and the man said: "This is the land I searched for, let's head on it. This Land will never get drown in the waters again."


### let's look how to travel in spirit realm
# the position in spirit is defined at first by it's striving which is defined by it's ability to forgive and at second by it's state which is defined by the diversity of your love
# the greater the diversity of your love is the greater is the mobility in spirit realm
# but when you want to travel to different places, you need another soul you love and who loves your place and the place you want to travel to. For the travel itself you just have to focus the soul you want to travel with, he has to do this as well to you and then he just has to get in love with the place you want to travel to and you are there in a fingersnip.
# but when you loose focus of your soul you traveled with, you will snap back to a place you are currently at most in love with.
# thats it, easy as that
# therfore it makes sense to fall in love with everything and be able to forgive everything to increase your moving range and with is the diversity of heaven you can enjoy
# doesn't mean that you ever get bored in heaven, because everyone cares for each other and tries to make heaven as beautyful as possible for you, so you barely will have to wait for a taxi


### a last word about backfire
# due to the nature of being made out of one piece of God, everything we do to others, we do to our self, which cause to feel it instantly in spirit realm
# but when we live in our separated micro environment of our body, this backfire is mostly blocked as long we live in it
# how much it is blocked depends on our awarenes of the global spirit realm through our body
# with a little effort we can create some kinda fissures in our body suit to become a better connection to the global spirit environment
# but even strange situations or life-threatening injuries due to accidents or illness can cause fissures in our body suit
# So our body gives us the possibility to move through the strivings as we want and widen the diversity of our love
# but to make sure you really understand the meaning of backfire, I want to show you what I mostly see, when I walking through the matter world.
# for that I take this mirror and show you what I am looking at


### To make sure you really understood backfire I want to show you something special
# {take the mirror and show the camera in the cross} 
# whatever most people say what this was meant for, they are all wrong
# so, what part on don't kill is too difficult to understand?
# this little was so humble, that he never defended himself and fought back, no matter what
# so he was going this way to bring us at least to the point to repent somehow
# but instead it was quickly turned around into a "he wanted it so" to repay our failures
# and to make it worse it's said "his precious blood is our salvation"
# and as he asked for a bit water to bring his message back to life, he got acid to etch his message away
# and when someone jumped in and said :"Wait wait, his message was for us to do!" he got punished for it and a response like: "No no, we can do nothing, he did all for us. We just have to sit and enjoy how this guy slowly is rotting away!"


### but hey, everybody has a bad day sometimes.
# let's get over it {throw the mirror away} try it again and replenish his message









