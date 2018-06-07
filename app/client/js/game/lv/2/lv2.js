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











### Climbing the mountain is all about changing your striving from ruling to servant
# that means, that our earthly environment will reakt on the changing rule/serve balance and tries to reorganize and rebalance itself which usualy works out chaotic
# this is because all life decisions are based on this most grounded striving, and when it changes, everything in your life changes
# so what you need the most on those changes is to stay calm, no matter what
# because every little change in the striving of one soul moves all its relationships into a new, often onknown state, to which they have to get used to, so that the overall environment becomes stable again
# imagine a pot of water (ruling striving) we want to turn into air (servant striving) on a heat source
# we can do this quik with much heat and much violence or slow with low heat and low violence
# {use compass and magnet} but the biggest obstacle on switching in your striving is the zero point or suizide point of deepest depressions , where literaly *all* your previous dreams for your life will break and die
# don't underestimate this zero point of striving, it is one of the most horrible things a soul can experience


### Let's talk about religions
# Does your Religion rule or serve you?
# Understand the meaning of Religions as Houses where you can get or give something needful for your or others Path
# Religions should not block the path, they should not be a trap like a sticky or backstabbing flycatching plant
# Religions should not abuse their members to make themself great, because in return the members wield this greatness and walk in vanity, and walking in vanity in return denounces others.
# Does your Religion give you a backup and help making your own experience, or is it more like do and don't do this and that?
# Rethink the relationship of you and Religions: 
# They should be like Flowers aside your Path and we should be like Bees who have a nice flyby, to gather nourishments and enrich its diversity and beauty
# because by doing so, we quickly experience, that every single being, every soul or shard of God is a religion in itself


### Religions are like clothes we wear, to protect us against direct and raw spirit experiences
# but this clothes can get that strong and dense, that we completely loose the connection to our origin in spirit
# But when we want to go in direct contact again, we have to take off all those clothes and go naked
# To be naked means to be unprotected, to go in direct touch with our origin, there is nothing in between
# Being naked means to be highly vulnerable for everything that touches us
# Taking off our religious clothes means to open all doors and windows for a direct touch with spirit
# and what we come across in this direct touch, depends highly on our striving


### Let's talk about fear
# fear is a coverword for unpleasant expectations like love is for caring
# and expectations are a result of unpleasant predictions
# predictions can only made by our matter brain that always tries to make us feel confident to protect us that way from unpleasant experiences
# Spirit can not expect or predict the future
# In spirit you live in the now, what produces the timeless feeling
# but it's not timeless, it's just the absense of the ability of making predictions 
# Spirit will never have any expectation *against* you
# spirit always try to deal with the situation that just is now


### Focusing on Predictions and Expectations shutdown the connection to spirit
# with focusing on your brains work you block yourself out from spirit connections and any kind of help from there.
# with expectations, and in consequence with ruling commands against others you instantly(!) kick yourself out of any heavenly connection
# understand the life in spirit as a lifestyle in-the-now without any kind of predictions, expectations and its resulting Fear


### let's look into the difference between loving and forgiving
# when we love, we give something and whant nothing in return
# when we forgive, something has been taken from us and we want nothing in return
# loving and forgiving is completely the same thing, the same medal just watched from the other side
# when we comfort someone and want nothing in return is the same as get hurt and forgive
# the idea of repay is a pure ruling behavior
# and every force against any relationship of us, even the idea of it cause a beasty mark of the beast on our soul and makes us and that can not be in the pure servant heaven


### Let's look into the two sides of a thief
# nobody shows us better how to serve the right way than a thief
# thiefs don't go for attention and they are always very aware of their environment and what is going on there
# When recognize behaviors like stealing and being a hindrance as just one side of the same medal and turn it around, we have the common behavior of heaven like giving and supporting


### Let's look at the thief in larger scale, where he causes a what-causes-what riddle
# Imagine it is night, just before the sun is rising
# when then you go outside and touch the gras, it may be all wet, but there was no rain
# that is how to serve the right way
# like morning clouds, gently settling down and bless the lands
# or even better, like the moisture in the air, gently condensating its wet blessings where it has gone a little cold
# but don't summon clouds for rain

