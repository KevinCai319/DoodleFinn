import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";

export default class Level1 extends GameLevel {
    LEVEL_NAME:string ="DFLevel1"
    LEVEL_TILESET:string = "DF_Rev1"
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/"+this.LEVEL_TILESET+".json");
        this.load.spritesheet("player", "game_assets/spritesheets/spike.json");
        this.load.spritesheet("gun_enemy", "game_assets/spritesheets/gun_enemy.json");
        this.load.spritesheet("pink_paper", "game_assets/spritesheets/pink_paper.json");
        this.load.spritesheet("white_paper", "game_assets/spritesheets/white_paper.json");
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/enemy.json");
    }

    // DoodleFinn TODO
    /**
     * If you are moving to another level.
     * To keep: 
     *  Spritesheets for the player, enemies, and items.
     *  SFX and music.
     * Do not keep anything if going back to main menu.
     * 
     */
    unloadScene(){
        // Keep resources - this is up to you
        this.load.keepSpritesheet("player");
        
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = null
        this.playerSpawnColRow = new Vec2(7,43)
        // Do generic setup for a GameLevel
        super.startScene();
        
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}