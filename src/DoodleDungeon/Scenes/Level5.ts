import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";
import Home from "./Home";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Layer from "../../Wolfie2D/Scene/Layer";
import DynamicTilemap from "../../Wolfie2D/Nodes/Tilemaps/DynamicMap";
import { AI_Statuses, Game_Collectables, Game_Events, Tileset_Names } from "../Events";
import Game from "../../Wolfie2D/Loop/Game";

export default class Level5 extends GameLevel {
    LEVEL_NAME: string = "Level_5"
    LEVEL_TILESET: string = "Level_5"

    DRAWING_LAYER: DynamicTilemap
    OUTLINE_LAYER: DynamicTilemap
    REQUIRED_TILES: Array<Vec2> = [];

    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/" + this.LEVEL_NAME + "/" + this.LEVEL_TILESET + ".json");
        super.loadScene(true);
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/" + this.LEVEL_NAME + "/enemy.json");
    }

    // DoodleFinn TODO
    /**
     * If you are moving to another level.
     * To keep: 
     *  Spritesheets for the player, enemies, and items.
     *  SFX and music.
     */
    unloadScene() {
        // Keep resources - this is up to you
        super.unloadCommon();
        if (this.gameEnd) {
            let time = this.levelTimer.getTimeElapsed() / 1000;
            Home.bestTimes[1] = Math.min(Home.bestTimes[1], time);
            if (Home.bestTimes[1] == -1) Home.bestTimes[1] = time;
        }
        if (Home.LevelsUnlocked == 4) {
            Home.LevelsUnlocked += 1;
        }
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "level_music" });
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = null
        this.home = Home
        this.playerSpawnColRow = new Vec2(3, 30);

        //Unlimited drawing
        Home.unlimitedPlacementCheats = true;

        //Change win condition (will only win if all paper is collected)
        GameLevel.paperRequired = false;

        

        // Do generic setup for a GameLevel
        super.startScene();

        //Get tilelayers for checking the drawing
        this.setUpTileCheck();

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "level_music", loop: true, holdReference: true });
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);

        if(this.checkDrawing() == true){
            Home.unlimitedPlacementCheats = false;

            GameLevel.otherWinCondition = true;
        }

    }

    setUpTileCheck() {
        //Get layers for checking the drawing
        let tilemapLayers = this.tilemaps;
        console.log(tilemapLayers);

        for (let i = 0; i < tilemapLayers.length; i += 1) {
            let name = tilemapLayers[i].name;
            if (name == "Foreground") {
                this.OUTLINE_LAYER = <DynamicTilemap>tilemapLayers[i]
            } else if (name == "Platforms") {
                this.DRAWING_LAYER = <DynamicTilemap>tilemapLayers[i]
            }
        }
        console.log(this.OUTLINE_LAYER);
        console.log(this.DRAWING_LAYER);

        let dimensions = this.OUTLINE_LAYER.getDimensions();

        for (var x = 0; x < dimensions.x; x++) {
            for (var y = 0; y < dimensions.y; y++) {
                //Check if the current tile is an outline tile
                let outline_tile = this.OUTLINE_LAYER.getTileAtRowCol(new Vec2(x, y));
                if (outline_tile == 0) continue; //Skip if not
                this.REQUIRED_TILES.push(new Vec2(x, y));
            }
        }
        console.log(dimensions.x * dimensions.y);
        console.log(this.REQUIRED_TILES.length);
    }

    //Test if the player's drawing matches the outline
    checkDrawing() {
        // let finished = false;
        for (let vec of this.REQUIRED_TILES) {
            //If current tile is a outline tile, but the player has not drawn on this tile, stop checking
            let drawing_tile = this.DRAWING_LAYER.getTileAtRowCol(vec);
            // console.log(drawing_tile);
            if (drawing_tile == 0) return false;
        }
        return true;
    }

    // Make sure win doesn't occur (walk on ripped space) until all tiles are drawn
}