ig.module(
    'game.entities.player' // define name space and class which is also full file path
)
    .requires(
    'impact.entity' // we extend (and therefore require) the impact 'entity' class
)
    .defines(
    function () {
        // define a new class 'EntityPlayer' of type 'Entity'
        EntityPlayer = ig.Entity.extend({

            startPosition:null, // used to maintain our starting position for respawn

            // SETUP GRAPHICS
            animSheet:new ig.AnimationSheet('media/player.png', 16, 16), /*
         // this says we will use the media/player.png as the
         // sprite sheet for this entity subclass's animation
         // and the tile size is 16 x 16
         */
            size:{x:8, y:14}, // defines the actual size of the player
            offset:{x:4, y:2}, /*
         // defines offsets in actual entity size vs tile size
         // x:4 means our character's left armor is 4 pixels from the left of the tile
         // y:2 means our character's head is 2 pixels below the top of the tile
         // if offset wasn't set, we would sink into the right wall and floor
         */
            flip:false, // defines the default direction the character faces

            // PHYSICS
            maxVel:{x:100, y:150}, // max speed we can reach in either direction
            friction:{x:600, y:0}, // how fast we slow down?
            accelGround:400, // how fast we accelerate towards max speed horizontally
            accelAir:200, // how fast vertically
            jump:200, // how high we jump?

            // COLLISION
            type:ig.Entity.TYPE.A,
            checkAgainst:ig.Entity.TYPE.NONE,
            collides:ig.Entity.COLLIDES.ACTIVE,

            // WEAPONS
            weapon:0,
            totalWeapons:2,
            activeWeapon:"EntityBullet",

            // INVINCIBILITY
            invincible:true,
            invincibleDelay:2,
            invincibleTimer:null,


            init:function (x, y, settings) {
                // OVERRIDE DEFAULT FUNCTION
                /*
                 // this is called once @ game start
                 // passed starting position of entity (x, y)
                 // passed custom settings
                 */
                this.parent(x, y, settings); // do everything our base class does during init
                this.setupAnimation(this.weapon); // setup animation sequences
                this.startPosition = {x:x, y:x}; // set our starting position for respawn
                this.invincibleTimer = new ig.Timer(); // start spawn invincibility timer
                this.makeInvincible(); // make us invincible
            },

            setupAnimation:function (weaponNum) {
                /*
                 // called to setup animation sequence
                 // passed a number associated with the weapon equipped
                 // uses the weapon number as a way to 'tab' to ...
                 // ... the set of frames associated with that weapon equipped
                 // it adds a set of animation definitions
                 // each set contains an ID (ref), duration, and array of frames
                 // frames are those defined in the object's global animSheet var
                 */
                offset = weaponNum * 10; // how far we should offset to get the next set of frames
                this.addAnim('idle', 1, [0 + offset]);
                this.addAnim('run', 0.07, [0 + offset, 1 + offset, 2 + offset, 3 + offset, 4 + offset, 5 + offset]);
                this.addAnim('jump', 1, [9 + offset]);
                this.addAnim('fall', 0.4, [6 + offset, 7 + offset]);
            },

            update:function () {
                // OVERRIDE DEFAULT FUNCTION
                /*
                 // called every frame (tick)
                 */
                var accel = this.standing ? this.accelGround : this.accelAir; /*
                 // check if i'm standing and set my speed
                 // if i'm standing, use accelGround, otherwise accelAir
                 */

                // HANDLE MOVEMENT
                if (ig.input.state('left')) {
                    /*
                    // if we're moving left, set our horizontal acceleration
                    // acceleration value is based on moving right, so make it negative
                    // moving left is also the 'other' way, so flip the sprite
                    */
                    this.accel.x = -accel;
                    this.flip = true;
                }
                else if (ig.input.state('right')) {
                    // now set moving right
                    this.accel.x = accel;
                    this.flip = false;
                }
                else {
                    // if we're not moving right or left, we're not moving :)
                    this.accel.x = 0;
                }

                // HANDLE JUMPING
                if (this.standing && ig.input.pressed('jump')) {
                    this.vel.y = -this.jump;
                }

                // SELECT PROPER ANIMATION FRAME
                if (this.vel.y < 0) {
                    // we're jumping up
                    this.currentAnim = this.anims.jump;
                }
                else if (this.vel.y > 0) {
                    // we're running
                    this.currentAnim = this.anims.fall;
                }
                else if (this.vel.x != 0) {
                    // we're falling
                    this.currentAnim = this.anims.run;
                }
                else {
                    // we're not moving so we're idle
                    this.currentAnim = this.anims.idle;
                }
                this.currentAnim.flip.x = this.flip; // not sure what this is

                // HANDLE WEAPON SWITCH
                if (ig.input.pressed('switch')) {
                    this.weapon++; // switch to next weapon
                    if (this.weapon >= this.totalWeapons) {
                        this.weapon = 0; // last weapon, move to first weapon
                    }
                    switch (this.weapon) {
                        case(0):
                            this.activeWeapon = "EntityBullet";
                            break;
                        case(1):
                            this.activeWeapon = "EntityGrenade";
                            break;
                    }
                    this.setupAnimation(this.weapon); // change sprites used based on weapon
                }

                // HANDLE WEAPON FIRE
                if (ig.input.pressed('shoot')) {
                    ig.game.spawnEntity(
                        this.activeWeapon, // what to spawn (bullet, grenade, etc..)
                        this.pos.x, // where to spawn it
                        this.pos.y, // ..
                        {
                            flip:this.flip // what direction it should be pointing
                        }
                    );
                }

                // CHECK INVIS TIMER
                if (this.invincibleTimer.delta() > this.invincibleDelay) {
                    this.invincible = false; // make us vulnerable
                    this.currentAnim.alpha = 1; // make us fully visible
                }

                this.parent(); // finally, call parent method to finish update work
            },

            kill:function () {
                // OVERRIDE DEFAULT FUNCTION
                this.parent();  // call parent method to execute kill logic
                var x = this.startPosition.x;
                var y = this.startPosition.y;
                ig.game.spawnEntity
                    (
                        EntityDeathExplosion, this.pos.x, this.pos.y,
                        {
                            // spawn an explosion
                            // settings now include a definition for the callBack function
                            callBack: function() {
                                ig.game.spawnEntity(EntityPlayer,x,y); // spawn the player on callback
                            }
                        }

                    );
                // ig.game.spawnEntity(EntityPlayer, this.startPosition.x, this.startPosition.y); // respawn
            },

            makeInvincible:function () {
                this.invincible = true;
                this.invincibleTimer.reset();
            },

            receiveDamage:function (amount, from) {
                // OVERRIDE DEFAULT FUNCTION
                if (this.invincible) { return; } // if we're invincile, we don't take damage
                this.parent(amount, from); // not invincible, go ahead and damage us
            },

            draw:function () {
                // OVERRIDE DEFAULT FUNCTION
                if (this.invincible) {
                    // if we've invincible, slowly make us more visible over time
                    this.currentAnim.alpha = this.invincibleTimer.delta() / this.invincibleDelay * 1;
                }
                this.parent();
            }

    });

        EntityBullet = ig.Entity.extend({

            size:{x:5, y:3},
            animSheet:new ig.AnimationSheet('media/bullet.png', 5, 3),
            maxVel:{x:200, y:0},

            type:ig.Entity.TYPE.NONE,
            checkAgainst:ig.Entity.TYPE.B,
            collides:ig.Entity.COLLIDES.PASSIVE,

            init:function (x, y, settings) {
                // consume flip (to determine facing direction) from settings
                // apply offset so that bullet starts near our gun and pass to parent
                this.parent(x + (settings.flip ? -4 : 8), y + 8, settings);
                // set the velocity of the bullet based on the direction of the parent settings
                // bullet doesnt accelerate once it leaves the gun - it's at max speed
                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                // define the animation frames (in this case just one set w/ only one frame)
                this.addAnim('idle', 0.2, [0]);
            },

            // checks to see if we collide with something and kills the object (removes it)
            handleMovementTrace:function (res) {
                this.parent(res);
                if (res.collision.x || res.collision.y) {
                    this.kill();
                }
            },

            check:function (other) {
                other.receiveDamage(3, this);
                this.kill();
            }

    });

        EntityGrenade = ig.Entity.extend({

            size:{x:4, y:4},
            offset:{x:2, y:2},
            animSheet:new ig.AnimationSheet('media/grenade.png', 8, 8),

            type:ig.Entity.TYPE.NONE, // non-typed
            checkAgainst:ig.Entity.TYPE.BOTH, // check against everything
            collides:ig.Entity.COLLIDES.PASSIVE, // don't move anything you hit

            maxVel:{x:200, y:200},
            bounciness:0.6,
            bounceCounter:0,

            init:function (x, y, settings) {
                this.parent(x + (settings.flip ? -4 : 7), y, settings);
                this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                this.vel.y = -(50 + (Math.random() * 100)); // this adds a random arc to the grenade
                this.addAnim('idle', 0.2, [0, 1]);
            },

            handleMovementTrace:function (res) {
                this.parent(res);
                if (res.collision.x || res.collision.y) {
                    // only bounce 3 times
                    this.bounceCounter++;
                    if (this.bounceCounter > 3) {
                        this.kill();
                    }
                }
            },

            check:function (other) {
                other.receiveDamage(10, this);
                this.kill();
            }

        });

        EntityDeathExplosion = ig.Entity.extend({
            lifetime: 1,
            callBack: null,
            particles: 25,
            init: function(x,y,settings) {
                this.parent(x,y,settings); // settings may define the callback
                for (var i=0; i < this.particles; i++) {
                    // spawn every particle, offsetting color depending on blood color
                    ig.game.spawnEntity(
                        EntityDeathExplosionParticle,x,y,
                        {
                            colorOffset: settings.colorOffset ?
                                settings.colorOffset : 0
                        }
                    );
                    // this.idleTimer = new ig.Timer();
                }
                this.idleTimer = new ig.Timer(); // new timer to keep track of time since init
            },

            update: function() {
                // ****** Where is the call to this.parent() ?
                if(this.idleTimer.delta() > this.lifetime) {
                    this.kill(); // if the explosion is beyond it's lifetime, kill it
                    if(this.callBack) { this.callBack(); } // if there is a callback, call it
                    return;
                }
            }
        });

        EntityDeathExplosionParticle = ig.Entity.extend({
            size: {x:2, y:2},
            maxVel: {x: 160, y:200},
            lifetime: 2,
            fadetime: 1, // fade to invis
            bounciness: 0, // blood doesn't bounce
            vel: {x: 100, y:30},
            friction: {x:100, y: 0},
            collides: ig.Entity.COLLIDES.LITE,
            colorOffset: 0,
            totalColors: 7,
            animSheet: new ig.AnimationSheet('media/blood.png',2,2),
            posLastDraw: null,

            init: function(x,y,settings) {
                this.parent(x,y,settings);
                var frameID = Math.round(Math.random()*this.totalColors) +
                    (this.colorOffset * (this.totalColors+1));
                this.addAnim('idle',0.2,[frameID]); // assigns a random color to the particle
                // the below ensures that each particle shoots off in a random direction
                this.vel.x = (Math.random() * 2 - 1) * this.vel.x; // random hor speed from -1 to 1 * vel
                this.vel.y = (Math.random() * 2 - 1) * this.vel.y; // random ver speed form -1 to 1 * vel
                this.idleTimer = new ig.Timer(); // start it's life timer
            },

            update: function() {
                if(this.idleTimer.delta() > this.lifetime) {
                    this.kill();
                    return;
                }
                // slowly fade the particle to invis
                this.currentAnim.alpha = this.idleTimer.delta().map(
                    this.lifetime - this.fadetime, this.lifetime,
                    1,0
                ); // not sure what this does ...
                this.parent();
            },

            draw: function() {
                /*
                if(this.posLastDraw) {
                    if(this.posLastDraw === this.pos) {
                        var foo = "I didn't move";
                    }
                } */
                this.parent();
                // this.posLastDraw = this.pos;
            }
        });

        EntityGrenadeParticle = ig.Entity.extend({
            size: {x: 1, y:1},
            maxVel: {x:160,y:200},
            lifetime: 1,
            fadetime: 1,
            bounciness: 0.3,
            vel: {x:40, y:50},
            friction: {x:20, y:20},
            checkAgainst: ig.Entity.TYPE.B,
            collides: ig.Entity.COLLIDES.LITE,
            animSheet: new ig.AnimationSheet('media/explosion.png',1,1),

            init: function(x,y,settings) {
                this.parent(x,y,settings);
                this.vel.x = (Math.random() * 4 - 1) * this.vel.x;
                this.vel.y = (Math.random() * 10 - 1) * this.vel.y; // explodes UP
                this.idleTimer = new ig.Timer();
                var frameID = Math.round(Math.random()*7);
                this.addAnim('idle',0.2, [frameID]);
            },

            update: function() {
                if(this.idleTimer.delta() > this.lifetime) {
                    this.kill();
                    return;
                }
                this.currentAnim.alpha = this.idleTimer.delta().map(
                    this.lifetime - this.fadetime, this.lifetime, 1, 0
                );
                this.parent();
            }
        });
    }
);
