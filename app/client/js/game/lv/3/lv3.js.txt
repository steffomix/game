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

#########
Images:
	Robot
	book of live
	wickedness
	
Material:
	branch
	stone
	white bread
	empty bottle (no water) 
	pini silvestris brunch
	old handy for image

#########

### If you deny the spirit of heaven, let me explain 3 days of darkness
# if you continue to look into the wrong direction, despite all knowledge you have now, let me tell what you are striving to archive
# whereas heavens creations are based on water, your creations are based on fire {show image advanced robot}
# you will manage to be able to integrate yourself and get burried underneath your own creations, pretty much like our current bodys
# with the absence of watet you shut the door to heaven by yourself, but once the door is closed...
# {show a branch} there will be no connection possible to spirit, to the meaning of life -- that is what you want, right?!
# {a stone} there will be only the endless terror of performance and competition against each other -- as you allready have trained in your videogames, right?!
# {a bread} there will be only the hunt for any kind of material and energy to gain more power -- that is what you are striving for, right?!
# {no water} there will be no peace, no freedom, no joy, no bliss, no sleep, no caring love, no forgiving mercy


### Let me tell you where you have gone through (with Gods blessing of water)
# 3 days of darkness has nothing to do with time or visual light
# 3 days of darkness means the complete isolation from all spirit connection
# Don't think you don't feel this disconnection because you are an atheist
# It will feel like Jesus way to golgatha, get nailed on the cross and get banned into an infinite dark lair where you have to discover the meaning of 3 days again
# Near the end of the first day you will discover a leave that teaches you to render the meaning of life into words and you may want to name it Moses
# Near the end of the second day you will discover a flower that will teach you to render white flour into bread, but you will have to sacrifice your beautiful petals for this and you may want to name it Jesus
# Near the end of the third day you will discover a seed that teaches you how to become a mature fruit for the harvest and you may want to name noah Noah
# don't ask for how long that takes, that can be hundrets, thousands, millions or even more than trillions of years
# how long it will take is completely up to you, how well you discover the meaning of the 3 days, or the spirit of heaven


### But I don't want to do this anymore, because every time your rulers stubborness gets worse
# let me tell a little more of heaven to givevyou an idea what you are going to loose
# The reason why heaven has no numbers is, that nothing exist more than once
# because everything is unique, everything is infinite worthy in heaven, no matter who or what it is
# the idea to be one of many does not exist, therefore there is no math in heaven
# even every moment in heaven or action by the spirit of heaven never repeats again, therfore every moment becomes infinite worthy


### heaven always tries to embrace everything to enrich its diversity and to be part of its wholeness
# every new being entering heaven, or a being that seems to be lost and return to heaven is percived as if too heavens merge together 
# to enter heaven to enjoy oneness and uniqueness at the same time
# every being entering heaven therefore doubles its diversity and its beauty 


### Near the throne or near the tip of the mountain of heaven is where everything becomes bright white like snow
# unconditional love is the garden around the throne, the beauty of heaven, the meaning of life
# the snow, or unconditional love, or heavens garden is the flour for our white bread we made yesterday
# the inner most core of heaven, the tip of the mountain can not be understood right now, for that we need to climb even higher into the throne room


### the soil of heaven is unconditional forgiveness and the expressions of its servant striving create its beauty
# But heaven can not create separated diversity inside its oneness


### the soil of earth is unconditional judgement and the expressions of its ruling striving create its terror
# But the soil of earth can not create oneness inside its separated diversity


### heaven and earth are like two gears who have to learn to work together
# But due to their contradicting nature they can not get in direct contact without destroing themself
# even a drop of oil of unconditional love didn't solve this, it just moves the destruction into the future
# the oil from heaven, the spirit of Jesus from heaven only get abused, get diluted with ruling striving and get unpure and is therefore ruined and wasted
# the spirit of Jesus from heaven have become a lukewarm meaningless waste like stinking poop


