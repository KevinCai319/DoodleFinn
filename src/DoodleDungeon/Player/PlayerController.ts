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
import Dying from "./PlayerStates/Dying";
import Run from "./PlayerStates/Run";
import Spawn from "./PlayerStates/Spawning";
import Walk from "./PlayerStates/Walk";
import Home from "../Scenes/Home";
import HealthBar from "../UI/HealthBar";
import GameLevel from "../Scenes/Game";

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
    DYING = "dying",
    SPAWN = "spawn"
}

export default class PlayerController extends StateMachineAI implements BattlerAI {
    owner: GameNode;
    playerType: PlayerType = PlayerType.PLATFORMER
    velocity: Vec2 = Vec2.ZERO
    direction: number = 1;
    //Ok so this could be a state, but I'm not sure if I want to go through the effort.
    attacking: boolean = false;
    // Same here :/
    hasBalloon: boolean = false;
    balloon: Sprite;


    MAX_HEALTH: number = 10;
    health: number = this.MAX_HEALTH;
    speed: number = 200;
    invincibleTimer: Timer
    attackTimer: Timer
    deathTimer: Timer
    invicible: boolean = false;
    MIN_SPEED: number = 200;
    MAX_SPEED: number = 300;
    ATTACK_AREA: Vec2 = new Vec2(1, 1)
    healthBar: HealthBar;


    initializeAI(owner: GameNode, options: Record<string, any>) {
        this.owner = owner;
        this.playerType = options.playerType
        this.invincibleTimer = new Timer(1000);
        this.attackTimer = new Timer(100);
        this.deathTimer = new Timer(1000);
        this.direction = 1
        this.health = this.MAX_HEALTH;
        this.hasBalloon = false;
        this.balloon = null;
        this.healthBar = new HealthBar(this.owner.getScene() as GameLevel, "UI", this, this.MAX_HEALTH, new Vec2(30, this.owner.getScene().getViewport().getHalfSize().y * 2 - 30), true, 33, new Vec2(0.1, 0.1));
        let boundary = (<AnimatedSprite>this.owner).boundary
        this.ATTACK_AREA = new Vec2(boundary.hw * 1.5, boundary.hh * 2)
        this.setInvincible();
        // I-frame animation(blinking)
        owner.tweens.add("iframe",
            {
                startDelay: 0,
                duration: 125,
                onEnd: Game_Events.PLAYER_INVINCIBLE_END,
                reverseOnComplete: true,
                loop: true,
                effects: [
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
                effects: [
                    {
                        property: "rotation",
                        start: 0,
                        end: 12 * Math.PI,
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
        this.receiver.subscribe(Game_Events.PLAYER_LOSE_LIFE);
        this.receiver.subscribe(Game_Events.PLAYER_BALLOON_POPPED);
        this.receiver.subscribe(Game_Events.PLAYER_BALLOON_PICKED_UP);
        (<AnimatedSprite>this.owner).animation.playIfNotAlready("Idle Left", true);
    }
    setInvincible(duration: number = 500) {
        this.invincibleTimer.start(duration);
        this.invicible = true;
        this.emitter.fireEvent(Game_Events.PLAYER_INVINCIBLE);
        this.owner.tweens.play("iframe");
    }
    damage(amount: number): void {
        if (!this.invicible && this.health > 0 && !Home.invincibilityCheats) {
            this.health -= amount;
            this.emitter.fireEvent(Game_Events.PLAYER_HURT);
            if (this.health <= 0) {
                this.attacking = false;
                this.owner.tweens.stopAll();
                this.health = 0;
                this.balloon = null;
                this.hasBalloon = false;
                (<AnimatedSprite>this.owner).animation.stop();
                this.deathTimer.start(1000);
                this.changeState(PlayerStates.DYING);
            } else {
                this.setInvincible();
            }
        }
    }
    attack() {
        // Prevent spamming attacks.
        if (this.attackTimer.isStopped()) {
            this.attacking = true
            this.attackTimer.start(100);
            this.emitter.fireEvent(Game_Events.PLAYER_ATTACK);
            if (this.direction == -1) {
                (<AnimatedSprite>this.owner).animation.playIfNotAlready("Attacking Left", false, Game_Events.PLAYER_ATTACK_FINISHED)
            } else {
                (<AnimatedSprite>this.owner).animation.playIfNotAlready("Attacking Right", false, Game_Events.PLAYER_ATTACK_FINISHED)
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
        let dying = new Dying(this, this.owner);
        this.addState(PlayerStates.DYING, dying);
        let jump = new Jump(this, this.owner);
        this.addState(PlayerStates.JUMP, jump);
        let fall = new Fall(this, this.owner);
        this.addState(PlayerStates.FALL, fall);
        this.initialize(PlayerStates.SPAWN);
    }

    changeState(stateName: string): void {
        if (this.playerType == PlayerType.PLATFORMER) {
            // If we jump or fall, push the state so we can go back to our current state later
            // unless we're going from jump to fall or something
            if ((stateName === PlayerStates.JUMP || stateName === PlayerStates.FALL) && !(this.stack.peek() instanceof InAir)) {
                this.stack.push(this.stateMap.get(stateName));
            }
        }
        super.changeState(stateName);
    }

    update(deltaT: number): void {
        this.healthBar.updateHealthBar();
        if (this.invicible && this.invincibleTimer.isStopped()) {
            this.invicible = false
            this.owner.tweens.stop("iframe");
        }
        if (this.attacking && this.attackTimer.isStopped()) {
            this.attacking = false
        }
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            switch (event.type) {
                case Game_Events.PLAYER_LOSE_LIFE:
                    break;
                case Game_Events.PLAYER_BALLOON_POPPED:
                    this.hasBalloon = false;
                    this.balloon.visible = false;
                    break;
                case Game_Events.PLAYER_BALLOON_PICKED_UP:
                    this.hasBalloon = true;
                    this.balloon.visible = true;    
                    break;
                default:
                    break;
            }
        }
        if (this.owner.onGround) {
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