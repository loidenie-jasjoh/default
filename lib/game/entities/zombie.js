ig.module(
    'game.entities.zombie'
)
    .requires(
    'impact.entity'
)
    .defines(function () {
        EntityZombie = ig.Entity.extend({
            animSheet:new ig.AnimationSheet('media/zombie.png', 16, 16),
            size:{x:8, y:14},
            offset:{x:4, y:2},
            maxVel:{x:100, y:100},
            flip:false,

            friction: {x: 150, 7: 0},
            speed: 14,

            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            init:function (x, y, settings) {
                this.parent(x, y, settings);
                this.addAnim('walk', .07, [0, 1, 2, 3, 4, 5]);
            },

            update:function () {
                // here we check if we're going to fall, we want to turn around if we're halfway over edge
                if (!ig.game.collisionMap.getTile
                    (
                        // we do so by checking to see if there is a collision tile ahead and below us
                        this.pos.x + // take our current position horizontally in pixels
                            (this.flip ? ((this.size.x / 2) - 1) : this.size.x - ((this.size.x / 2)+1)), /*
                         // if we're flipped (looking left / moving left)
                         // look one tile left of the center point of our body
                         // if we're not flipped (looking / moving right)
                         // look one tile right of the center point of our body (body width - bodywidth / 2)
                         */
                        this.pos.y + this.size.y + 1 // look at the pixel (and tile) right below our feet
                    ) // end of the getTile parameter list
                ){
                    this.flip = !this.flip; // if there is no collision tile, we're going to fall, turn around
                }
                var xdir = this.flip ? -1 : 1; /*
                // set a multiplier [xdir] to determine our horizontal direction
                // if we're flipped, we want negative speed, otherwise positive
                */
                this.vel.x = this.speed * xdir; // set our speed
                this.currentAnim.flip.x = this.flip; // ***** not sure what this does?
                this.parent();
            },

            handleMovementTrace: function (res) {
                this.parent (res);
                if (res.collision.x) {
                    this.flip = !this.flip;
                }
            },

            check: function( other ) {
                other.receiveDamage( 10, this);
            },

            kill:function () {
                // OVERRIDE DEFAULT FUNCTION
                this.parent();  // call parent method to execute kill logic
                ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y,
                    {
                        colorOffset:1,
                        callBack:function () {
                            var loc = ig.game.getRandomSpawnLocation();
                            ig.game.spawnEntity(EntityZombie, loc.x, loc.y);
                            // ig.game.spawnEntity(EntityZombie, 52, 102);
                        }
                    }
                );
            }

        });
    }
);