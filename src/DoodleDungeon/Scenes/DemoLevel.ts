//Level to have the player understand how the game works.
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Layer from "../../Wolfie2D/Scene/Layer";
import PlayerController, { PlayerType } from "../Player/PlayerController";
import GameLevel from "./Game";
import Home from "./Home";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class DemoLevel extends GameLevel {
    LEVEL_NAME:string ="DemoLevel"
    LEVEL_TILESET:string = "DemoLevel"
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/"+this.LEVEL_NAME+"/"+this.LEVEL_TILESET+".json");
        this.load.spritesheet("player", "game_assets/spritesheets/DoodleFinn/DoodleFinn-Sprite.json");
        this.load.spritesheet("melee_enemy", "game_assets/spritesheets/FlyEnemy/FlyEnemy.json")
        this.load.spritesheet("charging_enemy", "game_assets/spritesheets/ChargeEnemy/ChargeEnemy.json")
        
        this.load.spritesheet("pink_paper", "game_assets/spritesheets/pink_paper.json");
        this.load.spritesheet("white_paper", "game_assets/spritesheets/white_paper.json");
        this.load.spritesheet("cursor", "game_assets/spritesheets/cursor.json");
        this.load.image("heart", "game_assets/spritesheets/Full_Heart.png");
        this.load.image("half_heart", "game_assets/spritesheets/Half_Heart.png");
        //Load in special instructions.
        this.load.image("InstErase", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Erase.png");
        this.load.image("InstAttack", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Attack.png");
        this.load.image("InstEraseText", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Erase-Text.png");
        this.load.image("InstDraw", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Draw.png");
        this.load.image("InstMove", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Move.png");
        this.load.image("InstDrawText", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Draw-Text.png");
        this.load.image("InstPaper", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Paper.png");
        this.load.image("InstEndLevel", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-NextLevel.png");
        this.load.image("InstEnd", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-End.png");
        this.load.image("InstAttack2", "game_assets/spritesheets/TutorialAssets/Instruction/Instruction-Attack2.png");
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/"+this.LEVEL_NAME+"/enemy.json");

        this.load.audio("level_music", "game_assets/music/doodlefinn_level_music.wav")

        this.load.audio("player_hit_enemy", "game_assets/sounds/coin.wav")
        this.load.audio("jump", "game_assets/sounds/coin.wav")

        this.load.audio("player_death", "game_assets/sounds/coin.wav")
        this.load.audio("player_hurt", "game_assets/sounds/coin.wav")
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
        if(this.gameEnd){
            let time = this.levelTimer.getTimeElapsed()/1000;
            Home.bestTimes[0] = Math.min(Home.bestTimes[0],time);
            if(Home.bestTimes[0] == -1)Home.bestTimes[0] = time;
            if(Home.LevelsUnlocked == 1){
                Home.LevelsUnlocked+=1;
            }
        }
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level_music"});
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = null
        this.home = Home
        this.playerSpawnColRow = new Vec2(2,47)
        // Add in special graphics.
        this.backgroundSetup.push((layer:Layer)=>{
            this.addLevelBackgroundImage("InstAttack",layer.getName(),new Vec2(12,23).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.43,0.43));
            this.addLevelBackgroundImage("InstAttack2",layer.getName(),new Vec2(12,20).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(4,4));
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

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level_music", loop: true, holdReference: true});

        // Cheats.
        // (<PlayerController>this.player._ai).playerType = PlayerType.TOPDOWN;
        
    }

    // updateScene(deltaT: number): void {
    //     super.updateScene(deltaT);
    // }
}