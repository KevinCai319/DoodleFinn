import Graph from "../../Wolfie2D/DataTypes/Graphs/Graph";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../Wolfie2D/Debug/Debug";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Point from "../../Wolfie2D/Nodes/Graphics/Point";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import NavigationManager from "../../Wolfie2D/Pathfinding/NavigationManager";
import Scene from "../../Wolfie2D/Scene/Scene";
import Timer from "../../Wolfie2D/Timing/Timer";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import { AI_Statuses, Game_Events } from "../Events";

import PlayerController, { PlayerType } from "../Player/PlayerController";
import DynamicMap from "../../Wolfie2D/Nodes/Tilemaps/DynamicMap";
import MainMenu from "./Title";
import EnemyAI from "../Enemies/EnemyAI";
import GoapAction from "../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import GoapActionPlanner from "../../Wolfie2D/AI/GoapActionPlanner";
import Move from "../Enemies/EnemyActions/Move";
import AttackAction from "../Enemies/EnemyActions/AttackAction";
import DynamicTilemap from "../../Wolfie2D/Nodes/Tilemaps/DynamicMap";


export default class GameLevel extends Scene {
    //Level defaults.
    static DEFAULT_LEVEL_SCALING: Vec2 = new Vec2(2,2);
    
    protected playerSpawn: Vec2;
    protected player: AnimatedSprite;
    protected respawnTimer: Timer;
    // Labels for the UI
    protected static livesCount: number = 3;
    protected livesCountLabel: Label;

    // Enemies
    // A list of enemies
    private enemies: Array<AnimatedSprite>;

    dynamicMap: DynamicMap;
    level: string

    // Stuff to end the level and go to the next level
    protected levelEndArea: Rect;
    protected nextLevel: new (...args: any) => GameLevel;
    protected levelEndTimer: Timer;
    protected levelEndLabel: Label;

    // Screen fade in/out for level start and end
    protected levelTransitionTimer: Timer;
    protected levelTransitionScreen: Rect;



    startScene(): void {

        // Do the game level standard initializations
        this.initLayers();
        this.initViewport();
        this.initPlayer();
        this.subscribeToEvents();
        this.addUI();
        this.initializeEnemies();
        // Initialize the timers
        this.respawnTimer = new Timer(1000, () => {
            if (GameLevel.livesCount === 0) {
                this.sceneManager.changeToScene(MainMenu);
            } else {
                this.respawnPlayer();
                this.player.enablePhysics();
                this.player.unfreeze();
            }
        });
        this.levelTransitionTimer = new Timer(500);
        this.levelEndTimer = new Timer(3000, () => {
            // After the level end timer ends, fade to black and then go to the next scene
            this.levelTransitionScreen.tweens.play("fadeIn");
        });


        // Start the black screen fade out
        this.levelTransitionScreen.tweens.play("fadeOut");

        // Initially disable player movement
        Input.disableInput();
    }


