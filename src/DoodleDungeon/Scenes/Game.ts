import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../Wolfie2D/Debug/Debug";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import GameNode, { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import NavigationManager from "../../Wolfie2D/Pathfinding/NavigationManager";
import Scene from "../../Wolfie2D/Scene/Scene";
import Timer from "../../Wolfie2D/Timing/Timer";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import { AI_Statuses, Game_Collectables, Game_Events } from "../Events";
import PlayerController, { PlayerType } from "../Player/PlayerController";
import DynamicMap from "../../Wolfie2D/Nodes/Tilemaps/DynamicMap";
import MainMenu from "./Title";
import EnemyAI from "../Enemies/EnemyAI";
import Move from "../Enemies/EnemyActions/Move";
import AttackAction from "../Enemies/EnemyActions/AttackAction";
import DynamicTilemap from "../../Wolfie2D/Nodes/Tilemaps/DynamicMap";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Wait from './../Enemies/EnemyActions/Wait';
import Charge from './../Enemies/EnemyActions/Charge';
import Layer from "../../Wolfie2D/Scene/Layer";



export default class GameLevel extends Scene {
    LEVEL_NAME:string ="DFLevel1"
    // Level Dimension defaults. Should be consistent throughout all levels.
    
    // Size of tile in actual game.
    static DEFAULT_LEVEL_TILE_SIZE = new Vec2(32, 32);
    // Size of a tile in a tilemap.
    static INPUT_TILE_SIZE = new Vec2(256, 256);
    static LEVEL_SCALING: Vec2 = new Vec2(this.DEFAULT_LEVEL_TILE_SIZE.x/this.INPUT_TILE_SIZE.x,this.DEFAULT_LEVEL_TILE_SIZE.y/this.INPUT_TILE_SIZE.y);
    
    protected playerSpawnColRow: Vec2;
    protected playerSpawn: Vec2;
    protected playerScale: number = 1/16;
    protected player: AnimatedSprite;
    protected cursor: AnimatedSprite;
    protected cursorDisabled:boolean = false;
    // Labels for the UI
    protected livesCount: number = 3;
    protected livesCountLabel: Label;
    
    // Collectible Info. 
    // TODO: Maybe add a class for different Collectables.
    protected Collectibles: Array<AnimatedSprite> = []
    protected pinkFound: number = 0;
    protected whiteFound: number = 0;
    protected numberPink: number = 0;
    protected numberWhite: number = 0;
    protected numberPapers: number = 0;
    protected papersCountLabel: Label;

    protected backgroundSetup: Array<Function> = [];
    // Enemies
    // A list of enemies
    protected enemies: Array<AnimatedSprite>;

    // Special maps specific to the level.
    // Dynamic maps are used for handling pathfinding and collision.
    dynamicMap: DynamicMap;
    level: string

    // Stuff to end the level and go to the next level
    protected levelEndSpots: Array<Rect> = []
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
        this.processLevelData(this.LEVEL_NAME);
        this.viewport.setBounds(0, 0, this.dynamicMap.getDimensions().x*GameLevel.DEFAULT_LEVEL_TILE_SIZE.x, this.dynamicMap.getDimensions().y*GameLevel.DEFAULT_LEVEL_TILE_SIZE.y);
        this.playerSpawn = new Vec2(this.playerSpawnColRow.x*GameLevel.DEFAULT_LEVEL_TILE_SIZE.x, this.playerSpawnColRow.y*GameLevel.DEFAULT_LEVEL_TILE_SIZE.y);
        this.initPlayer(this.playerScale);
        this.subscribeToEvents();
        this.addUI();
        this.initializeEnemies();
        this.cursor = this.addLevelGraphic("cursor","primary",Input.getGlobalMousePosition())
        // Initialize the timers
        this.levelTransitionTimer = new Timer(500);
        this.levelEndTimer = new Timer(50, () => {
            // After the level end timer ends, fade to black and then go to the next scene
            this.levelTransitionScreen.tweens.play("fadeIn");
            // Clear debug log.
            Debug.clearLog();
            Debug.clearCanvas();
        });

