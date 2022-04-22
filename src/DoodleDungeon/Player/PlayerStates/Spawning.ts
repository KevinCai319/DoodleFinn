import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { Game_Events } from "../../Events";
import GameLevel from "../../Scenes/Game";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class Spawn extends PlayerState {
    owner: AnimatedSprite
    startLocation: Vec2
    RESPAWN_TIME: number = 1200
    timeElapsed: number = 0
	onEnter(options: Record<string, any>): void {
        this.timeElapsed = 0
        this.startLocation = this.owner.position.clone()
        this.owner.tweens.play("iframe",true)
        this.parent.setInvincible(this.RESPAWN_TIME)
	}

    update(deltaT: number): void {
		super.update(deltaT);
        this.timeElapsed += deltaT
        this.owner.position.copy(Vec2.lerp(this.startLocation,(this.owner.getScene() as GameLevel).PlayerSpawn, (this.timeElapsed*1000)/this.RESPAWN_TIME));
        if(this.parent.invincibleTimer.isStopped()){
		    this.finished(PlayerStates.IDLE);
        }
	}

    onExit(): Record<string, any> {
        this.parent.health = this.parent.MAX_HEALTH;  
		this.positionTimer.start();
        this.parent.setInvincible(1500)
        this.owner._velocity = Vec2.ZERO
		this.owner.animation.stop(); 
        this.owner.enablePhysics();
        this.owner.unfreeze();
        return {};
    }
}