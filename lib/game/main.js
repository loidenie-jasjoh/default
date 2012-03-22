// defines the namespace of the game
// defines the name of your main class
// defines the file name of the module (/game/main.js)
ig.module(
    'game.main'
)
    // defines which classes this class (the game) requires
    // retrieves them from (/impact/game.js) and (/impact/font.js)
    .requires(
    'impact.game',
    'impact.font', // used to instantiate the font used for onscreen text
    'game.levels.dorm1'
)
    // defines the core game logic
    .defines(function () {

        // extend the basic game class to a new class called MyGame
        // later we can instantiate this class var g = new MyGame();
        MyGame = ig.Game.extend({

            gravity: 300,

            //S define a field for MyGame called 'font'
            //S set the value to a new ig.Font object
            //S font:new ig.Font('media/04b03.font.png'),


            init:function () {
                // Initialize your game here; bind keys etc.

                // bind the key press events to the desired key
                // binding dont using the 'input' class
                ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
                ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
                ig.input.bind(ig.KEY.X, 'jump');
                ig.input.bind(ig.KEY.C, 'shoot');
                ig.input.bind(ig.KEY.TAB, 'switch');

                // load the level specified
                this.loadLevel(LevelDorm1);
            },

            update:function () {
                // Update all entities and backgroundMaps
                this.parent();

                // Add your own, additional update code here
            },

            draw:function () {
                // Draw all entities and backgroundMaps
                this.parent();


                // Add your own drawing code here

                //S get the current center point
                //S var x = ig.system.width / 2,
                //S y = ig.system.height / 2;

                //S draw the font
                //S this.font.draw('It Works!', x, y, ig.Font.ALIGN.CENTER);
            }
        });

        // ig.main() starts a game
        // it takes a reference to the canvas ID, game object, fps, screen res, and scaling
        // Start the Game with 60fps, a resolution of 320x240, scaled
        // up by a factor of 2
        ig.main('#canvas', MyGame, 60, 320, 240, 2);

    });
