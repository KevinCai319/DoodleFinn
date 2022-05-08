import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class BulletAI implements AI {
    // The owner of this AI
    protected owner: AnimatedSprite;

    // The direction of an rock
    public direction: Vec2;

    // The speed all bullets move at
    public static SPEED: number = 10;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
    }

    activate(options: Record<string, any>): void {
        this.direction = options.direction;
        this.owner.animation.playIfNotAlready("shoot");
    }

    handleEvent(event: GameEvent): void {
        // Do nothing
    }

    update(deltaT: number): void {
        if(this.owner.visible)
            this.owner.position.add(Vec2.DOWN.scaled(BulletAI.SPEED * deltaT));
    }

    destroy(): void {

    }
}