### Let me explain the location of where you are and what kinda mercy you are going to waste
# air means servant striving, water means ruling striving
# between both begins a stormy relationship and deep down in the water some kinda despair begins to develop
# everything become moving
# {create a simple device without magnets and add a second empty bottle}
# the despair tries to flee into an even deeper state-of-being with more protection against bad influences (water drops through hole), the heavenly spirit follows supporting with knowledge and servant love which creates all living in this dead matter world
# our bodys are actually protection suites, made out of lower developed souls to protect you against your comrades and to protect heavenly beings from ruling striving, so that they can walk halfway secure through your lines
# therefore this matter world is actually below that what you call hell and a look into the stars gives you a slightly impression of the size of the whole thing


### {rotate the bottles} 
# the wicked environment of insane performant competitive ruling against each other causes despair
# the growing despair begins to attract the love of heaven and the storms above cause some kinda movement
# Through this movement a vortex like tunnel begins to develop, which is like a servant tunnel for the love from heaven trying to help, attracted by the growing despair in the matter world
# when the tunnel hits the bottom and has become stable, a pure white servant spirit from heaven can be born into this matter world
# Sadly Jesus has been killed in one of the most worse ways imaginable
# At least he managed to stay in his heavenly spirit even then, and become a special addon in our simple device
# {add the seven seals device to the simple device}
# This addon made the incoming souls more unity and responsive for spirit influences
# basicly this addon provide the seven seals of heaven as shown on the staff or the core from the tree of life
# this seven seals of heaven work like a filter, so that only spirits that matches this seals can enter the growing tree of life or heaven


### This simple device works even for your current matter body and all nature
# Use this simple device to unify the distorted striving of your body, which in return gives you the energy back you only know from kids
# Let me explain why this works better than regular meditation over hours
# Due to your activity in your body it is pretty difficult to change your striving
# It is way easier to create your targeted striving in a separated device without inner activity and add it afterwards to your body
# your body is mostly water as well like this bottle of water, so they are basically the same
# add your striving simply by contemplating over it while it moves in a vortex downwards
# When you get your water from a natural source like a brook from mostly untouched nature, a magnet is not needed, your water is already in the best high responsive shape you can get
# In highly distorted environments like cities you should use some magnets you could get easily there
# Do that 5-10 times in the early morning and in the evening, you may want to combine it with your short meditation exercise
# Don't use all water but let in up to 1/3 to give the next charge a better start
# making servant water for others is pretty difficult because you easily slide into the wish to push something, which is a ruling action 


### Side effects of unified water
# Distorted strived water develops inner borders very similar to borders of countries
# this borders are a hindrance for any kind of movement, communication or transport
# the enhanced transport and movement abilities of unified water tends to release stored poison materials stored in your body, who has to deal with it afterwards
# the upside of unified water is the better transport of any kind of fluids, nutritions and medics which in return becomes more effective
# if you have problems with muscle spasms or allready degenerating muscles, this will help them to release, stay released after been mobilized, vitalize and grow again
# if you are suffering under depressions, this helps as well but you should avoid sugar because it acidify your body and drives your nerve system violent, additionally you should make a tea from the needles of a pini sylvestris which needs to stand hot but not cooking for at least 30 minutes.
# be aware that your brain will try to get used to it and in return let you believe, unified water has become useless, that's not it, don't be tricked by your brain!


### Let's go to understand the "throne" room thats just the center, the sun or the source of life in heaven
# for this we build a simple heavenly being like a flower, because without a little surrounding we can not understanding
# it does not matter what kind of being we build, because so close to the center everything is build very similar and the outer appearance has a very low priority
# to be honest, in the same way a matter apperance can have or change to several meanings, in heaven every being is a meaning of God and can have or change therefore to several appearances
# the flower has three parts, the petals that represents the loving beauty of heaven, a middle ring with filaments that holds our seven seals with the blueprint of heaven and a center dome


