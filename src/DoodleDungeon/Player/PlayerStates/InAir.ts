import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState";

export default abstract class InAir extends PlayerState {
    
    update(deltaT: number): void {
        super.update(deltaT);

        let dir = this.getInputDirection();
        if(dir.x != 0){
		    this.parent.velocity.x += dir.x * this.parent.speed/3.5 - 0.3*this.parent.velocity.x;
        }else{
            //without this line, the player's velocity will never be reduced to 0
            this.parent.velocity.x *= 0.9;
        }
		this.owner.move(this.parent.velocity.scaled(deltaT));

        if(this.owner.onGround){
			this.finished(PlayerStates.PREVIOUS);
		}
    }
}