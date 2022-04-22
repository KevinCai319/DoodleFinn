import Game from "./Wolfie2D/Loop/Game";
import MainMenu from "./DoodleDungeon/Scenes/Title";
import Splash from "./DoodleDungeon/Scenes/Splash";
import Title from "./DoodleDungeon/Scenes/Title";
import Home from "./DoodleDungeon/Scenes/Home";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main(){
    // Run any tests
    runTests();

    // Set up options for our game
    let options = {
        canvasSize: {x: 1200, y: 800},          // The size of the game
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