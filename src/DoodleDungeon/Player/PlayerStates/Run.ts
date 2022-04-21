import Input from "../../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PlayerController, { PlayerStates, PlayerType } from "../PlayerController";
import OnGround from "./OnGround";

export default class Run extends OnGround {
	owner: AnimatedSprite;

	onEnter(options: Record<string, any>): void {
		this.parent.speed = this.parent.MAX_SPEED;
		if(!this.parent.attacking){
			if(this.parent.direction == -1){
				this.owner.animation.playIfNotAlready("Walking Left", true);
			} else {
				this.owner.animation.playIfNotAlready("Walking Right", true);
			}
		}
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
		if(this.parent.velocity.x != 0){
			this.parent.direction = (this.parent.velocity.x < 0)?-1:1;
		}
		if(!this.parent.attacking){
			if(this.parent.direction == -1){
				this.owner.animation.playIfNotAlready("Walking Left", true);
			} else {
				this.owner.animation.playIfNotAlready("Walking Right", true);
			}
		}
		this.owner.move(this.parent.velocity.scaled(deltaT));
	}

	onExit(): Record<string, any> {
		if(!this.parent.attacking){
			this.owner.animation.stop();
			if(this.parent.direction == -1){
				this.owner.animation.playIfNotAlready("Idle Left", true);
			} else {
				this.owner.animation.playIfNotAlready("Idle Right", true);
			}
		}
		return {};
	}
}