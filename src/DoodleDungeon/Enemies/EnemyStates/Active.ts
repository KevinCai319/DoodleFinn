import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import Stack from "../../../Wolfie2D/DataTypes/Stack";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import OrthogonalTilemap from "../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { Game_Names, AI_Statuses } from "../../Events";
import GameLevel from "../../Scenes/Game";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";
import AnimatedSprite from './../../../Wolfie2D/Nodes/Sprites/AnimatedSprite';

export default class Active extends EnemyState {
    // Timers for managing this state
    pollTimer: Timer;
    exitTimer: Timer;
    // The return object for this state
    retObj: Record<string, any>;

    constructor(parent: EnemyAI, owner: GameNode) {
        super(parent, owner);

        // Regularly update the player location
        this.pollTimer = new Timer(100);

        this.exitTimer = new Timer(1000);
    }

    onEnter(options: Record<string, any>): void {
        // Reset the return object
        this.retObj = {};
        
        // Choose path to last seen player position
        this.retObj = { target: this.parent.lastPlayerPos }
        
        this.parent.updatePlayerPath();
    }

    handleInput(event: GameEvent): void { }


    update(deltaT: number): void {
        //Poll for player position
        if (this.pollTimer.isStopped()) {
            // Restart the timer
            this.pollTimer.start();

            this.parent.playerPos = this.parent.getPlayerPosition();

            if (this.parent.playerPos !== null && (this.parent.path == null || this.parent.path.getDistanceTraveled() >8 || this.parent.path.getStackSize() == 0) ) {
                // If we see a new player position, update dthe last position
                this.parent.lastPlayerPos = this.parent.playerPos;
                this.parent.updatePlayerPath();
            }
        }


        // We haven't seen the player in a while, go check out where we last saw them, if possible
        if (this.owner.position.distanceTo(this.parent.lastPlayerPos) > this.triggerDistance* 1.5) {
            this.finished(EnemyStates.DEFAULT);
        }

        //Add in range to status if close enough to a player
        if (this.parent.playerPos !== null) {
            let distance = this.owner.position.distanceTo(this.parent.playerPos);

            let playerBorder = (<AnimatedSprite>this.parent.player).boundary
            if ((distance > this.parent.inRange) && !playerBorder.overlaps(this.parent.owner.boundary)) {
                let index = this.parent.currentStatus.indexOf(AI_Statuses.IN_RANGE);
                if (index != -1) {
                    this.parent.currentStatus.splice(index, 1);
                }
            }
        }

        //Choose next action
        let nextAction = this.parent.plan.peek();

        //Perform the action
        let result = nextAction.performAction(this.parent.currentStatus, this.parent, deltaT);

        //Our action was successful
        if (result !== null) {
            if (nextAction.toString() === "(Wait)") {
                let index = this.parent.currentStatus.indexOf(AI_Statuses.MOVE_DONE)
                if (index != -1) {
                    this.parent.currentStatus.splice(index, 1);
                }
            }
            if (nextAction.toString() === "(Charge)") {
                let index = this.parent.currentStatus.indexOf(AI_Statuses.WAIT_DONE)
                if (index != -1) {
                    this.parent.currentStatus.splice(index, 1);
                }
            }
            //The action has not reached the goal yet, pass along the effects of our action
            if (!result.includes(AI_Statuses.REACHED_GOAL)) {
                this.parent.currentStatus = this.parent.currentStatus.concat(result);
                // console.log("CURRENT STATUS: ", this.parent.currentStatus)
            }
            this.parent.plan.pop();
        }
        else {
            // Our action was not successful. However, if the action was a loop action like Move, we continue to do it until it's succesful
            if (!nextAction.loopAction) {
                this.parent.plan.pop();
            }
        }

    }

    onExit(): Record<string, any> {
        return this.retObj;
    }

}