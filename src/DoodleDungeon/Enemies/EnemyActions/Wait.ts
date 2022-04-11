import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import { Game_Names } from "../../Events";
import GameLevel from "../../Scenes/Game";
import EnemyAI from "../EnemyAI";
import Timer from './../../../Wolfie2D/Timing/Timer';

export default class Wait extends GoapAction {

    private path: NavigationPath;
    protected emitter: Emitter;

    private waitTime: number;
    private timer: Timer;
    private isTimerStarted: boolean;

    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        super();
        this.cost = cost;
        this.preconditions = preconditions;
        this.effects = effects;
        this.loopAction = true;
        
        this.waitTime = options.waitTime;

        this.timer = new Timer(this.waitTime)
        this.isTimerStarted = false;
    }

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        if (this.checkPreconditions(statuses)){
            if (! this.isTimerStarted) {
                this.timer.start()
                this.isTimerStarted = true;
            }        
            if (this.timer.isStopped()) {
                this.isTimerStarted = false;
                return this.effects
            }
        }
        return null;
    }

    updateCost(options: Record<string, number>): void {}

    toString(): string {
        return "(Wait)";
    }
    
}