Serving right: The what-cause-what riddle of the sunrise and the morning dew
# show example of the morning dew at night, just before the sun is rising
# all is wet, but there was no rain!
# be like the morning dew, gently settling down and bless the lands
# what-cause-what riddle between rising sun and morning dew
# even more, be a blessing like the invisible water in the air, and spend life like the invisible air in the water
# bulk actions are like summoning clouds of rain and storms, where everyone runs for a save place.
# bulk actions are at most not needed, not even wanted, 
# bulk actions even need much experience, knowledge and awareness of the environment to handle them without causing damage
# this just as a raw preview for the more deep later on


### What is sin?
# A sin, that sends you to hell, does not exist
# Hell is basically to focus on bad things and try to get rid of them by ruling (later more)
# You can not make life experience without going into sin (going into this world of ruling)
# Even I sin right now against you, because I may rape you with my love right now
# We see later, that even heaven can only exist because God did the biggest sin possible: He broke his holy eternal purity for the sake of experiencing who he is!
# Putting on the point even helping others is a Sin, because you abuse those to become more loving, and the helped may feel denounciated because you are more loving or just more rich anyhow


### Sin and forgive are just to sides of the same medal
# Without sinning and forgiving you can not make life experiences
# Living without sinning is like walking on a thin rope where the slightest step aside means death - means living in fear (more deep later)
# Going into sin and find out again widens your movable area, widens your freedom
# Don’t fear sin, don’t expect (or predict) that sin automatically means eternal death, because it’s not true as long as you don’t forget to forgive
# Understand sin as a tool to figure out the meaning of good and bad and finally find *your* meaning of life
# But yes, you can end up in really bad situations, but in return you experience that the more you know the darkness, the brighter becomes the light and with it the reason how worthy light is and why you choose it no matter what
# But yes, you can bury yourself underneath your own creations and get lost in it for a looong time, but forever and ever? No!
# Why not? Because you are a part of God, of Everything, and this everything loves to be complete (later more deep)


### Understand a divine year (later more)
# Even if you are getting lost and love looks for you to help, and you choose even then to dive deeper into the darkness, the love will look for you even then
# you will have to go through all the three days again
# That’s the way the whole thing (God) gather life experiences and grow like a tree grows his yearly rings.


### Infinite darkness
# Even a tree has his most outer bark, where no water of heavens spirit flows
# When a divine year ends, the tree of life takes a part from the Bark into its Trunk, while the rest stays in the Bark and probably become the Trunk next year
# There is no need to force the Bark into the Trunk, even worse the tree get ill by doing so
# To become an idea of the timespace of a divine year, look into the universe like into the oceans of earth, just before all live began.
# Understand that every divine year is longer and more complex than the year before


### Let’s go into the Bark, or what the Brain does
# first your brain always tries to predict (expect, fear)
# second it tries to make you feel confident, normal (become ignorant)
# so your brain is your best friend and greatest enemy at once
# no matter how loving or hating you get, your brain will adapt to it, get used to it and make you feel normal
# Note: on death your brain (armor) turns off and you experience to what you have grown to as is, you go in direct unprotected contact with your selfmade striving and relationships
# your brain always tries to render spirit information into nearest matter representations
# technology-, social- and belief systems form the rendered result
# dreams are automatic rendered spirit (if spirit) informations as well
# I show you how to perceive and render spirit manually and bright daylight later


### turn off the brain or real fasting (Use Net to show)
# fasting has nothing to do with eating, hunger makes you angry
# how to get unrendered raw spirit information direct from source
# raw spirit = white flour for white bread
# meditation for making spirit breakthrough into wake consciousness
# don’t close your eyes and don’t focus on your “third eye” for rendered informations like sounds or images
# raw spirit comes through your soul, your whole being - without specific location
# Widen the Net with force like having contractions delivery or a chicken that breaks the egg
# 10 sec. up to 10 min. up to twice a day, always with full power out of your gut, not your brain
# literally *crush* the door to spirit  into pieces with all the power you can bring up
# Avoid any emotions or thoughts while doing that
# the max time (10 min.) on full strength and being in line with heaven can cause near death experience on bright daylight
# the memory of raw spirit experiences usually vanish the first times into a very sad rest of odd looking infos, that’s normal
# imagine to describe a high tech engine to a jungle tribe with sticks and stones 


