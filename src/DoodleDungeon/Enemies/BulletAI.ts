import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PlayerController from "../Player/PlayerController";
import GameLevel from "../Scenes/Game";

export default class BulletAI implements AI {
    // The owner of this AI
    protected owner: AnimatedSprite;

    // The direction of an rock
    public direction: Vec2;
    public player:GameNode;
    // The speed all bullets move at
    public static SPEED: number = 5;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.player = options.player;
    }

    activate(options: Record<string, any>): void {
        this.direction = options.direction;
        this.owner.animation.playIfNotAlready("shoot");
    }

    handleEvent(event: GameEvent): void {
        // Do nothing
    }

    update(deltaT: number): void {
        if(this.owner.visible){
            this.owner._velocity = this.direction.scaleTo(BulletAI.SPEED);
            this.owner.moving=true;
            if(this.owner.boundary.overlaps((this.player as AnimatedSprite).boundary)){
                (this.player._ai as PlayerController).damage(1);
                this.owner.visible = false;
            };
            if(this.owner.isColliding
            ||this.owner.position.x > ((this.owner.getScene() as GameLevel).dynamicMap.getDimensions().x * GameLevel.DEFAULT_LEVEL_TILE_SIZE.x)+100
			||this.owner.position.y <-100
            ||this.owner.position.x < -100
			||this.owner.getScene().getViewport().getView().bottom < this.owner.position.y-100
            ) {
 
                this.owner.visible = false;
            }
        }else{
            this.owner._velocity = Vec2.ZERO;
            this.owner.moving=false;
        }
    }

    destroy(): void {

    }
}