        // Start the black screen fade out
        this.levelTransitionScreen.tweens.play("fadeOut");

        // Initially disable player movement
        Input.disableInput();
    }


    updateScene(deltaT: number) {
        // TODO: Add limits to how far the player can click from their body.
        if(!this.cursorDisabled){
            this.cursor.position = this.dynamicMap.getColRowAt(Input.getGlobalMousePosition()).add(new Vec2(1,1)).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE);
            this.cursor.alpha=0.8;
            if (Input.isMouseJustPressed(0)) {
                // Add tile (Left Click)
                this.updateLevelGeometry(Input.getGlobalMousePosition(),0)
            }
            if (Input.isMouseJustPressed(2)) {
                // Remove tile (Right Click)
                this.updateLevelGeometry(Input.getGlobalMousePosition(),2)
            }
        }else{
            this.cursor.alpha=0
        }

        // Handle events and update the UI if needed
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            switch (event.type) {
                case Game_Events.PLAYER_ATTACK:
                    {
                        // GO through all enemies and see if they are in range of the cursor hitbox.
                        // If they are, then attack them.
                        let cursorHitbox = this.cursor.boundary.clone();
                        this.enemies.forEach(enemy => {
                            if (cursorHitbox.overlaps(enemy.boundary)) {
                                // Attack the enemy
                                // TODO: finish this method.
                                (enemy._ai as EnemyAI).damage(1);
                                // enemy.tweens.play("attack");
                                // enemy.tweens.on("attack", () => {
                                //     enemy.tweens.play("idle");
                                // });
                            }
                        });
                    }
                    break;
                case Game_Events.PINK_PAPER_FOUND:
                    {
                        this.pinkFound++;
                        this.collectObject(Game_Collectables.PINK_PAPER,event.data.get("other"))
                    }
                    break;
                case Game_Events.WHITE_PAPER_FOUND:
                    {
                        this.whiteFound++;
                        this.collectObject(Game_Collectables.WHITE_PAPER,event.data.get("other"))
                    }
                    break;
                case Game_Events.PLAYER_ENTERED_LEVEL_END:
                    {
                        // Check if the player has collected all the collectibles.
                        if (this.pinkFound == this.numberPink && this.whiteFound == this.numberWhite) {
                            Input.disableInput();
                            // If so, start the level end timer
                            this.levelEndTimer.start();
                        }
                    }
                    break;
                case Game_Events.PLAYER_OUT_OF_BOUNDS:
                    {
                        this.incPlayerLife(-1)
                        if (this.livesCount <= 0) {
                            this.goToMenu()
                        } 
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
                        }else{
                            this.goToMenu()
                        }
                    }
                    break;
                case Game_Events.PLAYER_KILLED:
                    {
                        this.goToMenu()
                    }

            }
        }
    }
    get PlayerSpawn(): Vec2 {
        return this.playerSpawn;
    }
    /**
     * Initialzes the layers
     */
    protected initLayers(): void {
        // Add a layer for UI
        this.addUILayer("UI");
        // Add a layer for players and enemies
        this.addLayer("primary", 2);
        
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
            Game_Events.PLAYER_OUT_OF_BOUNDS,
            Game_Events.PINK_PAPER_FOUND,
            Game_Events.WHITE_PAPER_FOUND,
            Game_Events.LEVEL_START,
            Game_Events.LEVEL_END,
            Game_Events.PLAYER_KILLED,
            Game_Events.PLAYER_ATTACK,
            Game_Events.PLAYER_ATTACK_FINISHED
        ]);
    }

    /**
     * Adds in any necessary UI to the game
     */
    protected addUI() {
        // Lives Count Label. TODO: Make this using sprites.)
        this.livesCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: new Vec2(100, 30), text: "Lives: " + this.livesCount });
        this.livesCountLabel.textColor = Color.BLACK;
        this.livesCountLabel.font = "PixelSimple";
        // Prompt for paper.
        this.papersCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: new Vec2(100, 90), text: "Find some paper!" });
        this.papersCountLabel.textColor = Color.BLACK;
        this.papersCountLabel.font = "PixelSimple";

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
        
        this.levelTransitionScreen = <Rect>this.add.graphic(GraphicType.RECT, "UI", { position: new Vec2(2000, 2000), size: new Vec2(4000, 4000) });
        this.levelTransitionScreen.color = new Color(0, 0,0);
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
    protected initPlayer(playerScale:number=1): void {
        // Add the player
        this.player = this.add.animatedSprite("player", "primary");
        // Scale player to the appropriate size.
        this.player.scale.set(playerScale, playerScale);
        if (!this.playerSpawn) {
            console.warn("Player spawn was never set - setting spawn to (0, 0)");
            this.playerSpawn = Vec2.ZERO;
        }
        this.player.position.copy(this.playerSpawn);
        this.viewport.follow(this.player);
        // TODO: update AABB for Finn.
        this.player.addPhysics(this.player.boundary.clone());
        this.player.colliderOffset.set(0, 2);
        this.player.addAI(PlayerController, { playerType: PlayerType.PLATFORMER, tilemap: "Main" });
        this.player.setGroup("player");
        this.livesCount = 3
    }
    
    // Reads in a tilemap, and does some function for each tile.
    protected processTileLayer(map: OrthogonalTilemap, process :Function) {
        // Comb through every single tile in the tilemap and check if it is nonzero.
        for(let i = 0; i < map.getDimensions().x; i+=1) {
            for(let j = 0; j < map.getDimensions().y; j+=1) {
                let startTile = new Vec2(i, j)
                let tile = map.getTileAtRowCol(startTile)
                if(tile !== 0) {
                    process(tile,i,j)
                }
            }
        }
    }
    protected tileToGroup(tileInfo:number):number {
        //    TODO: do a better job of this.
       let PINK_PAPER_TILES = [16+1,17+1,24+1,25+1]
       let WHITE_PAPER_TILES = [6+1,7+1,14+1,15+1]
       if(PINK_PAPER_TILES.includes(tileInfo)) {
            return Game_Collectables.PINK_PAPER
       } else if(WHITE_PAPER_TILES.includes(tileInfo)) {
            return Game_Collectables.WHITE_PAPER
       } else { 
            return 0
       }
    }
    protected addLevelGraphic(name:string, layer:string="primary",position:Vec2, size:Vec2 = new Vec2(1,1)) {
        let toAdd = this.add.animatedSprite(name, layer);
        toAdd.position.copy(position)
        toAdd.scale = GameLevel.LEVEL_SCALING.clone().mult(size)
        toAdd.animation.playIfNotAlready("idle",true)
        return toAdd
    }
    protected processLevelData(level_id:string): void {
        this.level = level_id
        let tilemapLayers = this.add.tilemap(level_id, GameLevel.LEVEL_SCALING);
        //Get only solid layer.
        // TODO: add support for multiple solid layers.
        let solidLayer = null
        let collectibleLayer = null
        let animatedLayer = null
        let backgroundLayer :Layer = null
        for(let i =0;i< tilemapLayers.length;  i+=1) {
            let name = tilemapLayers[i].getName()
            if(name == "Platforms") {
                solidLayer = tilemapLayers[i]
            } else if (name == "Collectables") {
                collectibleLayer = tilemapLayers[i]
            } else if (name == "Animated"){
                animatedLayer = tilemapLayers[i]
            } else if (name == "Background") {
                backgroundLayer = tilemapLayers[i]
            }
        }

        // Go through all background setup functions.
        this.backgroundSetup.forEach((func) => {
            func(backgroundLayer)
        })
        // backgroundLayer.addNode()
        if(animatedLayer!== null) {
            let animatedTiles = <OrthogonalTilemap>animatedLayer.getItems()[0]
            this.processTileLayer(animatedTiles, (tile:number,i:number,j:number)=>{
                // let startTile = new Vec2(i+0.5, j+0.5)
                switch(tile){
                    case 0:
                        break;
                    default:
                        this.addLevelEnd(new Vec2(i+0.5,j+0.5))
                        animatedTiles.alpha = 1
                        break;
                }
            });
        }
        this.dynamicMap = <DynamicTilemap>solidLayer.getItems()[0];
        this.dynamicMap.badNavMesh();
        
        // NOTE: This code isn't useful if tiles constantly change.
        // Add a layer to display the graph
        // let gLayer = this.addLayer("graph");
        // this.addLayer("graph_debug");
        // gLayer.setHidden(true);

        // Create the graph to be overlayed.
        // let graph = this.dynamicMap.graph;

        // // Add all nodes to our graph
        // for (let node of graph.positions) {
        //     this.add.graphic(GraphicType.POINT, "graph", { position: node.clone() });
        // }
        // // Add all edges to our graph
        // for (let i = 0; i < graph.edges.length; i++) {
        //     let tmp = graph.edges[i];
        //     while (tmp !== null) {
        //         this.add.graphic(GraphicType.LINE, "graph", { start: graph.getNodePosition(i).clone(), end: graph.getNodePosition(tmp.y).clone() });
        //         tmp = tmp.next;

        //     }
        // }
        this.navManager.addNavigableEntity("navmesh", this.dynamicMap.navmesh);

        if(collectibleLayer !== null){

            let collectibles = <OrthogonalTilemap>collectibleLayer.getItems()[0]
            this.processTileLayer(collectibles, (tile:number,i: number,j:number) => {
                let startTile = new Vec2(i+0.5, j+0.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE)
                let toAdd = null    
                let trigger = null
                tile = this.tileToGroup(tile)
                switch(tile){
                    // TODO: Make a proper enum to handle this instead of hardcoding.
                    case Game_Collectables.WHITE_PAPER:
                        trigger = Game_Events.WHITE_PAPER_FOUND
                        toAdd = this.addLevelGraphic("white_paper", "primary", startTile)
                        this.numberWhite+=1
                        this.numberPapers+=1
                        break;
                    case Game_Collectables.PINK_PAPER:
                        trigger = Game_Events.PINK_PAPER_FOUND
                        toAdd = this.addLevelGraphic("pink_paper", "primary", startTile)
                        this.numberPink+=1
                        this.numberPapers+=1
                        break;
                    default:
                        break;
                }
                if(tile != 0){
                    toAdd.addPhysics(toAdd.boundary, undefined, false, true);
                    toAdd.setTrigger("player",trigger, null);
                    this.Collectibles.push(toAdd)
                    // remove the tile from the map, we parsed it.
                    collectibles.setTileAtRowCol(new Vec2(i,j),0)
                }
            }) 
        }
    }

    // Replace the level geometry when a tile is added/deleted.
    protected updateLevelGeometry(position:Vec2,mode:number = 0):void {
        // Check if the click position if out of bounds of the level.
        if(this.dynamicMap.getTileAtWorldPosition(position) == -1) {
            return;
        }
        if(mode == 0){
            let colrow_player = this.dynamicMap.getColRowAt(this.player.position)
            let colrow_toAdd = this.dynamicMap.getColRowAt(position)
            // Check if the block is not overalapping with the current enemies.
            for(let i = 0;i<this.enemies.length;i++){
                let colrow_enemy = this.dynamicMap.getColRowAt(this.enemies[i].position)
                if(colrow_enemy.distanceTo(colrow_toAdd) < 1 )return
            }
            if((colrow_player.distanceTo(colrow_toAdd)>=1) && !this.dynamicMap.isTileCollidable(colrow_toAdd.x,colrow_toAdd.y)){
                this.dynamicMap.badAddTile(position,51);
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

        // Initialize the enemies
        for (let i = 0; i < enemyData.numEnemies; i++) {
            let data = enemyData.enemies[i];

            // Create an enemy

            // TODO: CHANGE THIS
            // this.enemies[i] = this.add.animatedSprite(data.type, "primary");
            this.enemies[i] = this.add.animatedSprite("gun_enemy", "primary");
            
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

            // Vary weapon type and choose actions
            let actions;
            let range;

            if (data.type === "melee_enemy"){
                let actionMelee = [
                    new AttackAction(3, [AI_Statuses.IN_RANGE], [AI_Statuses.REACHED_GOAL]),
                    new Move(2, [], [AI_Statuses.IN_RANGE], { inRange: 30 })
                ];
                actions = actionMelee;
                range = 30;
            }
            else if (data.type === "ranged_enemy") {
                let actionRanged = [
                    new AttackAction(3, [AI_Statuses.IN_RANGE], [AI_Statuses.REACHED_GOAL]),
                    new Move(2, [], [AI_Statuses.IN_RANGE], { inRange: 100 })
                ];
                actions = actionRanged;
                range = 100;
            }
            else if (data.type === "charging_enemy") {
                /** MOVE => WAIT => CHARGE => ATTACK */
                let actionCharging = [
                    new AttackAction(1, [AI_Statuses.IN_RANGE], [AI_Statuses.REACHED_GOAL]),
                    new Move(2, [], [AI_Statuses.MOVE_DONE], { inRange: 100 }),
                    new Wait(3, [AI_Statuses.MOVE_DONE], [AI_Statuses.WAIT_DONE], { waitTime: 1000 }),
                    new Charge(4, [AI_Statuses.WAIT_DONE], [AI_Statuses.IN_RANGE], { chargeTime: 1000 })
                ]
                actions = actionCharging;
                range = 30;
            }

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

    protected addLevelEnd(startingTile: Vec2, size: Vec2 = new Vec2(1,1)): void {
        let levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, "primary", { position: startingTile.scale(GameLevel.DEFAULT_LEVEL_TILE_SIZE.x), size: size.scale(GameLevel.DEFAULT_LEVEL_TILE_SIZE.x)});
        levelEndArea.addPhysics(undefined, undefined, false, true);
        levelEndArea.setTrigger("player", Game_Events.PLAYER_ENTERED_LEVEL_END, null);
        levelEndArea.color = new Color(0, 0, 0, 0);
        this.levelEndSpots.push(levelEndArea);
    }


    /**
     * Increments the amount of life the player has
     * @param amt The amount to add to the player life
     */
    protected incPlayerLife(amt: number): void {
        this.livesCount += amt;
        this.livesCountLabel.text = "Lives: " + this.livesCount;
        if (this.livesCount <= 0) {
            Input.disableInput();
            this.player.disablePhysics();
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "player_death", loop: false, holdReference: false });
            this.player.tweens.play("death");
        }
    }

    protected collectObject(item_type: Game_Collectables,collectableID:number): void {
        // disable the trigger.
        let object = this.sceneGraph.getNode(collectableID)
        // find the object given id.
        object.disablePhysics()
        this.remove(object)
        // Check if collectable is a paper.
        if(item_type == Game_Collectables.PINK_PAPER || item_type == Game_Collectables.WHITE_PAPER){
            this.papersCountLabel.text = "Papers Found: " + (this.whiteFound+this.pinkFound) + "/" + (this.numberPapers);
            // If enough papers were found, then  remove the barrier to the next page.
            if(this.whiteFound+this.pinkFound == this.numberPapers){
                // Do something here:

            }
        }
    }

    /**
     * Returns the player to start of level.
     */
    protected respawnPlayer(): void {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "level_music" });
    }

    protected goToMenu(): void{
        Input.enableInput();
        this.sceneManager.changeToScene(MainMenu);
    }
}