    updateScene(deltaT: number) {
        if (Input.isMouseJustPressed(0)) {
            this.updateLevelGeometry(Input.getGlobalMousePosition(),0)
        }
        if (Input.isMouseJustPressed(2)) {
            this.updateLevelGeometry(Input.getGlobalMousePosition(),2)
        }

        // Handle events and update the UI if needed
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            switch (event.type) {

                case Game_Events.PLAYER_ENTERED_LEVEL_END:
                    {

                    }
                    break;

                case Game_Events.LEVEL_START:
                    {
                        // Re-enable controls
                        Input.enableInput();
                    }
                    break;

                case Game_Events.LEVEL_END:
                    {
                        // Go to the next level
                        if (this.nextLevel) {
                            let sceneOptions = {
                                physics: {
                                    groupNames: ["ground", "player", "balloon"],
                                    collisions:
                                        [
                                            [0, 1, 1],
                                            [1, 0, 0],
                                            [1, 0, 0]
                                        ]
                                }
                            }
                            this.sceneManager.changeToScene(this.nextLevel, {}, sceneOptions);
                        }
                    }
                    break;
                case Game_Events.PLAYER_KILLED:
                    {
                        this.respawnPlayer();
                    }

            }
        }
    }

    /**
     * Initialzes the layers
     */
    protected initLayers(): void {
        // Add a layer for UI
        this.addUILayer("UI");

        // Add a layer for players and enemies
        this.addLayer("primary", 1);
    }

    /**
     * Initializes the viewport
     */
    protected initViewport(): void {
        this.viewport.setZoomLevel(2);
    }

    /**
     * Handles all subscriptions to events
     */
    protected subscribeToEvents() {
        this.receiver.subscribe([
            Game_Events.PLAYER_ENTERED_LEVEL_END,
            Game_Events.LEVEL_START,
            Game_Events.LEVEL_END,
            Game_Events.PLAYER_KILLED
        ]);
    }

    /**
     * Adds in any necessary UI to the game
     */
    protected addUI() {

        this.livesCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: new Vec2(500, 30), text: "Lives: " + GameLevel.livesCount });
        this.livesCountLabel.textColor = Color.BLACK;
        this.livesCountLabel.font = "PixelSimple";

        // End of level label (start off screen)
        this.levelEndLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: new Vec2(-300, 200), text: "Level Complete" });
        this.levelEndLabel.size.set(1200, 60);
        this.levelEndLabel.borderRadius = 0;
        this.levelEndLabel.backgroundColor = new Color(34, 32, 52);
        this.levelEndLabel.textColor = Color.WHITE;
        this.levelEndLabel.fontSize = 48;
        this.levelEndLabel.font = "PixelSimple";

        // Add a tween to move the label on screen
        this.levelEndLabel.tweens.add("slideIn", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.posX,
                    start: -300,
                    end: 300,
                    ease: EaseFunctionType.OUT_SINE
                }
            ]
        });

        this.levelTransitionScreen = <Rect>this.add.graphic(GraphicType.RECT, "UI", { position: new Vec2(300, 200), size: new Vec2(600, 400) });
        this.levelTransitionScreen.color = new Color(34, 32, 52);
        this.levelTransitionScreen.alpha = 1;

        this.levelTransitionScreen.tweens.add("fadeIn", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 0,
                    end: 1,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ],
            onEnd: Game_Events.LEVEL_END
        });

        this.levelTransitionScreen.tweens.add("fadeOut", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ],
            onEnd: Game_Events.LEVEL_START
        });
    }

    /**
     * Initializes the player
     */
    protected initPlayer(): void {
        // Add the player
        this.player = this.add.animatedSprite("player", "primary");
        this.player.scale.set(2, 2);
        if (!this.playerSpawn) {
            console.warn("Player spawn was never set - setting spawn to (0, 0)");
            this.playerSpawn = Vec2.ZERO;
        }
        this.player.position.copy(this.playerSpawn);
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(14, 14)));
        this.player.colliderOffset.set(0, 2);
        this.player.addAI(PlayerController, { playerType: PlayerType.PLATFORMER, tilemap: "Main" });

        this.player.setGroup("player");

        this.viewport.follow(this.player);
    }
    
    protected initLevelGeometry(level_id:string): void {
        this.level = level_id
        let tilemapLayers = this.add.tilemap(level_id, GameLevel.DEFAULT_LEVEL_SCALING);
        //We want just the walls!
        this.dynamicMap = <DynamicTilemap>tilemapLayers[1].getItems()[0];
        this.dynamicMap.badNavMesh();
        
        // NOTE: This code isn't useful if tiles constantly change.
        // Add a layer to display the graph
        let gLayer = this.addLayer("graph");
        this.addLayer("graph_debug");
        gLayer.setHidden(true);

        // Create the graph to be overlayed.
        let graph = this.dynamicMap.graph;

        // Add all nodes to our graph
        for (let node of graph.positions) {
            this.add.graphic(GraphicType.POINT, "graph", { position: node.clone() });
        }
        // Add all edges to our graph
        for (let i = 0; i < graph.edges.length; i++) {
            let tmp = graph.edges[i];
            while (tmp !== null) {
                this.add.graphic(GraphicType.LINE, "graph", { start: graph.getNodePosition(i).clone(), end: graph.getNodePosition(tmp.y).clone() });
                tmp = tmp.next;

            }
        }
        this.navManager.addNavigableEntity("navmesh", this.dynamicMap.navmesh);
    }

    // Replace the level geometry.
    protected updateLevelGeometry(position:Vec2,mode:number = 0):void {
        if(mode == 0){
            let colrow_toAdd = this.dynamicMap.getColRowAt(this.player.position)
            let colrow_player = this.dynamicMap.getColRowAt(position)
            if((colrow_player.distanceTo(colrow_toAdd)>=1) && !this.dynamicMap.isTileCollidable(colrow_player.x,colrow_player.y)){
                this.dynamicMap.badAddTile(position);
            }
        }else{
            this.dynamicMap.badRemoveTile(position);
        }
        this.navManager = new NavigationManager()
        this.navManager.addNavigableEntity("navmesh", this.dynamicMap.navmesh);
    }

    initializeEnemies() {
        // Get the enemy data
        const enemyData = this.load.getObject("enemyData");

        // Create an enemies array
        this.enemies = new Array(enemyData.numEnemies);

        let actionsGun = [
            new AttackAction(3, [AI_Statuses.IN_RANGE], [AI_Statuses.REACHED_GOAL]),
            new Move(2, [], [AI_Statuses.IN_RANGE], { inRange: 30 })
        ];


        // Initialize the enemies
        for (let i = 0; i < enemyData.numEnemies; i++) {
            let data = enemyData.enemies[i];

            // Create an enemy
            this.enemies[i] = this.add.animatedSprite(data.type, "primary");
            this.enemies[i].position.set(data.position[0], data.position[1]);
            this.enemies[i].animation.play("IDLE");

            //     // Activate physics
            this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(8, 8)));

            //     if(data.guardPosition){
            data.guardPosition = new Vec2(data.guardPosition[0], data.guardPosition[1]);
            //     }

            //     /*initalize status and actions for each enemy. This can be edited if you want your custom enemies to start out with
            //     different statuses, but dont remove these statuses for the original two enemies*/
            let statusArray: Array<string> = [];

            //     //Vary weapon type and choose actions
            let actions;
            let range;
            actions = actionsGun;
            range = 30;


            let enemyOptions = {
                defaultMode: data.mode,
                patrolRoute: data.route,            // This only matters if they're a patroller
                guardPosition: data.guardPosition,  // This only matters if the're a guard
                health: data.health,
                player1: this.player,
                goal: AI_Statuses.REACHED_GOAL,
                status: statusArray,
                actions: actions,
                inRange: range
            }
            this.enemies[i].scale = (new Vec2(2, 2));
            this.enemies[i].addAI(EnemyAI, enemyOptions);
        }
    }

    /**
     * Initializes the level end area
     */
    protected addLevelEnd(startingTile: Vec2, size: Vec2): void {
        this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, "primary", { position: startingTile.scale(32), size: size.scale(32) });
        this.levelEndArea.addPhysics(undefined, undefined, false, true);
        this.levelEndArea.setTrigger("player", Game_Events.PLAYER_ENTERED_LEVEL_END, null);
        this.levelEndArea.color = new Color(0, 0, 0, 0);
    }

    /**
     * Increments the amount of life the player has
     * @param amt The amount to add to the player life
     */
    protected incPlayerLife(amt: number): void {
        GameLevel.livesCount += amt;
        this.livesCountLabel.text = "Lives: " + GameLevel.livesCount;
        if (GameLevel.livesCount == 0) {
            Input.disableInput();
            this.player.disablePhysics();
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "player_death", loop: false, holdReference: false });
            this.player.tweens.play("death");
        }
    }

    /**
     * Returns the player to spawn
     */
    protected respawnPlayer(): void {
        GameLevel.livesCount = 3;
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "level_music" });
        this.sceneManager.changeToScene(MainMenu, {});
        Input.enableInput();
    }
}