import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../Wolfie2D/Debug/Debug";
import GameNode, { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import BattlerAI from "../Enemies/BattlerAI";
import { Game_Events } from "../Events";
import Fall from "./PlayerStates/Fall";
import Idle from "./PlayerStates/Idle";
import InAir from "./PlayerStates/InAir";
import Jump from "./PlayerStates/Jump";
import Run from "./PlayerStates/Run";
import Spawn from "./PlayerStates/Spawning";
import Walk from "./PlayerStates/Walk";

export enum PlayerType {
    PLATFORMER = "platformer",
    TOPDOWN = "topdown"
}

export enum PlayerStates {
    IDLE = "idle",
    WALK = "walk",
	RUN = "run",
	JUMP = "jump",
    FALL = "fall",
	PREVIOUS = "previous",
    SPAWN = "spawn"
}

export default class PlayerController extends StateMachineAI implements BattlerAI{
    owner: GameNode;
    playerType: PlayerType = PlayerType.PLATFORMER
    velocity: Vec2 = Vec2.ZERO
    direction: number = 1;
    attacking: boolean = false;
    health: number = 10;
	speed: number = 200;
    invincibleTimer: Timer
    attackTimer: Timer
    invicible: boolean = false;
	MIN_SPEED: number = 200;
    MAX_SPEED: number = 300;
    

    initializeAI(owner: GameNode, options: Record<string, any>){
        this.owner = owner;
        this.playerType = options.playerType
        this.invincibleTimer = new Timer(1000);
        this.attackTimer = new Timer(100);
        this.direction = 1
        this.setInvincible();
        // I-frame animation(blinking)
        owner.tweens.add("iframe",
        {
            startDelay: 0,
            duration: 125,
            onEnd: Game_Events.PLAYER_INVINCIBLE_END,
            reverseOnComplete: true,
            loop:true,
            effects:[
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_SINE

                }
            ]
           
        });
        owner.tweens.add("death",
        {
            startDelay: 0,
            duration: 1250,
            onEnd: Game_Events.PLAYER_KILLED,
            effects:[
                {
                    property: "rotation",
                    start: 0,
                    end: 12*Math.PI,
                    ease: EaseFunctionType.IN_OUT_QUAD
                },
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ]
        });
        this.initializeStates();
        (<AnimatedSprite>this.owner).animation.playIfNotAlready("idle left", true);
    }
    setInvincible(duration:number=500){
        this.invincibleTimer.start(duration);
        this.invicible = true;
        this.emitter.fireEvent(Game_Events.PLAYER_INVINCIBLE);
        this.owner.tweens.play("iframe");
    }
    damage(amount: number): void {
        if(!this.invicible){
            this.health -= amount;
            if(this.health <= 0){
                this.emitter.fireEvent(Game_Events.PLAYER_KILLED);
                this.owner.tweens.play("death");
            }  
        }
    }
    attack(){
        // Prevent spamming attacks.
        if(this.attackTimer.isStopped()){
            this.attacking = true
            this.attackTimer.start(500);
            this.emitter.fireEvent(Game_Events.PLAYER_ATTACK);
            if(this.direction == -1){
                (<AnimatedSprite>this.owner).animation.playIfNotAlready("Attacking Left",false,Game_Events.PLAYER_ATTACK_FINISHED)
            }else{
                (<AnimatedSprite>this.owner).animation.playIfNotAlready("Attacking Right",false,Game_Events.PLAYER_ATTACK_FINISHED)
            }
        }
    }
    initializeStates(): void {
        this.speed = 400;
        let idle = new Idle(this, this.owner);
		this.addState(PlayerStates.IDLE, idle);
		let walk = new Walk(this, this.owner);
		this.addState(PlayerStates.WALK, walk);
		let run = new Run(this, this.owner);
		this.addState(PlayerStates.RUN, run);
        let spawn = new Spawn(this, this.owner);
		this.addState(PlayerStates.SPAWN, spawn);
        if(this.playerType == PlayerType.PLATFORMER){
            let jump = new Jump(this, this.owner);
            this.addState(PlayerStates.JUMP, jump);
            let fall = new Fall(this, this.owner);
            this.addState(PlayerStates.FALL, fall);
        }
        this.initialize(PlayerStates.SPAWN);
    }

    changeState(stateName: string): void {
        if(this.playerType == PlayerType.PLATFORMER){
            // If we jump or fall, push the state so we can go back to our current state later
            // unless we're going from jump to fall or something
            if((stateName === PlayerStates.JUMP || stateName === PlayerStates.FALL) && !(this.stack.peek() instanceof InAir)){
                this.stack.push(this.stateMap.get(stateName));
            }
        }
        super.changeState(stateName);
    }

    update(deltaT: number): void {
        if(this.invicible && this.invincibleTimer.isStopped()){
            this.invicible = false
            this.owner.tweens.stop("iframe");
        }
        // if(this.attacking && this.attackTimer.isStopped()){
        //     this.attacking = false
        // }
        if(this.owner.onGround){
            // let rc =  this.tilemap.getColRowAt(this.owner.position);
            // rc.y+=1;
            // let tile = this.tilemap.getTileAtRowCol(rc);
            // if(tile == 8){
            //     this.tilemap.setTileAtRowCol(rc,9);
            //     this.emitter.fireEvent(HW5_Events.PLAYER_HIT_SWITCH);
            // }
        }
		super.update(deltaT);
	}
}