import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../Wolfie2D/Debug/Debug";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import DynamicTilemap from "../../Wolfie2D/Nodes/Tilemaps/DynamicMap";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import GameLevel from "./Game";

export default class Level1 extends GameLevel {
    
    // HOMEWORK 5 - TODO
    /**
     * Add your balloon pop sound here and use it throughout the code
     */
    loadScene(): void {
        // Load resources
        // this.load.tilemap("level1", "game_assets/tilemaps/level1.json");
        this.load.tilemap("level1", "game_assets/tilemaps/DF-Level1.json");
        this.load.spritesheet("player", "game_assets/spritesheets/spike.json");
        this.load.spritesheet("red", "game_assets/spritesheets/redBalloon.json");
        this.load.spritesheet("blue", "game_assets/spritesheets/blueBalloon.json");
        this.load.spritesheet("gun_enemy", "game_assets/spritesheets/gun_enemy.json");

        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/enemy.json");
    }

    // HOMEWORK 5 - TODO
    /**
     * Decide which resource to keep and which to cull.
     * 
     * Check out the resource manager class.
     * 
     * Figure out how to save resources from being unloaded, and save the ones that are needed
     * for level 2.
     * 
     * This will let us cut down on load time for the game (although there is admittedly
     * not a lot of load time for such a small project).
     */
    unloadScene(){
        // Keep resources - this is up to you
        this.load.keepSpritesheet("red");
        this.load.keepSpritesheet("blue");
        this.load.keepSpritesheet("player");
    }

    startScene(): void {
        // Add the level 1 tilemap
        this.initLevelGeometry("level1");
        
        // this.dynamicMap.badNavMesh();
        
        this.viewport.setBounds(0, 0, 64*32, 20*32);

        this.playerSpawn = new Vec2(5*32, 14*32);


        // Do generic setup for a GameLevel
        super.startScene();

        this.addLevelEnd(new Vec2(60, 13), new Vec2(5, 5));

    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}