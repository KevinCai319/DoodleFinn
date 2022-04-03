import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../Wolfie2D/Debug/Debug";
import GameNode, { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import Idle from "./PlayerStates/Idle";
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
    velocity: Vec2 = Vec2.ZERO;
	speed: number = 200;
	MIN_SPEED: number = 200;
    MAX_SPEED: number = 300;
    

    initializeAI(owner: GameNode, options: Record<string, any>){
        this.owner = owner;

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
        this.initialize(PlayerStates.IDLE);
    }

    changeState(stateName: string): void {
        super.changeState(stateName);
    }

    update(deltaT: number): void {
		super.update(deltaT);
	}
}