import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import { Game_Names } from "../../Events";
import GameLevel from "../../Scenes/Game";
import EnemyAI from "../EnemyAI";
import AnimatedSprite from './../../../Wolfie2D/Nodes/Sprites/AnimatedSprite';

export default class Move extends GoapAction {
    private inRange: number;
    private untilVisible: boolean;

    private path: NavigationPath;
    protected emitter: Emitter;
    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        super();
        this.cost = cost;
        this.preconditions = preconditions;
        this.effects = effects;
        this.loopAction = true;
        this.inRange = options.inRange;
        this.untilVisible = options.untilVisible || false
    }

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        if (this.checkPreconditions(statuses)){
            //Check distance from player
            let enemy = <EnemyAI>actor;
            let playerPos = enemy.lastPlayerPos;
            let distance = enemy.owner.position.distanceTo(playerPos);
            let isPlayerVisible = (enemy.owner.getScene() as GameLevel).dynamicMap.canAABBgoToPoint(enemy.owner.boundary,enemy.playerPos)

            //If close enough, we've moved far enough and this loop action is done
            let playerBorder = (<AnimatedSprite>enemy.player).boundary
            if ((distance <= this.inRange) || playerBorder.overlaps(enemy.owner.boundary)){
                if (!this.untilVisible || (enemy.owner.getScene() as GameLevel).dynamicMap.isVisible(enemy.owner.position, enemy.playerPos)) {
                    return this.effects;
                }
            }
            //Check if the player is directly visible.
            if((enemy.owner.getScene() as GameLevel).dynamicMap.canAABBgoToPoint(enemy.owner.boundary,enemy.playerPos)){
                //If it is, then move directly to the player.
                enemy.owner.pathfinding = false;
                let dir = enemy.owner.position.dirTo(enemy.playerPos);
                
                // enemy.owner.rotation = Vec2.UP.angleToCCW(dir);
                // enemy.owner.rotation = Vec2.UP
                let isPlayerLeft = Math.sin(Vec2.UP.angleToCCW(dir)) >= 0
                if (isPlayerLeft) {
                    enemy.owner.animation.playIfNotAlready("Walk Left", true)
                }
                else {
                    enemy.owner.animation.playIfNotAlready("Walk Right", true)
                }
                enemy.owner.rotation = 0
                enemy.owner.moving = true;
                enemy.owner._velocity = dir.scale(enemy.speed * deltaT);
            }else{
                //Update 
                enemy.lastPlayerPos = enemy.playerPos;	
                enemy.updatePlayerPath();
                if(enemy.path != null){
                    this.path = enemy.path;
                    enemy.owner.moveOnPath(enemy.speed * deltaT, this.path);
                }
                // enemy.owner.rotation = Vec2.UP.angleToCCW(this.path.getMoveDirection(enemy.owner));
                let dir = enemy.owner.position.dirTo(enemy.playerPos);
                let isPlayerLeft = Math.sin(Vec2.UP.angleToCCW(dir)) >= 0
                if (isPlayerLeft) {
                    enemy.owner.animation.playIfNotAlready("Walk Left", true)
                }
                else {
                    enemy.owner.animation.playIfNotAlready("Walk Right", true)
                }
                enemy.owner.rotation = 0
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