import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import { Game_Names } from "../../Events";
import GameLevel from "../../Scenes/Game";
import EnemyAI from "../EnemyAI";

export default class Move extends GoapAction {
    private inRange: number;

    private path: NavigationPath;
    protected emitter: Emitter;
    private usingPath :boolean = false;
    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        super();
        this.cost = cost;
        this.preconditions = preconditions;
        this.effects = effects;
        this.loopAction = true;
        this.inRange = options.inRange;
    }

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        if (this.checkPreconditions(statuses)){
            //Check distance from player
            let enemy = <EnemyAI>actor;
            let playerPos = enemy.lastPlayerPos;
            let distance = enemy.owner.position.distanceTo(playerPos);

            //If close enough, we've moved far enough and this loop action is done
            if (distance <= this.inRange){
                return this.effects;
            }
            //Check if the player is directly visible, and can run straight to the player.
            //distance to player.
            if((enemy.owner.getScene() as GameLevel).dynamicMap.canAABBgo(enemy.owner.boundary,enemy.owner.boundary.center.vecTo(enemy.playerPos))){
                //if it is, then move directly to the player.
                this.usingPath = false;
                enemy.owner.pathfinding = false;
                let dir = enemy.owner.position.dirTo(enemy.playerPos);
                enemy.owner.rotation = Vec2.UP.angleToCCW(dir);
                enemy.owner.moving = true;
                enemy.owner._velocity = dir.scale(enemy.speed * deltaT);
            }else{
                //Otherwise move on path. Update path if the distance traveled is greater than a certain amount.
                if(!this.usingPath || enemy.path == null|| enemy.path.getDistanceTraveled() > 8 || enemy.path.getStackSize() == 0){
                    this.usingPath = true;
                    enemy.lastPlayerPos = enemy.playerPos;		
                    enemy.updatePlayerPath();
                }
                this.path = enemy.path;
                enemy.owner.moveOnPath(enemy.speed * deltaT, this.path);
                enemy.owner.rotation = Vec2.UP.angleToCCW(this.path.getMoveDirection(enemy.owner));
            }
            return null;
        }
        return this.effects;
    }

    updateCost(options: Record<string, number>): void {}

    toString(): string {
        return "(Move)";
    }
    
}