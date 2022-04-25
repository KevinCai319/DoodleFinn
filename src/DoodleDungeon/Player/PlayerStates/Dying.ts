import State from "../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import { Game_Events } from "../../Events";

import { PlayerStates } from "../PlayerController";
import InAir from "./InAir";
import PlayerState from "./PlayerState";

export default class Dying extends PlayerState {
    handleInput(event: GameEvent): void {
        // No input handling
    }

	onEnter(options: Record<string, any>): void {
		(<AnimatedSprite>this.owner).animation.playIfNotAlready("Dying",false);
	}

	update(deltaT: number): void {
        // super.update(deltaT);
		if(!((this.owner as AnimatedSprite).animation.isPlaying("Dying"))){
			this.emitter.fireEvent(Game_Events.PLAYER_LOSE_LIFE);
			this.finished(PlayerStates.SPAWN);
		}
		
	}

	onExit(): Record<string, any> {
		return {};
	}
}