import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import {Game_Names } from "../../Events";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";

export default class Guard extends EnemyState {
    private guardPosition: Vec2;

    private awayFromGuardPosition: boolean;

    private route: NavigationPath;

    private retObj: Record<string, any>;
    
    constructor(parent: EnemyAI, owner: GameNode, guardPosition: Vec2){
        super(parent, owner);

        this.guardPosition = guardPosition;
    }

    onEnter(options: Record<string, any>): void {

        if(!(this.owner.position.distanceSqTo(this.guardPosition) < 8*8)){
            // We need a new route
            this.awayFromGuardPosition = true;
            this.owner.pathfinding = true;
            this.route = this.owner.getScene().getNavigationManager().getApproximatePath(Game_Names.NAVMESH, this.owner.position, this.guardPosition);
        } else {
            this.awayFromGuardPosition = false;
            this.owner.pathfinding = false;
        }
    }

    handleInput(event: GameEvent): void { }

    update(deltaT: number): void {
        if(this.awayFromGuardPosition){
            // Navigate back home
            if(this.route == null || this.route.isDone()){
                this.awayFromGuardPosition = false;
                this.owner.pathfinding = false;
            } else {
                this.owner.moveOnPath(this.parent.speed * deltaT, this.route);
                // this.owner.rotation = Vec2.UP.angleToCCW(this.route.getMoveDirection(this.owner));
                this.owner.rotation = 0;
            }
        }

        this.parent.lastPlayerPos = this.parent.getPlayerPosition();
        
        if(this.parent.lastPlayerPos !== null && this.owner.position.distanceTo(this.parent.lastPlayerPos) < this.triggerDistance){
            this.finished(EnemyStates.TARGETING);
        }

    }

    onExit(): Record<string, any> {
        return this.retObj;
    }

}