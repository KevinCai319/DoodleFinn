import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";
import Tutorial from "./Tutorial";

export default class Level1 extends GameLevel {
    LEVEL_NAME:string ="Level_1"
    LEVEL_TILESET:string = "Level_1"
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/"+this.LEVEL_NAME+"/"+this.LEVEL_TILESET+".json");
        this.load.spritesheet("player", "game_assets/spritesheets/DoodleFinn/DoodleFinn-Sprite.json");
        this.load.spritesheet("gun_enemy", "game_assets/spritesheets/gun_enemy.json");
        this.load.spritesheet("pink_paper", "game_assets/spritesheets/pink_paper.json");
        this.load.spritesheet("white_paper", "game_assets/spritesheets/white_paper.json");
        this.load.spritesheet("cursor", "game_assets/spritesheets/cursor.json");
        this.load.image("heart", "game_assets/spritesheets/Full_Heart.png");
        this.load.image("half_heart", "game_assets/spritesheets/Half_Heart.png");
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
        this.playerSpawnColRow = new Vec2(7,40)
        // Do generic setup for a GameLevel
        super.startScene();
        
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}