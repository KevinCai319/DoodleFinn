import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";

export default class Level1 extends GameLevel {
    
    loadScene(): void {
        // Load resources
        console.log("start level1")
        // this.load.tilemap("level1", "game_assets/tilemaps/level1.json");
        this.load.tilemap("DF-Level1", "game_assets/tilemaps/DF-Level1.json");
        this.load.spritesheet("player", "game_assets/spritesheets/spike.json");
        this.load.spritesheet("red", "game_assets/spritesheets/redBalloon.json");
        this.load.spritesheet("blue", "game_assets/spritesheets/blueBalloon.json");
        this.load.spritesheet("gun_enemy", "game_assets/spritesheets/gun_enemy.json");

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
        console.log("start level1")
        // Add the Demo Level.
        
        this.viewport.setBounds(0, 0, 64*GameLevel.DEFAULT_LEVEL_TILE_SIZE.x, 20*GameLevel.DEFAULT_LEVEL_TILE_SIZE.y);
        this.playerSpawn = new Vec2(5*GameLevel.DEFAULT_LEVEL_TILE_SIZE.x, 14*GameLevel.DEFAULT_LEVEL_TILE_SIZE.y);

        // Do generic setup for a GameLevel
        super.startScene();
        this.initLevelGeometry("DF-Level1");
        // TODO: Update Level End location to latest version of the level.
        this.addLevelEnd(new Vec2(14, 1), new Vec2(2, 2));

    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}