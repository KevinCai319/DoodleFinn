import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";
import Home from "./Home";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";
import BulletAI from "../Enemies/BulletAI";
import Layer from "../../Wolfie2D/Scene/Layer";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Timer from "../../Wolfie2D/Timing/Timer";
import { Game_Events } from "../Events";
import PlayerController from "../Player/PlayerController";

export default class Level6 extends GameLevel {
    LEVEL_NAME: string = "Level_6"
    LEVEL_TILESET: string = "Level_6"
    //Object pool for bullets.
    bullets:Array<AnimatedSprite> = []
    turrets:Array<Vec2> = []
    bulletSpawnTimer: Timer= new Timer(0.5)
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/" + this.LEVEL_NAME + "/" + this.LEVEL_TILESET + ".json");
        super.loadScene(true);
        this.load.spritesheet("bullet","game_assets/spritesheets/bullet.json");
        this.load.image("turret","game_assets/spritesheets/turret.png");
        this.load.audio("bullet_shot","game_assets/sounds/bullet.wav");
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
        this.playerSpawnColRow = new Vec2(1, 197)




        this.turrets = [
            new Vec2(1,185),
            new Vec2(26,182),
            new Vec2(39,176),
            new Vec2(23,164),
            // new Vec2(0,185),
            // new Vec2(0,185),
            // new Vec2(0,185),
            // new Vec2(0,185),
            // new Vec2(0,185),
            // new Vec2(0,185),
        ]
        this.backgroundSetup.push((layer:Layer)=>{
            for(let t of this.turrets){
                let turret = this.addLevelBackgroundImage("turret",layer.getName(),t.mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.5,0.5))
                //add AABB to turret
                turret.addPhysics(new AABB(Vec2.ZERO, turret.boundary.getHalfSize()));
            }
        });
        // Do generic setup for a GameLevel
        super.startScene();
        //Create object pool for bullets.
        this.bullets = []
        for (let i = 0; i < 100; i++) {
            let bullet = this.add.animatedSprite("bullet", "primary");
            bullet.position.copy(Vec2.ZERO);
            bullet.scale = GameLevel.LEVEL_SCALING.clone().scale(1.5);
            bullet.animation.playIfNotAlready("shoot", true);
            bullet.addPhysics(bullet.boundary,Vec2.ZERO,true,false);
            bullet.setGroup("enemy");
            bullet.visible = false;
            bullet.addAI(BulletAI, {owner:bullet,player: this.player});
            bullet.setTrigger("balloon",Game_Events.PLAYER_BALLOON_POPPED,null);
            this.bullets.push(bullet);
        }
        //for every single turret, 
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level_music", loop: true, holdReference: true});
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
        
        //Spawn bullets
        for(let t of this.turrets){

            if(this.bulletSpawnTimer.isStopped() && Math.random()>0.99){
                //get angle between turret and player
                let angle = t.dirTo(this.player.position);
                //set magnitude to 200.
                let spawnPoint = t.clone().add(angle.scaleTo(50));
                //check if point is within the viewport
                if(this.viewport.getView().containsPoint(spawnPoint)){
                    //get a bullet from the pool
                    //shoot the bullet
                    this.spawnBullet(spawnPoint.x,spawnPoint.y,angle);
                    this.emitter.fireEvent(GameEventType.PLAY_SFX, {key: "bullet_shot"});
                }
            }
        }
        if(this.bulletSpawnTimer.isStopped()){
            this.bulletSpawnTimer.start();
        }
    
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
            //set rotation of bullet
            bullet.rotation = -direction.angleToCCW(Vec2.RIGHT);
            bullet.setAIActive(true, {direction: direction});
		}

    }
}