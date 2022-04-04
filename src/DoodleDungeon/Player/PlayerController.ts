import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../Wolfie2D/Debug/Debug";
import GameNode, { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import Fall from "./PlayerStates/Fall";
import Idle from "./PlayerStates/Idle";
import InAir from "./PlayerStates/InAir";
import Jump from "./PlayerStates/Jump";
import Run from "./PlayerStates/Run";
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
	PREVIOUS = "previous"
}

export default class PlayerController extends StateMachineAI {
    protected owner: GameNode;

    playerType: PlayerType = PlayerType.PLATFORMER
    velocity: Vec2 = Vec2.ZERO;
	speed: number = 200;
	MIN_SPEED: number = 200;
    MAX_SPEED: number = 300;
    

    initializeAI(owner: GameNode, options: Record<string, any>){
        this.owner = owner;
        this.playerType = options.playerType

        this.initializeStates();
        (<AnimatedSprite>this.owner).animation.playIfNotAlready("IDLE", true);
    }

    initializeStates(): void {
        this.speed = 400;
        let idle = new Idle(this, this.owner);
		this.addState(PlayerStates.IDLE, idle);
		let walk = new Walk(this, this.owner);
		this.addState(PlayerStates.WALK, walk);
		let run = new Run(this, this.owner);
		this.addState(PlayerStates.RUN, run);
        if(this.playerType == PlayerType.PLATFORMER){
            let jump = new Jump(this, this.owner);
            this.addState(PlayerStates.JUMP, jump);
            let fall = new Fall(this, this.owner);
            this.addState(PlayerStates.FALL, fall);
        }
        this.initialize(PlayerStates.IDLE);
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