### the center dome
# in the center of the seven edged dome we find the staff of life
# the bottom floor is made out of a seven edged mirror
# the wall is seven edged as well and goes round into the ceiling even in seven steps up to the top most center


### the seven seals or the first sacrifice of heaven (jesus christ)
# every of the seven bottom most mirrors of the wall has a broken out door of common used size, which is laying down at the floor as a seal
# the seals represent the filaments of the flower
# a seal is made out of 2 layers of glas and a third layer as a mirror at the bottom
# the first outer most layer has transparent engraved the sentence of the tail of the scripture of life so that you can feel and somehow see it, this layer represents the petals of the flower
# the middle glas has in white engraved the five sentences of the body of the scripture of life, which represents the filaments or the blueprint of heaven
# the bottom mirror has in red and from behind engraved the head of the scripture of life, which represents the soul of God or a soul in general 
# the glasses and even the glass of the mirror is surrounded with mirrors which have twelve holes arranged like beams of a star in the center of the seal and behind each hole is a light to enlighten the whole thing
# to give this lights a meaning, they represent that Jesus has come with a bouquet of flowers to you
# the seven seals does not touch the mirrors of the center, but touch the bottom of the door and the ground of the first and innermost ring which should be called "Hallway of the ark-angels"
# the scriptures have to be aligned that way, that you can read it when you want to go into the center, pretty much like a probe stand, whoever matches the seven seals is allowed to enter the center
# why this is so significant we see later in the second sacrifice, where the water from the center runs into its rivers


### the petals
# In the petals we express our love, the beauty of heaven
# the petals I want to be called the seven mountains or the body of Christ because we want to store there a representation of everything that can be described as good and beautyful
# organize the structure of the petals as you like, except two little exceptions


### the petals first sacrifice
# when you look from the center through the seven doors of it and follow this sight, you become a hallway that looks like a beam of light, the hallway has to be pure and clean so that nothing odd breaks or distort this beam of light
# that way the petals stay behind the mirrors and never have to face judgement from the center
# beside this, every one without any exception can walk all hallways and replenish himself in the petals beauty and realign himself on the seals of the flowers filaments


### the second sacrifice of Heaven, the seven rivers
# we break the bottom mirror into seven parts
# {prepare for writing 7x77} now we have seven mirrors at the ground, then a corner and then 7 mirrors around and 7 mirrors to the top
# that way the center gives us an understanding, how often we should forgive
# and the mirrors around gives us an understanding, that where ever we look at, we see just another point of view of ourself
# then we widen the break to get rivers from the center to the edges but we don't widen it like a light beam
# that way we become a little center lake which has no water for now, we will get this later


### the petals second sacrifice
# we lengthen the rivers through the petals so that they can bloom as soon as the rivers become water from the center lake 
# every petal has at least one fountain with water from the river
# but don't take all water from the rivers, let spillover a little beyond the petals borders as a sacrifice for the soil
# what this water is and what this all means we see later


### the outer doors of the body of christ
# {show the image of your handy} make like this in your own style as big as the path at the outside of every path of every section of the body of christ
# everything that may be healthy, useful or just beautiful bbring through this doors
# whoever wants to replenish himself with heavenly spirit shall come


### the meaning and source of the water
# every time the roots of the tree of life dived deeper, the soil get harder
# with Jesus as the main root a depth where reached where nobody from heaven can't move in public any more without getting punished to death
# for this someone has to manage to become seamless with Jesus in all states and continue the path into the deep black in a hidden way
# so hidden, that even he didn't know what is going on
# for this path he has to become poisened with all states of wickedness and freaking out hatred without leaving his servant state at all and recover from it on his own {show picture of wickedness} 
# this state means, that you can't focus to heaven, without all kinds of evil is jumping in your face
# this means basically a shutdown of your spirit connection to heaven
# when you die in this state, you will experience the worst kind of hell imaginable
# to bring this house in order again you have to workout every state by going into it, become like it, to become a true understanding of its nature {draw a path from an evil dot to its dark area}
# that way you draw a map of being or expand the book of life you can share in spirit realm or comfort distorted beings to become an understanding how things work, so that they become peace within themself and their environment


