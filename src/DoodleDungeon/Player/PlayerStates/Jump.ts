import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";

import { PlayerStates } from "../PlayerController";
import InAir from "./InAir";

export default class Jump extends InAir {
	owner: AnimatedSprite;

	onEnter(options: Record<string, any>): void {
		this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "jump", loop: false, holdReference: false});
		console.log("jumping")
		if(this.parent.velocity.x < 0){
			this.owner.animation.playIfNotAlready("Jumping Left", true);
		} else {
			this.owner.animation.playIfNotAlready("Jumping Right", true);
		}
	}

	update(deltaT: number): void {
		super.update(deltaT);
		if(this.parent.velocity.x < 0){
			this.owner.animation.playIfNotAlready("Jumping Left", true);
		} else {
			this.owner.animation.playIfNotAlready("Jumping Right", true);
		}
		if(this.owner.onCeiling){
			// head bump!
			this.parent.velocity.y *=-0.5;
		}
		if(this.parent.velocity.y > 0){
			this.finished(PlayerStates.FALL);
		}
	}

	onExit(): Record<string, any> {
		this.owner.animation.stop();
		console.log("stop jumping")
		return {};
	}
}