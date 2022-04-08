import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Input from "../../../Wolfie2D/Input/Input";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";
import { PlayerType } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class OnGround extends PlayerState {
	jumpBoost:number = 500
	onEnter(options: Record<string, any>): void {}

	update(deltaT: number): void {

		if(this.parent.playerType == PlayerType.PLATFORMER){
			if(this.parent.velocity.y > 0){
				this.parent.velocity.y = 0;
			}
		}
		super.update(deltaT);

		let direction = this.getInputDirection();
		//set direction of the top
		if(direction.x !== 0){
			(<Sprite>this.owner).invertX = MathUtils.sign(direction.x) < 0;
		}
		if(this.parent.playerType == PlayerType.PLATFORMER){
			if(Input.isPressed("jump")){
				this.finished("jump");
				this.parent.velocity.y = -this.jumpBoost;
				// if(this.parent.velocity.x !== 0){
				// 	this.owner.tweens.play("flip");
				// }
			} else if(!this.owner.onGround){
				this.finished("fall");
			}
		}
	}

	onExit(): Record<string, any> {
		return {};
	}
}