import Input from "../../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import OnGround from "./OnGround";

export default class Walk extends OnGround {
	owner: AnimatedSprite;

	onEnter(options: Record<string, any>): void {
		this.parent.speed = this.parent.MIN_SPEED;
		this.owner.animation.playIfNotAlready("WALK", true);
		// console.log("enter walk");
	}

	update(deltaT: number): void {
		super.update(deltaT);
		let dir = this.getInputDirection();
		if(dir.isZero()){
			this.finished(PlayerStates.IDLE);
		} else {
			if(Input.isPressed("run")){
				this.finished(PlayerStates.RUN);
			}
		}

		this.parent.velocity = dir.scale(this.parent.speed);

		this.owner.move(this.parent.velocity.scaled(deltaT));
	}

	onExit(): Record<string, any> {
		this.owner.animation.stop();
		// console.log("exit walk");
		return {};
	}
}