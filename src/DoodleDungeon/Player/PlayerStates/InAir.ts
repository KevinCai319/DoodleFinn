import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState";

export default abstract class InAir extends PlayerState {
    
    update(deltaT: number): void {
        super.update(deltaT);

        let dir = this.getInputDirection();
        if(dir.x != 0){
		    this.parent.velocity.x += dir.x * this.parent.speed/3.5 - 0.3*this.parent.velocity.x;
        }else{
            // //without this line, the player's velocity will never be reduced to 0 in time.
            this.parent.velocity.x *= 0.9;
            // Remove all momentum when not moving and against a wall.
            if((<AnimatedSprite>this.owner).onWall){
                this.parent.velocity.x = 0;
            }
        }
		this.owner.move(this.parent.velocity.scaled(deltaT));
        if(this.owner.onGround){
			this.finished(PlayerStates.PREVIOUS);
		}
    }
}