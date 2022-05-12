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
import PlayerController, { PlayerStates, PlayerType } from "../Player/PlayerController";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Input from "../../Wolfie2D/Input/Input";
import Level3 from "./Level3";

export default class Level5a extends GameLevel {
    LEVEL_NAME: string = "Level_5a"
    LEVEL_TILESET: string = "Level_5a"
    //Object pool for bullets.
    // bullets:Array<AnimatedSprite> = []
    // turrets:Array<Vec2> = []
    // balloon:Sprite = null;
    // balloonPosition:Vec2 = new Vec2(5,196)
    // bulletSpawnTimer: Timer= new Timer(0.5)
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/" + this.LEVEL_NAME + "/" + this.LEVEL_TILESET + ".json");
        super.loadScene(true);
        this.load.spritesheet("bullet","game_assets/spritesheets/bullet.json");
        this.load.image("turret","game_assets/spritesheets/turret.png");
        this.load.image("balloon","game_assets/spritesheets/balloon2.png");
        this.load.image("PressE", "game_assets/spritesheets/TutorialAssets/PressE.png");
        this.load.audio("bullet_shot","game_assets/sounds/bullet.wav");
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/" + this.LEVEL_NAME + "/enemy.json");
        this.load.image("art", "game_assets/spritesheets/LevelEnd/Congratulations/Level5a_EndArt.png");
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
            Home.bestTimes[4] = Math.min(Home.bestTimes[4], time);
            if (Home.bestTimes[4] == -1) Home.bestTimes[4] = time;
        }
        if (Home.LevelsUnlocked == 5) {
            Home.LevelsUnlocked += 1;
        }
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level_music"});
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = Level3
        this.home = Home
        this.playerSpawnColRow = new Vec2(3, 45)
        this.backgroundSetup.push((layer:Layer)=>{
            this.addLevelBackgroundImage("PressE",layer.getName(),new Vec2(28,16).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(3,3));
        })

        // this.turrets = [
        //     new Vec2(1,185),
        //     new Vec2(26,182),
        //     new Vec2(39,176),
        //     new Vec2(23,164),
        //     new Vec2(11,152),
        //     new Vec2(35,141),
        //     new Vec2(13,132),
        //     new Vec2(31,134),
        //     new Vec2(28,126),
        //     new Vec2(20,118),
        //     new Vec2(14,110),
        //     new Vec2(38,110),
        //     new Vec2(1,102),
        //     new Vec2(26,102),
        //     new Vec2(39,96),
        //     new Vec2(28,98),
        //     new Vec2(14,95),
        //     new Vec2(22,82),
        //     new Vec2(33,82),
        //     new Vec2(10,75),
        //     new Vec2(20,72),
        //     new Vec2(27,70),
        //     new Vec2(20,60),
        //     new Vec2(34,55),
        //     new Vec2(15,28),
            
        // ]
        // this.backgroundSetup.push((layer:Layer)=>{
        //     for(let t of this.turrets){
        //         let turret = this.addLevelBackgroundImage("turret",layer.getName(),t.mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.5,0.5))
        //         //add AABB to turret
        //         turret.addPhysics(new AABB(Vec2.ZERO, turret.boundary.getHalfSize()));
        //     }
        //     this.balloon = this.addLevelBackgroundImage("balloon",layer.getName(),this.balloonPosition.mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(2,2))
        //     this.balloon.addPhysics(new AABB(Vec2.ZERO, new Vec2(this.balloon.boundary.hw, this.balloon.boundary.hh*0.5)),new Vec2(0,-this.balloon.boundary.hh*0.5),false,false);
        //     this.balloon.moving=true;
        // });
        // Do generic setup for a GameLevel
        super.startScene();
        //Create object pool for bullets.
        // this.bullets = []
        // for (let i = 0; i < 100; i++) {
        //     let bullet = this.add.animatedSprite("bullet", "primary");
        //     bullet.position.copy(Vec2.ZERO);
        //     bullet.scale = GameLevel.LEVEL_SCALING.clone().scale(1.5);
        //     bullet.animation.playIfNotAlready("shoot", true);
        //     bullet.addPhysics(bullet.boundary,Vec2.ZERO,true,false);
        //     bullet.setGroup("enemy");
        //     bullet.visible = false;
        //     bullet.addAI(BulletAI, {owner:bullet,player: this.player});
        //     bullet.setTrigger("balloon",Game_Events.PLAYER_BALLOON_POPPED,null);
        //     this.bullets.push(bullet);
        // }
        //for every single turret, 
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level_music", loop: true, holdReference: true});
    }

    updateScene(deltaT: number): void {
        // this.viewport.disableStaticBoundary();
        super.updateScene(deltaT);
    }

    show_art(): void {
        this.addLevelBackgroundImage("art","UI",this.viewport.getHalfSize(),new Vec2(3,3),1);
    }
} 