### but that was not deep enougth
# to go even deeper, this little guy throwed away the scripture of life in the meaning he is not worth it by all the sins he has gone through
# that way he reached the state of damnation where everything becomes completely pitch black and you get rippted of everything
# when you die in this state, this would be the very end of you
# this state is like being burried underneath a burried dead
# to recover from this you can only bless and pray for the dead above you, even if they suck out the last bit of life from you
# this is like trying to fill a bottomless hole
# at the end only blessed water brougt the breakthrough to become solid again and recover from it completely


### now this little guy was strong enougth to face the worst of the worst
# he returned and went through the now well known wicked and through damnation until he reached the center dome of the worst which looked from the outside like a freaking out hedgehog full of spikes
# after a while that seemed endless the spikes turned into hands and as the little guy said:
"I am not here for judgement" a door opened and he entered a small room that looked like made out of glas, so that you can see from inside out.
# In the center was sitting a little guy seemingly in the worst state ever imaginable and the little guy said again: "I am not here for judgement".
# so this little guy become trust and allowed to get in touch with the little guy.
# after all what I felt and have gone through, this was truly the worst and can only be described as infinite despair.
# I said a third time: "I am not here for judgement" and the little guy allowed me to comfort him, so that he became an understanding of all that
# As he becane an understanding he began to talk and as he was talking it was impossible to say if he is talking or me. 


### This is what he said:
I was there out of nothing and completely alone but in infinite peace and humility, like sitting on the lap of my infinite beloved father. There was nothing except me and him, I didn't need any more, didn't even know that there could be anything more beatifull. 
# Then something came through me, I didn't know what it was but it could come only from my father and he ordered me: "This is my voice, touch it!".
# So I went to touch it as gentle as I could. 
# As I touched it, a sound appeared and went away from us like a wave. A Sound of all sounds, silent and loud, gentle and mighty, low and high pitch, all at once
# And the sound went more far away and broke into endless colors like rainbows all around
# And the rainbows went more away into pieces of colors like shards
# And the shards begun to interact as if they are talking with each other
# This was so nice, so I went into it and called for attention like saying "hey!"
# And everything got aware of me and I got so bright white like a Star
# And nearly everyone wanted to become it as well, so I told them how to do that
# And that way we all became stars, so bright, but after a while they wanted to get brighter and brighter and begun to punish each other to become even brighter
# But the worst thing was, I felt all that as If it hurts me, so I went in another times to tell them to not do that, but whatever I tried it got only worse
# And I said "It is over now, I have put all that on my shoulders, nothing bad or unpure will ever touch you again."
# And my little guy said: "But you can not do that, nobody can bear that pain and forgive all that!"
# Then I put this little guy into my secure pocket {point to your heart} where only I can feel all his pain, so that nobody ever get in contact with this kind of despair
# And I said: "It's allready done".
# And a tear drop of unconditional love and forgiveness fellt down to the bottom glas that was a mirror and it broke into seven pieces
# And the drop became a lake and the breaks become little rivers
# The tears run through the mirror walls into heaven and should further be called "Rivers of Gods Holy Spirit"
# the book of life is completed and there is no place anymore where you can get lost
# there are two ways to heaven now
# the old one through love what means to be servant and forgiveness what means to have no marks of the beast
# and the new one by repenting into a state of despair that nothing on earth can soothe
# but whatever path you choose, keep in mind that God do not serve expectations, you can not fool God


### that was the center dome, why it is sealed and why the petals are behind the mirrors
# God never rules anyone, he don't even look at all your doings and bless all the way everything and everyone no matter what, even if you went away from him
# 




