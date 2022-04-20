import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import InAir from "./InAir";

export default class Fall extends InAir {
    owner: AnimatedSprite;

	onEnter(options: Record<string, any>): void {
		if(!this.parent.attacking){
			if(this.parent.velocity.x < 0){
				this.owner.animation.playIfNotAlready("Falling Left", true);
			} else {
				this.owner.animation.playIfNotAlready("Falling Right", true);
			}
		}
	}
    update(deltaT: number): void {
		super.update(deltaT);
		if(this.owner.onCeiling){
			this.parent.velocity.y = 0
		}
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