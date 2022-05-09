import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";
import Home from "./Home";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Layer from "../../Wolfie2D/Scene/Layer";
import DynamicTilemap from "../../Wolfie2D/Nodes/Tilemaps/DynamicMap";
import { AI_Statuses, Game_Collectables, Game_Events, Tileset_Names } from "../Events";
import Game from "../../Wolfie2D/Loop/Game";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../../Wolfie2D/Utils/Color";
import Level2 from "./Level2";

export default class Level4 extends GameLevel {
    LEVEL_NAME: string = "Level_4"
    LEVEL_TILESET: string = "Level_4"

    DRAWING_LAYER: DynamicTilemap
    OUTLINE_LAYER: DynamicTilemap
    REQUIRED_TILES: Array<Vec2> = [];
    orig_cheat:boolean = false;
    percentFilled:Label =null;

    loadScene(): void {
        this.orig_cheat = Home.unlimitedPlacementCheats;
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/" + this.LEVEL_NAME + "/" + this.LEVEL_TILESET + ".json");
        this.load.image("Level4Instr", "game_assets/spritesheets/Level4-Instruction.png");
        super.loadScene(true);
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/" + this.LEVEL_NAME + "/enemy.json");
        this.load.image("art", "game_assets/spritesheets/LevelEnd/Congratulations/Level4_EndArt.png");
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
            Home.bestTimes[2] = Math.min(Home.bestTimes[2], time);
            if (Home.bestTimes[2] == -1) Home.bestTimes[2] = time;
        }
        if (Home.LevelsUnlocked == 3) {
            Home.LevelsUnlocked += 1;
        }
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "level_music" });
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = Level2;
        this.home = Home
        this.playerSpawnColRow = new Vec2(3, 30);

        //Unlimited drawing
        Home.unlimitedPlacementCheats = true;

        //Change win condition (will only win if all paper is collected)
        this.paperRequired = false;

        

        // Do generic setup for a GameLevel
        super.startScene();

        //Get tilelayers for checking the drawing
        this.setUpTileCheck();

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "level_music", loop: true, holdReference: true });
        this.papersCountLabel.visible=false;

        this.percentFilled = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: new Vec2(120, 60), text: "Find some paper!" });
        this.percentFilled.textColor = Color.RED;
        this.percentFilled.backgroundColor = new Color(32, 32, 32, 0.5);
        this.percentFilled.font = "PixelSimple";
        // GameLevel.otherWinCondition = true;
        // Home.unlimitedPlacementCheats = this.orig_cheat;
        let instr = this.addLevelBackgroundImage("Level4Instr","primary",new Vec2(6,27).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1))
        
        instr.alpha=0.5;
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT); 
        this.otherWinCondition = this.checkDrawing();
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
        let total = 0;
        let count = 0;
        for (let vec of this.REQUIRED_TILES) {
            total += 1;
            //If current tile is a outline tile, but the player has not drawn on this tile, stop checking
            let drawing_tile = this.DRAWING_LAYER.getTileAtRowCol(vec);
            // console.log(drawing_tile);
            if (drawing_tile != 0){
                count += 1;
            }
        }
        //update label.
        this.percentFilled.text = "Image Drawn:"+ count + "/" + total;
        return count == total;
    }
    
    protected goToMenu(): void {
        Home.unlimitedPlacementCheats = this.orig_cheat;
        super.goToMenu();
    }

    show_art(): void {
        this.addLevelBackgroundImage("art","UI",this.viewport.getHalfSize(),new Vec2(3,3),1);
        Home.unlimitedPlacementCheats = this.orig_cheat;
    }
    // Make sure win doesn't occur (walk on ripped space) until all tiles are drawn
}