### Side effects turning off the brain
# imagine looking away from screen to open the window a little
# first effect: impression like fresh air and life energy
# second effect: weird sensations like “sounds” through the window
# hearing “sounds” and see “images” like auras are brain-rendered spirit sensations, you should not focus on, that’s not your target, ignore those things and they vanish
# learn to synchronize spirit sensations with the “screen”, your eyes you are looking on
# learn to differ between sensations related to screen and sensations coming through spirit world (may be heaven)
# earthbound spirits are your first impression but that’s not your target
# reach non earthbound spirits means to have near death experiences, means to receive pure unrendered spirit - or pure white flour from heaven


### Baking white bread - or learn to render spirit
# when white flour (pure spirit) comes into your life (water), don’t haste or your mess it all into waste.
# learn to stand this intense impressions like a rock - or a strong vessel you can trust that it keeps things holy and don’t throw everything on the street you put in
# strong means integrity, integrity you get through standing suffering without going into ruling
# Note: Revenge suffering and punish others with received blessings is the same, last one is like forcing the bark into the trunk, like picking unripe fruits
# Let your received white flour settle down into your life until its complete diluted and seems to be vanished (can take years!)
# Now you are fully back in matter reality and should try to grasp your experiences from this side of reality and put all together you received
# Your loose flour has turned into dough or pastry, you can handle way better
# Don’t wait too long now and don’t mess around with it or your dough get infected by stranger influences and turns into sourdough
# The state of raw dough is the most sensitive, where you have to learn to keep things pure and holy (untouched)
# Bring your dough in order by making small portions if necessary and try to sort them into meaningful relations
# Go in love with it again (bake it) and try to put the dough into words and analogies that describe your spirit impressions at best
# After this baking process let your breads settle down a while until your loving heat has gone out
# The loving heat to your bread makes you getting hurt when other deny or denunciate it - so let it cool down before you serve it
# Let it completely cool down before you cut it in slices of words for serving, otherwise it is to cross from the outside and too sticky from the inside and you become an emotional mess of missunderstandings when you try to cut it in this too fresh state


### understand heaven (serving) and hell (ruling)
# In ruling you want everything repaid, the bad as well as the good
# In ruling you need rules for the bad and forbidden you always look to
# This rules create the ever growing book of laws and judgement
# In ruling you need ever growing controls to punish the bad and forbidden
# Ruling is the Idea, when everyone follows the rules, there will be peace and freedom, but freedom in more and more rules???
# In ruling you don’t need love and forgiveness, it’s moreover damaging the system of rules
# In serving everything is forgiven, the bad as well as well as the good
# Understand the two sides of forgiving (good and bad)
# In serving you have ever growing inspirations for the wanted beautiful through serving those in need
# In serving you don’t care about others behavior
# In serving everything seems to be ignorant, that’s why serving works only with love
# The serving idea is to care for others even if nobody cares about your caring (that is usually called: conditionless love)
# Even here on earth heaven always tries to care for you
# The idea of repay does not exist in heaven, you get or give something and that's it
# the need, even the idea of repay builds the ground for marks of the beast and that does not exist in heaven
# you don't even have to do anything, if you just want to enjoy the beauty heaven, be like the grass where the blessings of heaven settle down and let the holy spirit fondle you in gentle waves
# you can not flee to heaven because your current situation is so bad, you have to realize heaven in your hart as kind of a lifestyle, that you live no matter what, and therfore bad situations are the best environment to grind your heart for a heavenly lifestyle at easiest


