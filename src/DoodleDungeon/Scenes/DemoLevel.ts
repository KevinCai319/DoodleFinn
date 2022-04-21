//Level to have the player understand how the game works.
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Layer from "../../Wolfie2D/Scene/Layer";
import PlayerController, { PlayerType } from "../Player/PlayerController";
import GameLevel from "./Game";
import Tutorial from "./Tutorial";

export default class DemoLevel extends GameLevel {
    LEVEL_NAME:string ="DemoLevel"
    LEVEL_TILESET:string = "DemoLevel"
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/"+this.LEVEL_NAME+"/"+this.LEVEL_TILESET+".json");
        this.load.spritesheet("player", "game_assets/spritesheets/DoodleFinn/DoodleFinn-Sprite.json");
        this.load.spritesheet("gun_enemy", "game_assets/spritesheets/gun_enemy.json");
        this.load.spritesheet("pink_paper", "game_assets/spritesheets/pink_paper.json");
        this.load.spritesheet("white_paper", "game_assets/spritesheets/white_paper.json");
        this.load.spritesheet("cursor", "game_assets/spritesheets/cursor.json");
        //Load in special instructions.
        this.load.image("InstErase", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Erase.png");
        this.load.image("InstEraseText", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Erase-Text.png");
        this.load.image("InstDraw", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Draw.png");
        this.load.image("InstMove", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Move.png");
        this.load.image("InstDrawText", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Draw-Text.png");
        this.load.image("InstPaper", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Paper.png");
        this.load.image("InstEndLevel", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-NextLevel.png");
        this.load.image("InstEnd", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-End.png");
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/"+this.LEVEL_NAME+"/enemy.json");


    }

    // DoodleFinn TODO
    /**
     * If you are moving to another level.
     * To keep: 
     *  Spritesheets for the player, enemies, and items.
     *  SFX and music.
     * 
     * 
     */
    unloadScene(){
        // Keep resources - this is up to you
        this.load.keepSpritesheet("player");
        
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = null
        this.tutorial = Tutorial
        this.playerSpawnColRow = new Vec2(2,46)
        // Add in special graphics.
        this.backgroundSetup.push((layer:Layer)=>{
            this.addLevelBackgroundImage("InstErase",layer.getName(),new Vec2(5.55,46.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.43,0.43));
            this.addLevelBackgroundImage("InstEraseText",layer.getName(),new Vec2(8.64,46.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.6,0.6));
            this.addLevelBackgroundImage("InstDraw",layer.getName(),new Vec2(12.65,48.25).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.43,0.43));
            this.addLevelBackgroundImage("InstDrawText",layer.getName(),new Vec2(14.65,46).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.7,0.7));
            this.addLevelBackgroundImage("InstMove",layer.getName(),new Vec2(4,41).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.7,0.7));
            this.addLevelBackgroundImage("InstPaper",layer.getName(),new Vec2(19.25,42).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.6,0.6));
            this.addLevelBackgroundImage("InstEndLevel",layer.getName(),new Vec2(15,33).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.6,0.6));
            this.addLevelBackgroundImage("InstEnd",layer.getName(),new Vec2(26,4).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(4,4));
        })
        // Do generic setup for a GameLevel
        super.startScene();

        // Cheats.
        (<PlayerController>this.player._ai).playerType = PlayerType.TOPDOWN;
        
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}