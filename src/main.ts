import Game from "./Wolfie2D/Loop/Game";
import Splash from "./DoodleDungeon/Scenes/Splash";
import Vec2 from "./Wolfie2D/DataTypes/Vec2";
import GameLevel from "./DoodleDungeon/Scenes/Game";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main(){
    // Run any tests
    runTests();
    // Find resolution of the window.
    const resolution = new Vec2(window.screen.width * window.devicePixelRatio , window.screen.height * window.devicePixelRatio);
    const CANVAS_SCALE = 0.65;
    // console.log(resolution.x*CANVAS_SCALE*9/16);
    // console.log(GameLevel.DEFAULT_LEVEL_TILE_SIZE.y*20);
    // const tile_height = (resolution.x*CANVAS_SCALE*9/16)/(GameLevel.DEFAULT_LEVEL_TILE_SIZE.y*20);
    // GameLevel.DEFAULT_LEVEL_TILE_SIZE.scale(tile_height);

    // Set up options for our game
    let options = {
        canvasSize: {x: resolution.x*CANVAS_SCALE, y: resolution.x*CANVAS_SCALE*9/16},          // The size of the game
        clearColor: {r: 34, g: 32, b: 52},   // The color the game clears to
        inputs: [
            {name: "left", keys: ["a"]},
            {name: "right", keys: ["d"]},
            {name: "up", keys: ["w"]},
            {name: "jump", keys: ["w"]},
            {name: "space", keys: [" "]},
            {name: "e", keys: ["e"]},
            {name: "down", keys: ["s"]},
            {name: "run", keys: ["shift"]}
        ],
        useWebGL: false,                        // Tell the game we want to use webgl
        showDebug: false                       // Whether to show debug messages. You can change this to true if you want
    }

    // Create a game with the options specified
    const game = new Game(options);

    // Start our game
    game.start(Splash, {});
})();

function runTests(){};