### How to serve right, a deeper look with a dry run exercise
# drawing attached to spirit
# Remember how to do good things as I said: “...but there was no rain…”
# In this exercise you learn how to move in normal life within a secure environment of simply drawing
# The worse you are in drawing, the better - you see soon why
# You learn how to differ brain thoughts from spirit impressions while being fully awake, so it’s an extension of the meditation you should do before
# You can use any material that leaves visible trails like flat stones to scratch on, Sand to draw in with your finger or a stick or modern with paper and pencil
# Don’t show anyone your draws easily, because it’s an expression of your very personal conversation with your higher self
# While drawing don’t wait for commands, that will never happen, heaven never command anyone, just keep moving as you are used to
# Do the same way your in your normal daily doings
# Imagine to move a standing rock is much more difficult that giving an already moving rock a striving into a direction
# Don’t focus on a successful image, that's not the target of the exercise
# While drawing your brain tries constantly to predict what that it could go to be and tries to takeover control of your drawing process
# Don’t let your brain take control - that’s the first and hardest part of the exercise
# Put yourself into a feeling like a humble child, listening to loving parents like angelique beings trying to comfort you, but you are completely unable to understand anything
# To learn the angelique language of heaven is the second part of the exercise
# For a starting point: It feels like a very gentle mild warm summerwind you don’t know where it comes from, nor where it blows to
# But with practice the impression of the gentle “wind” becomes the same way meaningful contours as your drawings
# Do the same way in your daily doings, that become more secure and knowing what you are doing
# With more practice your learn to form some basic “spirit words” on your own and learn to “speak” this heavenly language directly with your soul and no odd brain thoughts between
# Learn the heavenly language pretty much like babies learn to speak
# It will feel like a dream, like dreaming and being awake at the same time
# To learn to establish this kinda connection in normal daily life is the third and final part of the exercise
# You daily doing, thinking and talking becomes angelique 


### reach the timberline on the mountain sinai
# We now can look down to all the grown and distorted meanings of life, where everyone runs criss-cross in circles
# We are standing on the bare naked integrity of everything, which is the purity of eternal life
# But integrity on its own has no meaning - and meaning on its own has no integrity
# The only way that integrity becomes a meaning, is to sacrifice a part of it, like to sacrifice a bone of your skeleton of integrity
# The only way for meaning of life to become integrity is to sacrifice a part of it, like to sacrifice a part of your freedom
# The sacrifice itself has to be like a connector between integrity and meaning...
# ...has to integrate and stand the contradicting properties of heaven and hell in one being, like an Ark containing all life experience without breaking
# ... has to be a being because there is nothing that is not a being
# … has to be as small (humble) as possible to not be a hindrance for the beauty and freedom of the freedom as well as not being an destructive curse for the integrity of eternal life
# ...to be a Son of God as well as a Son of Men, to be accepted for both
# …to be known, that everyone can become this and therefore this son is nothing special or “more” than anyone


### Balance Integrity and Meaning
# Understand Integrity of eternity as the man's part and the beauty of meaning as the woman's part
# When Integrity becomes too weak, or the Meaning becomes too strong, you can - on bad - either suppress the meaning or strengthen the Integrity
# Well, Man (Integrity) tried everything to hide his weakness by suppressing his meaning (Woman) and moved his strength from his servant inside to his ruling outside
# The more weak a man is on his Inside, the more power he need on his outside, he moves his mass (throwing out his life experience) from inside to outside - the Ark breaks
# The Woman in reaktion moves her beauty from her inside to her outside of ruling or more likely deceiving behavior
# This process or cause is a spirit what-cause-what riddle, there is no one to sue for, neither man or woman
# That way both destroy their Inside, move it to the outside, bury them self underneath it and get lost in it, the Ark sinks and all life experience in it drowns
# There is nothing you can do against it except knowing that this can happen and knowing how to fix that
# To fix that you need Knowledge, which is a result of experience and experience is a result of sinning and forgiving
# Balance in love can not be succeeded, it can only be choosen as lifestyle where you have to care about each other all the way along


### Meet your higher self means to surpass and integrate the spirit of Jesus
# surpassing doesn’t mean to become greater
# surpass means to bring your ruling striving to a halt like slowing down a rotating wheel until it stands still and turn it in the opposite direction, into a servant striving.
# Surpassing Jesus means to go through him like going through a door and truly enter and live in his servant kingdom, to enter heaven
# That’s because it makes no sense to just repeat a coming of Jesus
# --- Tell the Story of being in sync with Jesus and the poor jung man who could not see him ---
# Spirit never does the exact same thing twice, because you change by growing with every experience which makes a repeat impossible


