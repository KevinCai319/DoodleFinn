import GoapActionPlanner from "../../Wolfie2D/AI/GoapActionPlanner";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import StateMachineGoapAI from "../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Stack from "../../Wolfie2D/DataTypes/Stack";
import State from "../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import { Game_Events, Game_Names, AI_Statuses } from "../Events";
import BattlerAI from "./BattlerAI";
import Active from "./EnemyStates/Active";
import Guard from "./EnemyStates/Guard";
import GameLevel from "../Scenes/Game";
import Timer from './../../Wolfie2D/Timing/Timer';
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";


export default class EnemyAI extends StateMachineGoapAI implements BattlerAI {
    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The total possible amount of health this entity has */
    maxHealth: number;

    /** The current amount of health this entity has */
    health: number;

    /** The default movement speed of this AI */
    speed: number = 90;


    /** A reference to the player object */
    player: GameNode;


    // The current known position of the player
    playerPos: Vec2;

    // The last known position of the player
    lastPlayerPos: Vec2;

    // Attack range
    inRange: number;

    // Path to player
    path: NavigationPath;

    invincible: boolean;
    invincibleTimer: Timer;

    attacking: boolean;
    attackTimer: Timer;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;

        // Guard mode
        this.addState(EnemyStates.DEFAULT, new Guard(this, owner, options.guardPosition));

        this.addState(EnemyStates.TARGETING, new Active(this, owner));

        this.maxHealth = options.health;

        this.health = options.health;

        this.player = options.player1;

        this.inRange = options.inRange;

        this.goal = options.goal;

        this.currentStatus = options.status;

        this.possibleActions = options.actions;

        this.plan = new Stack<GoapAction>();

        this.planner = new GoapActionPlanner();

        this.invincible = false;
        this.invincibleTimer = new Timer(0);

        this.attacking = false;
        this.attackTimer = new Timer(0);

        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT);

        this.getPlayerPosition();

        this.owner.tweens.add("iframe",
        {
            startDelay: 0,
            duration: 125,
            reverseOnComplete: true,
            loop:true,
            effects:[
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_SINE

                }
            ]
           
        });
        
        this.owner.tweens.add("death",
        {
            startDelay: 0,
            duration: 1250,
            reverseOnComplete: false,
            loop: false,
            effects:[
                {
                    property: "rotation",
                    start: 0,
                    end: 12*Math.PI,
                    ease: EaseFunctionType.IN_OUT_QUAD
                },
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ]
        });

        this.owner.debugRender = ()=>{
            if(this.path != null){
                this.path.renderPath(this.owner)
            }
        }

    }

    activate(options: Record<string, any>): void { }

    updatePlayerPath(){
        // Run A* to get general path.
        this.path = this.owner.getScene().getNavigationManager().getApproximatePath(Game_Names.NAVMESH, this.owner.position, this.lastPlayerPos);
        if(this.path != null){
            // Remove Excess nodes in path for smoother paths.
            this.path = NavigationPath.AABBOptimization(this.path, (this.owner.getScene() as GameLevel).dynamicMap, this.owner.boundary);
        }
    }

    setInvincible(duration:number=500){
        this.invincibleTimer.start(duration);
        this.invincible = true;
        this.owner.tweens.play("iframe");
    }

    damage(damage: number): void {
        if(!this.invincible){
            this.health -= damage;
            if(this.health <= 0){
                this.owner.setAIActive(false, {});
                this.owner.isCollidable = false;
                // this.owner.visible = false;
                this.owner.tweens.play("death")
            }  
            else {
                this.setInvincible(500)
            }
        }
    }

    getPlayerPosition(): Vec2 {
        //always follow player.
        return this.player.position;
    }

    attack(){
        console.log("enemy atk")
        if(this.attackTimer.isStopped()){
            this.attacking = true
            this.attackTimer.start(100);
            (<BattlerAI>this.player._ai).damage(1)
        }
    }
    
    update(deltaT: number){
        super.update(deltaT);

        if(this.invincible && this.invincibleTimer.isStopped()){
            this.invincible = false
            this.owner.tweens.stop("iframe");
        }
        if(this.attacking && this.attackTimer.isStopped()){
            this.attacking = false
        }

        // // This is the plan that is executed in the Active state, so whenever we don't have a plan, acquire a new one given the current statuses the enemy has
        if (this.plan.isEmpty()) {
            //get a new plan
            this.plan = this.planner.plan(AI_Statuses.REACHED_GOAL, this.possibleActions, this.currentStatus, null);
        }
    }
}

export enum EnemyStates {
    DEFAULT = "default",
    ALERT = "alert",
    TARGETING = "targeting",
    PREVIOUS = "previous"
}
