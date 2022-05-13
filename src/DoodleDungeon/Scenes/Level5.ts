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
import Level6 from "./Level6";

export default class Level5 extends GameLevel {
    LEVEL_NAME: string = "Level_5"
    LEVEL_TILESET: string = "Level_5"
    orig_cheat:boolean = false;
    percentFilled:Label =null;

    loadScene(): void {
        this.orig_cheat = Home.unlimitedPlacementCheats;
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/" + this.LEVEL_NAME + "/" + this.LEVEL_TILESET + ".json");
        this.load.image("Level5Instr", "game_assets/spritesheets/Level5-Instruction.png");
        super.loadScene(true);
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/" + this.LEVEL_NAME + "/enemy.json");
        this.load.image("art", "game_assets/spritesheets/LevelEnd/Congratulations/Level5_EndArt.png");
        this.load.image("pauseArt", "game_assets/spritesheets/Level_Layout/Level_5.png")
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
            Home.bestTimes[6] = Math.min(Home.bestTimes[6], time);
            if (Home.bestTimes[6] == -1) Home.bestTimes[6] = time;
        }
        if (Home.LevelsUnlocked == 7) {
            Home.LevelsUnlocked += 1;
        }
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "level_music" });
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = Level6;
        this.home = Home
        this.playerSpawnColRow = new Vec2(3, 30);

        //Unlimited drawing
        Home.unlimitedPlacementCheats = true;

        //Change win condition (will only win if all paper is collected)
        this.paperRequired = false;
        // Do generic setup for a GameLevel
        super.startScene();

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "level_music", loop: true, holdReference: true });
        this.papersCountLabel.visible=false;
        this.percentFilled = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: new Vec2(120, 60), text: "Find some paper!" });
        this.percentFilled.textColor = Color.RED;
        this.percentFilled.backgroundColor = new Color(32, 32, 32, 0.5);
        this.percentFilled.font = "PixelSimple";
        this.checkDrawing();
        let instr = this.addLevelBackgroundImage("Level5Instr","primary",new Vec2(6,27).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1))
        
        instr.alpha=0.5;
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT); 
        this.percentFilled.visible = !(this.paused || this.gameEnd);
    }

    
    //Test if the player's drawing matches the outline
    checkDrawing():boolean{
        let result = super.checkDrawing();
        //update label.
        this.percentFilled.text = "Image Drawn:"+ this.tile_drawn_count + "/" + this.tile_total_count;
        return result;
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