### The meaning of Yeshua or Jesus explained on the Staff of Life
# The outer wrapping represents the soft expressions of the meaning of life, which protecting seal is a rope of love
# Don’t focus too much on the outer wrapping (matter world and body) or it goes too thick and turns into a dark dungeon of death
# The inner Trunk represents the integrity of eternal life
# On this Trunk is a little scripture that curves gently around it like a snake, that has three sections: A tail (first day), a body (second day) and a head (third day)
# Compare the Crystal (basic Soul), the Staff, every being and even Jesus as the same
# This staffs (or poles) striving was upside down as well as the scripture all the time until recently (The dove brought the branch)
# Recently it has becomes a little striving up and we begin to refuse to react on bad actions with bad responses and try to forgive and heal instead.


### What Jesus really did and does right now (Use hands to show)
# How Jesus sinks underneath hell and said “I’m a Son of God”
# How Hell killed him
# How Jesus keep awareness until near zero striving
# How both Jesus and his Bride (you all) signal (right now) to look and strive to heaven (are you ready for the final shot?)
# Jesus pours out his holy spirit over all mankind - It’s all like making love
# (more deeply later)

### Show the (Staff) Scripture of life - The sacrifice
# Show the scripture on the Staff and ask if you can accept this sacrifice of your freedom, if this is something you can accept to strive to


### Show the NDE and what it means to look in the right direction
# Head on Rest-Area with a little Cabin (hut), some tables and banks
# three paths
# 1 up to hotels, sports and extinct dino footprints in a stone quarry
# 2 straight across a bridge where a little pond turns into a little brook, to a woodman's hut, a nice big gras with a big fireplace in the center and banks around, taps for water supply and toilets are even there
# 3 deep down to a little spring of water, coming out of the rock, that contains much iron and tastes like rusty nails, a even smaller path to the brook
# When you can see only the outer being of a simple man, messing around with water, you can go back to the bank at the irony spring, sit down and think about what you have done wrong
# Turn around and see what you get, when you look in the wrong direction
# You see a dead man on a cross looking like a joke, meaningless snippets of scriptures too bad for the bin and some other crappy stuff laying around like stupid trash.


### Love has no rules or the trap of too much knowledge
# with too much knowledge all your attempts to become more loving or forgiving easily becomes a selfish touch and nullify or even worse results into the exact opposide
# its like heading to the tip of a mountain, the closer you come, the more difficult it becomes to not look at yourself
# it helps for a while to make yourself smaller and smaller, to become more and more humble
# but to really reach the top of the mountain you have to completely nullify yourself, you have to die for yourself
# this death is the point of complete servant striving, the eye of the needle you have to gothrough
# only at this point, in being one with the spirit of heaven you can experience the pure meaning of servant striving
# you become one with jesus and fully integrate his being
# this full integration is beyond believe, beyond being excited and even beyond love
# by walking through jesus you get aware that there is something way brighter than conditionless love


### a deeper look into a divine year (or the meaning of divine love)
# Let go all fruits of Love
# Let go all leaves of wisdom
# Let go all Branches of striving
# Let go your roots of life experiences
# Let go Your Bark of Protection
# Let dry the rest of you, the trunk, from all life sensations
# welcome your meaning of life
# Gently get in touch with your meaning of life
# Let the meaning of life suround you like a golden silky scarf
# Slowly go in love with each other and become all gold
# go in love with each other and become bright white like a sun
# Enjoy unity
# Enjoy oneness
# Enjoy the love of pure divine life sensation
# Let the holy spirit pour out over all flesh
# Enjoy the loving presence of each other
# Slowly let cool down your love to each other and become all gold again
# Gently get appart
# Enjoy the silky touch of your meaning of life
# Seal and keep holy your meaning of life by dressing up a new bark
# Let grow new roots of life experiences
# Let grow new branches of striving
# Let grow new leaves of wisdom
# Let grow new fruits of love
#
# {Fold this note gentle and put it to your heart pocket} "This is only for those who are willing to follow me"
