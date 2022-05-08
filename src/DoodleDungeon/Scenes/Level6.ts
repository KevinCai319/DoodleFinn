import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";
import Home from "./Home";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";
import BulletAI from "../Enemies/BulletAI";

export default class Level6 extends GameLevel {
    LEVEL_NAME: string = "Level_6"
    LEVEL_TILESET: string = "Level_6"
    //Object pool for bullets.
    bullets:Array<AnimatedSprite> = []
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/" + this.LEVEL_NAME + "/" + this.LEVEL_TILESET + ".json");
        super.loadScene(true);
        this.load.spritesheet("bullet","game_assets/spritesheets/bullet.json");
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
        if (Home.LevelsUnlocked == 3) {
            Home.LevelsUnlocked += 1;
        }
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level_music"});
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = null
        this.home = Home
        this.playerSpawnColRow = new Vec2(3, 43)
        // Do generic setup for a GameLevel
        super.startScene();
        //Create object pool for bullets.
        this.bullets = []
        for (let i = 0; i < 100; i++) {
            let bullet = this.add.animatedSprite("bullet", "primary");
            bullet.position.copy(Vec2.ZERO);
            bullet.scale = GameLevel.LEVEL_SCALING.clone().scale(0.1);
            bullet.animation.playIfNotAlready("shoot", true);
            bullet.visible = false;
            bullet.addAI(BulletAI, {});
            this.bullets.push(bullet);
        }

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level_music", loop: true, holdReference: true});
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }

    spawnBullet(x: number, y: number,direction:Vec2): void {
        let bullet: AnimatedSprite = null;

		for(let b of this.bullets){
			if(!b.visible){
				// We found a dead rock
				bullet = b;
				break;
			}
		}

		if(bullet !== null){
			// Bring this rock to life
			bullet.visible = true;
			// Loop on position until we're clear of the player
			bullet.position = new Vec2(x, y);
			bullet.setAIActive(true, {direction: direction});
		}

    }
}