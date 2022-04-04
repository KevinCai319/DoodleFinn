import State from "../../../Wolfie2D/DataTypes/State/State";
import StateMachine from "../../../Wolfie2D/DataTypes/State/StateMachine";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Input from "../../../Wolfie2D/Input/Input";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import Timer from "../../../Wolfie2D/Timing/Timer";
import PlayerController, { PlayerType } from "../PlayerController";
import { Game_Events } from "../../Events";

export default abstract class PlayerState extends State {
	owner: GameNode;
	parent: PlayerController;
	positionTimer: Timer;
	gravity: number = 1000
	constructor(parent: StateMachine, owner: GameNode){
		super(parent);
		this.owner = owner;
		this.positionTimer = new Timer(100)
		this.positionTimer.start();
	}

	
	handleInput(event: GameEvent): void {

	}

	/** 
	 * Get the inputs from the keyboard, or Vec2.Zero if nothing is being pressed
	 */
	getInputDirection(): Vec2 {
		let direction = Vec2.ZERO;
		direction.x = (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0)
		let type = this.parent.playerType
		if(type == PlayerType.TOPDOWN){
			direction.y = (Input.isPressed("down") ? 1 : 0) + (Input.isPressed("up") ? -1 : 0)
			direction.normalize();
		}else if (type == PlayerType.PLATFORMER){
			direction.y = (Input.isJustPressed("jump") ? -1 : 0)
		}else{

		}
		return direction;
	}


	update(deltaT: number): void {
		if (this.positionTimer.isStopped()){
			this.emitter.fireEvent(Game_Events.PLAYER_MOVE, {position: this.owner.position.clone()});
			this.positionTimer.start();
		}
		if((this.parent as PlayerController).playerType == PlayerType.PLATFORMER){
			this.parent.velocity.y += this.gravity*deltaT;
		}
	}
}