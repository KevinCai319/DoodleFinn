import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import InAir from "./InAir";

export default class Fall extends InAir {
    owner: AnimatedSprite;

	onEnter(options: Record<string, any>): void {
	}
    update(deltaT: number): void {
		super.update(deltaT);
		if(this.owner.onCeiling){
			this.parent.velocity.y =0
			// this.finished(PlayerStates.FALL);
		}

		// If we're falling, go to the fall state
		// if(this.parent.velocity.y >= 0){
		// 	this.finished(PlayerStates.FALL);
		// }
	}
    onExit(): Record<string, any> {
		this.owner.animation.stop();
        return {};
    }
}