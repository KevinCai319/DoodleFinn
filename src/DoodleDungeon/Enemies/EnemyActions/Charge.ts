import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import { Game_Names } from "../../Events";
import GameLevel from "../../Scenes/Game";
import EnemyAI from "../EnemyAI";
import Timer from './../../../Wolfie2D/Timing/Timer';

export default class Charge extends GoapAction {
    private path: NavigationPath;
    protected emitter: Emitter;

    private chargeTime: number;
    private timer: Timer;
    private isTimerStarted: boolean;

    private chargeDirection: Vec2;

    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        super();
        this.cost = cost;
        this.preconditions = preconditions;
        this.effects = effects;
        this.loopAction = true;
        
        this.chargeTime = options.chargeTime
        this.timer = new Timer(this.chargeTime)
        this.isTimerStarted = false;

        this.chargeDirection = new Vec2();
    }

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        if (this.checkPreconditions(statuses)){
            let enemy = <EnemyAI>actor;
            if (! this.isTimerStarted) {
                this.timer.start()
                this.isTimerStarted = true;
                this.chargeDirection = enemy.owner.position.dirTo(enemy.playerPos).normalized();
            }
            let distance = enemy.owner.position.distanceTo(enemy.lastPlayerPos);
            if (this.timer.isStopped() || (distance < enemy.inRange)) {
                this.isTimerStarted = false;
                return this.effects
            }
            enemy.owner.pathfinding = false;
            enemy.owner.moving = true;
            enemy.owner.rotation = Vec2.UP.angleToCCW(this.chargeDirection);
            // enemy.owner._velocity = this.chargeDirection.scale(enemy.speed * deltaT);
            enemy.owner._velocity = this.chargeDirection.scaled(2 * enemy.speed * deltaT);
        }
        return null;
    }

    updateCost(options: Record<string, number>): void {}

    toString(): string {
        return "(Charge)";
    }
    
}