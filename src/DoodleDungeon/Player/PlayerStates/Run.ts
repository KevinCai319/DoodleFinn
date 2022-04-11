import Input from "../../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PlayerController, { PlayerStates, PlayerType } from "../PlayerController";
import OnGround from "./OnGround";

export default class Run extends OnGround {
	owner: AnimatedSprite;

	onEnter(options: Record<string, any>): void {
		this.parent.speed = this.parent.MAX_SPEED;
	}


	update(deltaT: number): void {
		super.update(deltaT);
		let dir = this.getInputDirection();
		if(dir.isZero()){
			this.finished(PlayerStates.IDLE);
		} else {
			if(!Input.isPressed("run")){
				this.finished(PlayerStates.WALK);
			}
		}
		if(this.parent.playerType == PlayerType.TOPDOWN){
			this.parent.velocity = dir.scale(this.parent.speed);
		}else if(this.parent.playerType == PlayerType.PLATFORMER){
			this.parent.velocity.x = dir.x * this.parent.speed
		}else{

		}

		if(this.parent.direction == -1){
			this.owner.animation.playIfNotAlready("Walking Left", true);
		} else {
			this.owner.animation.playIfNotAlready("Walking Right", true);
		}
		this.owner.move(this.parent.velocity.scaled(deltaT));
	}

	onExit(): Record<string, any> {
		this.owner.animation.stop();
		return {};
	}
}