import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { Game_Events } from "../../Events";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class Spawn extends PlayerState {
    owner: AnimatedSprite;

	onEnter(options: Record<string, any>): void {
        this.invincibleTimer = new Timer(1000, () => {
        });
        this.invincibleTimer.start()
	}

    update(deltaT: number): void {
		super.update(deltaT);
        if(this.invincibleTimer.isStopped()){
		    this.finished(PlayerStates.IDLE);
        }
	}

    onExit(): Record<string, any> {
        // restart position timer and velocity.
		this.positionTimer.start();
        this.owner.unfreeze()
        this.owner._velocity.y = 0;
        this.owner._velocity.x = 0;
		this.owner.animation.stop();
        return {};
    }
}