# for the case you want that building in real you need someone who has the last word when it comes to questions how to design it in detail
# for this purpose I want to recommend some angels actually living here to help you out
# please let me tell you that this is an opportunity to multiply your life experience, love and forgiveness on top of all you have allready reached
# when you refuse this opportuntity you will not loose anything, but all the life experience, love and abilty to forgive will fall to those who try to help themself without you
# for the case they forgot how angels behave a little reminder
# always stay servant and humble - this will be pretty challenging for you, don't underestimate this challenge!
# don't serve expectations, don't give somebody the opportunity to abuse you so that he get bad on this 
# angels vanish for the same reason, that way they protect you to get worse by abusing them
# don't move on your own or try to push anything, just sit and wait until someone comes to you and please you humble and gentle for help
# don't shame to admit lack of knowledge or experiences, It's better to admit ignorance and then maybe learn something than to screw things up out of ignorance
# if nobody comes to you for whatever reason, may be they are too busy with other things, don't care about, it's not on you, in this case just enjoy your life as usual


### the petals or the body of christ or just love, because I can not wait to give it to you
# for the body of christ, the beauty of heaven I recommend Shelley Burkett Sherill (YT-alias shelley L sherill) from texas deer park to design the body of christ, pretty much like maria made the body of jesus. 
# to give you a little starting point how it should look like, just let seven mountains look like a christmas tree, full of presents and beauty you can only find in heaven
# and remember, love has no rules, do as you like 
# but please don't forget a little well for each of the seven rivers, this is the only sacrifice I want to please you for


### you may wonder why there are seven entrys and a very flat hallway instead of one entry and seven steep steps up
# this is because the hallway is way easier to manage, we can come together on the same hight like brothers and sisters and the blessings from holy spirit are seven times increased
# and it looks nice, to respect the woman


### to make this flower working


### the leaves {draw leaves around the entrances}
# for the leaves and the roots I set Inez Marrinan from Dublin in Ireland (YT-alias Inez Marrinan), to care about the roots
# don't go without a staff of life, it is for your guidance and integrity
# never in your life judge or punish someone with this staff, it's a staff of mercy, love and forgiveness
# whenever you point to someone with this staff, grab it by the tail to put yourself in service and provide him the head to get biten by it and get poisened with conditionless love of god
# whoever you give a staff become like you and shall go for it, but don't *push* it in his hands, instead lay it down below his feet so that he can grab it in free will
# if you don't want to sin against others through talking, I can take it completely away from you, just let them look at the staff of life and they have everything needed for their live in heaven


### the seven seals
# for the seven seals, for gods forgiveness I set Melinda Kay Lyons (YT-alias Last Frontier Medium) from alaska anchorage, to write the third testament of the holy spirit, the spirit of heaven and to place it as the only allowed writing beside the seven seals in the hallway of the ark-angels
# additionally I give you the inner dome to design it (please keep it simple and make it somehow working)


### the center
# the center represents the soul itself or simply God


### a deeper understanding of the porpose of this building
# {take the bottle with the simple device} recently the spirit runs in a circulation down the center and up the outskirts caused by a ruling striving
# but now the direction turns into its opposide and you can connect directly and on your own through the center, get cleaned from all ruling striving to enter the body of christ or simply heaven
# every drop of water, running through the center into heaven represents a soul who finds a way to  God through his loving heart


### what closing the door means
# there is only a little time left you can enter heaven through the vortex due to death
# the time is over when all ruling striving is cleansed out, heaven expand to this earth and spirit behind matter swaps to matter behind spirit
# all who cant let go their ruling striving will be separated into an even darker and harder matter reality (forehead of the pharao becomes harder) until they have discovered the meaning of the three days
# that means they will experience 3 days of darkness
# all lukewarm who don't want to choose a side, in fear of unpleasant consequences will be taken by the rulers as their slaves, they will shorten the time to development servants
# regulary it looks like an atom: 1/3 rulers (protons) and 1/3 lukewarm (neutrons) in the core and 1/3 servants (electrons) around it


