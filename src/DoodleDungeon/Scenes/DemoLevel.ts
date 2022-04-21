//Level to have the player understand how the game works.
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
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
        this.load.spritesheet("melee_enemy", "game_assets/spritesheets/FlyEnemy/FlyEnemy.json")
        this.load.spritesheet("charging_enemy", "game_assets/spritesheets/ChargeEnemy/ChargeEnemy.json")
        
        this.load.spritesheet("pink_paper", "game_assets/spritesheets/pink_paper.json");
        this.load.spritesheet("white_paper", "game_assets/spritesheets/white_paper.json");
        this.load.spritesheet("cursor", "game_assets/spritesheets/cursor.json");
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
        // Do generic setup for a GameLevel
        super.startScene();
        
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}