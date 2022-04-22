import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState";

export default abstract class InAir extends PlayerState {
    
    update(deltaT: number): void {
        super.update(deltaT);

        let dir = this.getInputDirection();
        // if((<AnimatedSprite>this.owner).onWall){
        //     this.parent.velocity.x = 0;
        // }
        if(dir.x != 0){
		    this.parent.velocity.x += dir.x * this.parent.speed/3.5 - 0.3*this.parent.velocity.x;
        }else{
            // //without this line, the player's velocity will never be reduced to 0
            // this.parent.velocity.x *= 0.9;
            // if(Math.abs(this.parent.velocity.x) < (this.parent.speed/3.5)){
                this.parent.velocity.x = 0;
            // }
        }
        // console.log(this.parent.velocity.x);
        // console.log((<AnimatedSprite>this.owner).onWall);
		this.owner.move(this.parent.velocity.scaled(deltaT));

        if(this.owner.onGround){
            console.log("onGround");
			this.finished(PlayerStates.PREVIOUS);
		}
    }
}