### 3 days of darkness
# on the first day they will manage to develop a soul like moses and try to become a better person
# on the second day, when the vortex is etablished again, they will become their jesus and with him the opportunity to enter heaven
# on the third day they develop a being like noah that is able to carry all life experiences without breaking what means he is able to keep them holy


### the spirit - matter switch
# in a ruling environment one matter thing can represent many spirit meanings of life
# how many meanings you can discover in a matter thing depends on your spirit enlightment or wisdom
# in a servant environment a spirit meaning of life can express itself in many matter representations
# how many matter representations you can express depends on your life experiences
# the more life experiences are gathered, the more diversity or beauty heaven becomes
# the requirements to fulfill the switch are simply that way, that the meaning of life has to be that way more significant than its matter expression, that you are able to use your outer appearance as a tool to express it, no matter what


### what is *your* meaning of life 
# is it based on ruling what means competition and performance *against* each others terror, to become the greatest ruler like a goliath
# is it based on serving what means love and peace *for* each others comfort, to become the lowest servant like a david


### spirit - matter switch, how that works
# air means servant or meaning and water means ruling or matter
# now imagine a pot of water on a heat source
# caused by the growing servant love due to the life and teaching of jesus from heaven the heat source becomes oil to burn, the water heats up
# after a while you can see little bubbles sitting on the ground
# these bubbles appear in real and some have allready experienced them
# when you run in such a bubble, all nature becomes intense living, as if the spirit jumps out of the matter
# it looks and feels like you can talk with all around you directly and you can see this with your bare eyes
# by default we have to wait until all water is evaporated


### extreme extra heat
# with this knowledge you have on hand now, you can heat the water up to extreme heat
# at one side you can get way more intense in touch with the spirit of heaven
# on the other side the water goes to get boiling and very violent and will cause intense tribulations
# learn to level the heat of your environment
# we don't want to destroy the earth, we want to move it more close to a servant striving


### the book of life
# the book of life contains the states a heavenly or servant being can reach or adapt to and return without help from other beings
# the book of life is a growing book
# jesus was the first one who managed to dive down into this deep matter world and returned to heaven
# jesus expanded the book of life to this matter realm
# jesus did not get in contact with the wicked state and adapted to it, therefore the wicked stayed out of the book of life


### enter the wicked state
# to enter the wicked state someone has to duve down to earth, return to heaven by becoming one with the state of jesus and then throw it away, like the worst sin ever imaginable
# then has to be able to return even from this to a heavenly state and expand the book of life that way


### enter the state of damnation, eternal darkness
# after surviving the wicked state he has to throw away his heavenly state another time in the same matter life to enter the state of damnation which is like being burried underneath the wicked where is the darkness of hoplessness and depression, being ripped of everything
# then he has to recover even from this seemingly impossible state and expand the book of life that way


### enter the state of infinite despair, eternal death of complete separation
# even it seems impossible to survive the state of eternal death, it is, because with all the experiences made before, he knows that this is just a state you can move in and out
# without this experiences made before, they work like a secure path for return, it is impossible to survive the state of eternal death
# he has to survive even that state and expand the book of life that way


### how to survive eternal death,  the tip of the mountain
# on the tip of the mountain of infinite servant striving you enter the state of your own nothingness and with it the state of infinite despair
# the loop is closed, the snake bites its tail and the book of life is fully opened
# there is no place in all existence anymore where you can get lost



### the realm of the wicked and the only way out
# the wicked are not lost forever, even if it feels like eternity
# the only way out is infinite despair, a state of complete hoplesness
# a state you reach when you realize where performance and competition against others will lead you
# a state of being, that even jesus can not reach
# therefore he don't know you anymore in his book of life and can't help you
# but I can reach the state of wickedness and the state beyond it, invinite despair
# I tell your this in advance to make sure that even all your expectations egainst others have been broken
# then I will come and look for you one by one, if you are ready to serve as the warning smoke for all who are looking for a ruling striving







