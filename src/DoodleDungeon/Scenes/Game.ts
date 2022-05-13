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
import { AI_Statuses, Game_Collectables, Game_Events, Tileset_Names } from "../Events";
import PlayerController, { PlayerType } from "../Player/PlayerController";
import DynamicMap from "../../Wolfie2D/Nodes/Tilemaps/DynamicMap";
import EnemyAI from "../Enemies/EnemyAI";
import Move from "../Enemies/EnemyActions/Move";
import AttackAction from "../Enemies/EnemyActions/AttackAction";
import DynamicTilemap from "../../Wolfie2D/Nodes/Tilemaps/DynamicMap";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Wait from './../Enemies/EnemyActions/Wait';
import Charge from './../Enemies/EnemyActions/Charge';
import Layer from "../../Wolfie2D/Scene/Layer";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Home from "./Home";



export default class GameLevel extends Scene {
    /**
     * Data specific to all level maps.
     */
    // Level Dimension defaults. Should be consistent throughout all levels.  
    // Size of tile in actual game.
    static DEFAULT_LEVEL_TILE_SIZE = new Vec2(32, 32);
    // Size of a tile in a tilemap.
    static INPUT_TILE_SIZE = new Vec2(256, 256);
    static LEVEL_SCALING: Vec2 = new Vec2(this.DEFAULT_LEVEL_TILE_SIZE.x / this.INPUT_TILE_SIZE.x, this.DEFAULT_LEVEL_TILE_SIZE.y / this.INPUT_TILE_SIZE.y);
    static LEVEL_PADDING: Vec2 = this.DEFAULT_LEVEL_TILE_SIZE.clone().mult(new Vec2(3, 5));

    LEVEL_NAME: string = "DFLevel1"
    // Dynamic maps are used for handling pathfinding and collision.
    dynamicMap: DynamicMap;
    protected paused: boolean = false;
    protected gameEnd: boolean = false;


    /**
     * Variables related to cursor.
     */
    static MAX_BLOCKS: number = 25;
    protected placementLeft: number = GameLevel.MAX_BLOCKS;
    protected placementRange: number = 5;
    protected cursor: AnimatedSprite;
    protected cursorVisible: boolean = true;
    protected cursorDisabled: boolean = false;

    /**
     * Handles all player information.
     */
    protected playerSpawnColRow: Vec2;
    protected playerSpawn: Vec2;
    protected playerScale: number = 1 / 16;
    protected player: AnimatedSprite;

    /**
     * Enemy variables.
     */
    protected enemies: Array<AnimatedSprite>;

    /**
     * Labels for the UI
     */
    protected livesCount: number = 3;
    protected livesCountLabel: Label;
    protected papersCountLabel: Label;
    protected levelEndLabel: Label;

    // Curtain to do screen fade in/out
    protected levelTransitionScreen: Rect;

    // TODO: Move health bar to a separate class.
    // protected healthBar: Array<Sprite> = [];
    protected inkBar: Array<Sprite> = [];
    protected menuButton: Button
    protected pauseButton: Button

    // Collectible Info. 
    // TODO: Maybe add a class for different Collectables.
    protected paperRequired: boolean = true;
    protected Collectibles: Array<AnimatedSprite> = []
    protected pinkFound: number = 0;
    protected whiteFound: number = 0;
    protected numberPink: number = 0;
    protected numberWhite: number = 0;
    protected numberPapers: number = 0;
    /** switches. */
    //Switch sprite| Blocks affected<col,row> | starting switch state | block solid ID
    //true means blocks are solid.
    protected switches:Array<[Array<AnimatedSprite>,Array<Vec2>,boolean,number]> = []

    //Other levels may require a different win condition. If fufilled, that Level.ts will end the level
    protected otherWinCondition: boolean = true;

    //Timer used to determine time it takes to finish the level.
    protected levelTimer: Timer;
    //Timer that triggers when end of level is reached.
    protected levelEndTimer: Timer;

    // various methods for adding UI elements to the background scene.
    protected backgroundSetup: Array<Function> = [];

    // Stuff to end the level and go to the next level
    protected levelEndSpots: Array<Rect> = []
    protected nextLevel: new (...args: any) => GameLevel;
    protected home: new (...args: any) => GameLevel;
    protected compass: Sprite;
    static firstLoad: boolean = true;
    protected tile_drawn_count: number = 0;
    protected tile_total_count: number = 0;
    protected REQUIRED_TILES: Array<{"tiles": Array<Vec2>,"count":number, "antiTiles": Array<Vec2>,"completed":boolean}> = [];
    loadScene(loadUI?:boolean): void {
        if(GameLevel.firstLoad){
            GameLevel.firstLoad = false;
            this.load.spritesheet("player", "game_assets/spritesheets/DoodleFinn/DoodleFinn-Sprite.json");
            this.load.spritesheet("melee_enemy", "game_assets/spritesheets/FlyEnemy/FlyEnemy.json")
            this.load.spritesheet("charging_enemy", "game_assets/spritesheets/ChargeEnemy/ChargeEnemy.json")
            
            this.load.spritesheet("pink_paper", "game_assets/spritesheets/pink_paper.json");
            this.load.spritesheet("white_paper", "game_assets/spritesheets/white_paper.json");
            this.load.spritesheet("cursor", "game_assets/spritesheets/cursor.json");
            this.load.spritesheet("switch", "game_assets/spritesheets/DEBUG_SWITCH.json");

            this.load.image("drawnTile", "game_assets/spritesheets/Filled_Tile.png");
            this.load.image("empty_block", "game_assets/spritesheets/empty_block.png");
            this.load.image("empty_locked_block", "game_assets/spritesheets/empty_locked_block.png");
            this.load.audio("level_music", "game_assets/music/doodlefinn_level_music.wav")
            this.load.audio("player_hit_enemy", "game_assets/sounds/coin.wav")
            this.load.audio("jump", "game_assets/sounds/jump.wav")
            this.load.audio("player_death", "game_assets/sounds/death.wav")
            this.load.audio("player_hurt", "game_assets/sounds/zap.wav")
            this.load.audio("scribble", "game_assets/sounds/scribble.wav")
            this.load.audio("erase", "game_assets/sounds/erase.wav")
            this.load.audio("paper_pickup", "game_assets/sounds/paper_pickup.wav")
            this.load.audio("toggle_switch", "game_assets/sounds/toggle_switch.wav")
            this.load.audio("puzzle-unlocked", "game_assets/sounds/puzzle-unlocked.wav")  

        }
        //Stuff used when you are in a level
        if(loadUI){
            this.load.image("pencil", "game_assets/spritesheets/Pencil.png");
            this.load.image("heart", "game_assets/spritesheets/Full_Heart.png");
            this.load.image("half_heart", "game_assets/spritesheets/Half_Heart.png");
            this.load.image("background_health_bar", "game_assets/spritesheets/HP_Background.png");
            this.load.image("Compass", "game_assets/spritesheets/Compass.png");
        }
    }


    gameEnded(): boolean {
        return this.gameEnd;
    }

    unloadCommon(): void {
        this.load.keepSpritesheet("player");
        this.load.keepSpritesheet("melee_enemy")
        this.load.keepSpritesheet("charging_enemy")
        
        this.load.keepSpritesheet("pink_paper");
        this.load.keepSpritesheet("white_paper");
        this.load.keepSpritesheet("cursor");
        this.load.keepSpritesheet("switch");
        this.load.keepImage("drawnTile");
        this.load.keepImage("empty_block");
        this.load.keepImage("empty_locked_block");
        
        // //Stuff used when you are in a level
        // if(loadUI){
        //     this.load.image("pencil", "game_assets/spritesheets/Pencil.png");
        //     this.load.image("heart", "game_assets/spritesheets/Full_Heart.png");
        //     this.load.image("half_heart", "game_assets/spritesheets/Half_Heart.png");
        //     this.load.image("Compass", "game_assets/spritesheets/Compass.png");
        // }
        this.load.keepAudio("level_music")
        this.load.keepAudio("player_hit_enemy")
        this.load.keepAudio("jump")
        this.load.keepAudio("player_death")
        this.load.keepAudio("player_hurt")
        this.load.keepAudio("scribble")
        this.load.keepAudio("erase")
        this.load.keepAudio("paper_pickup")
        this.load.keepAudio("toggle_switch")
        this.load.keepAudio("puzzle-unlocked")  
    }
    startScene(): void {
        this.gameEnd = false;
        //This is not a good way to do this. TODO: Fix this.
        this.levelTimer = new Timer(1000 * 100000);
        this.levelTimer.start();
        // Do the game level standard initializations
        this.initLayers();
        this.initViewport();
        this.processLevelData(this.LEVEL_NAME);
        this.viewport.setBounds(
            -GameLevel.LEVEL_PADDING.x,
            -GameLevel.LEVEL_PADDING.y,
            this.dynamicMap.getDimensions().x * GameLevel.DEFAULT_LEVEL_TILE_SIZE.x + GameLevel.LEVEL_PADDING.x,
            this.dynamicMap.getDimensions().y * GameLevel.DEFAULT_LEVEL_TILE_SIZE.y + GameLevel.LEVEL_PADDING.y);
        this.playerSpawn = new Vec2(
            this.playerSpawnColRow.x * GameLevel.DEFAULT_LEVEL_TILE_SIZE.x,
            this.playerSpawnColRow.y * GameLevel.DEFAULT_LEVEL_TILE_SIZE.y);
        this.initPlayer(this.playerScale);
        this.addUI();
        this.subscribeToEvents();
        
        this.initializeEnemies();
        
        this.cursor = this.addLevelAnimatedSprite("cursor", "primary", Input.getGlobalMousePosition())
        // Initialize the timers
        this.levelEndTimer = new Timer(10, () => {
            // After the level end timer ends, fade to black and then go to the next scene
            this.levelTransitionScreen.tweens.play("fadeIn");
            // Clear debug log.
            Debug.clearLog();
            Debug.clearCanvas();
        });

        // Have the curtains fade out.
        this.levelTransitionScreen.tweens.play("fadeOut");

        // Initially disable player movement
        Input.disableInput();
    }

    /**
     * Handles all subscriptions to events
     */
    protected subscribeToEvents() {
        this.receiver.subscribe([
            Game_Events.PLAYER_ENTERED_LEVEL_END,
            Game_Events.PLAYER_LOSE_LIFE,
            Game_Events.PINK_PAPER_FOUND,
            Game_Events.WHITE_PAPER_FOUND,
            Game_Events.LEVEL_START,
            Game_Events.LEVEL_END,
            Game_Events.PLAYER_KILLED,
            Game_Events.PLAYER_HURT,
            Game_Events.PLAYER_ATTACK,
            Game_Events.PLAYER_ATTACK_FINISHED,
            Game_Events.GAME_PAUSE,
            Game_Events.GAME_SHOW_IMAGE
        ]);
    }

    updateScene(deltaT: number) {
        if(!this.gameEnd) {
            if(this.compass !== undefined){
            // find the nearest collectable.
                let minCollectable: AnimatedSprite = null;
                let minDistance: number = Number.MAX_VALUE;
                for(let collectable of this.Collectibles){
                        if(collectable.alpha > 0){
                            let distance = collectable.position.distanceTo(this.player.position);
                            
                            if(minCollectable === null || distance < minDistance){
                                minCollectable = collectable;
                                minDistance = distance;
                            }
                        }

                }
                if(minCollectable !== null){
                    this.compass.visible = true;
                    this.compass.rotation+=1;
                    let direction =  this.player.position.dirTo(minCollectable.position);
                    let angle =Vec2.RIGHT.angleToCCW(direction)-Math.PI/2;
                    // console.log(angle)
                    this.compass.rotation = angle;
                    this.compass.position = this.player.position.clone().add(direction.scale(this.compass.boundary.hh*2.05)); 
    
                }else{
                    this.compass.visible = false;
                }

            }
            // console.log(Input.isMousePressed(0) + "|"+ Input.isMousePressed(2));
            if(this.pauseButton.boundary.containsPoint(Input.getMousePosition())){
                this.pauseButton.alpha = 1;
            }else{
                this.pauseButton.alpha = 0.1;
            }
            if (this.pauseButton.visible && (Input.isKeyJustPressed("p") || Input.isKeyJustPressed("escape"))) {
                this.pauseButton.onClick()
            }
            let modified = false;
            //check if the "e" key is pressed.
            if (Input.isKeyJustPressed("e")) {
                //check through all switches.
                for(let i = 0; i < this.switches.length; i++){
                    let toggles = this.switches[i][0];
                    let toggled = false;
                    for(let j = 0; j < toggles.length; j++){
                        if(this.player.boundary.overlaps(toggles[j].boundary)){
                            toggled = true;
                            break;
                        }
                    }
                    if(toggled){
                        //play the sound.
                        this.emitter.fireEvent(GameEventType.PLAY_SOUND,{key: "toggle_switch", loop: false, holdReference: false});
                        this.toggleSwitch(i);
                    }
                }
            }
            // this.updateHealthBar();
            if(this.inkBar.length  == GameLevel.MAX_BLOCKS){
                //show the first placementLeft items in inkbar.
                for (let i = 0; i < this.placementLeft; i++) {

                    this.inkBar[i].visible = true;
                }
                //hide the rest of the inkbar.
                for (let i = this.placementLeft; i < GameLevel.MAX_BLOCKS; i++) {
                    this.inkBar[i].visible = false;
                }
            }
            /**
             * Handle Cursor Actions.
             */
            let mousePosition = Input.getMousePosition();
            let canvasInfo = this.viewport.getHalfSize().clone().scale(2);
            this.cursorVisible =  (mousePosition.x >= 0 && mousePosition.y >= 0 &&
                                    mousePosition.x <= canvasInfo.x && mousePosition.y <= canvasInfo.y);

            this.cursor.position = this.dynamicMap.getColRowAt(Input.getGlobalMousePosition()).add(new Vec2(0.5, 0.5)).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE);
            if (!this.cursorDisabled && this.cursorVisible && !this.paused &&!this.pauseButton.boundary.containsPoint(mousePosition)) {
                this.cursor.alpha = 1;
                if(Input.isMousePressed(0) != Input.isMousePressed(2)){
                    // TODO: Add limits to how far the player can click from their body.
                    if (Input.isMousePressed(0)) {
                        // Add tile (Left Click)
                        modified = modified || this.updateLevelGeometry(Input.getGlobalMousePosition(), 0)
                    }
                    if (Input.isMousePressed(2)) {
                        // Remove tile (Right Click)
                        modified = modified || this.updateLevelGeometry(Input.getGlobalMousePosition(), 2)
                    }
                }
            } else {
                this.cursor.alpha = 0;
            }
            if(modified){
                this.otherWinCondition = this.checkDrawing();
            }
        }else{
            //check for mouse click.
            if(Input.isMouseJustPressed()){
                this.emitter.fireEvent(Game_Events.LEVEL_END);
            }
        }

        // Handle events and update the UI if needed
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            switch (event.type) {
                case Game_Events.GAME_PAUSE:
                    {
                        this.paused = !this.paused
                        this.menuButton.visible = this.paused
                        this.levelTransitionScreen.alpha = (this.paused) ? 1 : 0;
                        //pause the game
                        if (this.paused) {
                            //freeze the game.
                            this.getLayer("primary").disable();
        
                            this.player.freeze();
                            //iterate through all enemies and freeze them.
                            this.enemies.forEach(enemy => {
                                enemy.freeze();
                            });

                        }else{
                            //unfreeze the game.
                            this.getLayer("primary").enable();
                            if((this.player._ai as PlayerController).health > 0){
                                this.player.unfreeze();
                            }
                            //iterate through all enemies and freeze them.
                            this.enemies.forEach(enemy => {
                                enemy.unfreeze();
                            });
                        }
                    }
                    break;
                case Game_Events.PLAYER_ATTACK:
                    {
                        // Go through all enemies and see if they are in range of the cursor hitbox.
                        // If they are, then attack them.
                        // TODO: make attacking cleaner.
                        let cursorHitbox = this.cursor.boundary.clone();
                        if (this.enemies != null) {
                            this.enemies.forEach(enemy => {
                                if((enemy._ai as EnemyAI).health  <=0) return;
                                if (cursorHitbox.overlaps(enemy.boundary)) {
                                    //check if there is a line of sight between the player and the enemy.
                                    let lineOfSight = this.dynamicMap.isVisible(this.player.position, enemy.position);
                                    if(lineOfSight){
                                        // Attack the enemy
                                        // TODO: finish this method.
                                        (enemy._ai as EnemyAI).damage(1);

                                        this.emitter.fireEvent(GameEventType.PLAY_SOUND, 
                                            {key: "player_hit_enemy", loop: false, holdReference: false});

                                        // enemy.tweens.play("attack");
                                        // enemy.tweens.on("attack", () => {
                                        //     enemy.tweens.play("idle");
                                        // });
                                        }
                                }
                            });
                        }
                    }
                    break;
                case Game_Events.PINK_PAPER_FOUND:
                    {
                        this.pinkFound++;
                        this.collectObject(Game_Collectables.PINK_PAPER, event.data.get("other"))
                    }
                    break;
                case Game_Events.WHITE_PAPER_FOUND:
                    {
                        this.whiteFound++;
                        this.collectObject(Game_Collectables.WHITE_PAPER, event.data.get("other"))
                    }
                    break;
                case Game_Events.PLAYER_ENTERED_LEVEL_END:
                    {
                        // Check if the player has collected all the collectibles.
                        // TODO: make this less rigid.
                        if(this.levelEndTimer.isStopped() && !this.gameEnd){
                            if ((!this.paperRequired || this.pinkFound == this.numberPink && this.whiteFound == this.numberWhite) && this.otherWinCondition) {
                                this.gameEnd = true;
                                //disable pause button.
                                this.pauseButton.visible = false;
                                Input.disableMouseInput();
                                this.levelEndTimer.start();
                            }
                        }
                    }
                    break;
                case Game_Events.PLAYER_HURT:
                    {
                        this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "player_hurt", loop: false, holdReference: false });
                        // this.updateHealthBar();
                    }
                    break;
                case Game_Events.PLAYER_LOSE_LIFE:
                    {
                        this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "player_death", loop: false, holdReference: false });
                        if (!this.gameEnd) {
                            this.incPlayerLife(-1)
                            if (this.livesCount <= 0) {
                                this.goToMenu()
                            }
                        }
                    }
                    break;
                case Game_Events.PLAYER_KILLED:
                    {
                        this.goToMenu()
                    }
                    break;
                case Game_Events.LEVEL_START:
                    {
                        // Re-enable controls
                        Input.enableInput();
                        this.viewport.enableStaticBoundary();
                        this.viewport.setStaticBoundary(new Vec2(200,100));
                    }
                    break;
                case Game_Events.GAME_SHOW_IMAGE:
                    {
                        
                        //freeze the game.
                        this.getLayer("primary").disable();

                        this.player.freeze();
                        //iterate through all enemies and freeze them.
                        this.enemies.forEach(enemy => {
                            enemy.freeze();
                        });
                        Input.enableMouseInput();
                        this.levelTimer.pause();
                        this.show_art();
                    }
                    break;
                case Game_Events.LEVEL_END:
                    {
                        this.levelTimer.pause();
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
                        } else {
                            this.goToMenu()
                        }
                    }
                    break;
            }
        }
    }

    protected show_art() {
        throw new Error("Method not implemented.");
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
        this.viewport.setZoomLevel(1.1);
    }

    /**
     * Adds in any necessary UI to the game
     */
    protected addUI() {
        // Add in 
        try{
            let HP_FRACTION_SCALING = new Vec2(0.18,0.16);
            //Add in background health.
            let backgroundSprite = this.add.sprite("background_health_bar","UI");
            // backgroundSprite.rotation = -Math.PI/2;
            //rescale the sprite to HP_FRACTION_SCALING of the viewport's dimensions, and put it in the top left corner.

            let new_dimensions = this.viewport.getHalfSize().clone().mult(HP_FRACTION_SCALING)
            let scale_factor = new_dimensions.clone().div(backgroundSprite.boundary.getHalfSize().clone());
            backgroundSprite.scale = scale_factor;
            backgroundSprite.position = new_dimensions.clone();
            backgroundSprite.positionY = this.viewport.getHalfSize().y*2- backgroundSprite.boundary.getHalfSize().y;
            // backgroundSprite.
        }catch{
            console.log("No background health bar");
        }
        // Lives Count Label. TODO: Make this using sprites.)
        this.livesCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: new Vec2(60, this.viewport.getHalfSize().y*2 - 65), text: "Lives: " + ((Home.unlimitedLives)?"∞":this.livesCount.toString()) });
        this.livesCountLabel.textColor = Color.RED;
        this.livesCountLabel.backgroundColor = new Color(32, 32, 32, 0);
        this.livesCountLabel.font = "PixelSimple";
        (this.player._ai as PlayerController).initializeHealthBar();

        // this.setupHealthBar();
        // this.updateHealthBar();
        this.setupInkBar();
        // Prompt for paper.
        this.papersCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: new Vec2(110, 60), text: "Find some paper!" });
        this.papersCountLabel.textColor = Color.RED;
        this.papersCountLabel.backgroundColor = new Color(32, 32, 32, 0.5);
        this.papersCountLabel.font = "PixelSimple";

        /*   
        NOTE: This is an unused feature, can be used later on.


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
        this.levelEndLabel.visible = false;
        */

        this.levelTransitionScreen = <Rect>this.add.graphic(GraphicType.RECT, "UI", { position: new Vec2(2000, 2000), size: new Vec2(4000, 4000) });
        this.levelTransitionScreen.color = new Color(11, 17, 38);
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
            onEnd: Game_Events.GAME_SHOW_IMAGE
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


        // Pause button setup.
        let halfViewport = this.viewport.getHalfSize();
        let pauseButton = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", { position: new Vec2(halfViewport.x * 2-34, halfViewport.y*2-34), text: "Pause" });
        pauseButton.backgroundColor = Color.RED;
        pauseButton.borderColor = Color.BLACK;
        pauseButton.borderRadius = 10;
        pauseButton.setPadding(new Vec2(3, 3));
        pauseButton.scale = new Vec2(0.3, 0.3);
        pauseButton.font = "PixelSimple";
        pauseButton.backgroundColor.a = 0.3;
        pauseButton.borderColor.a = 0.3;
        pauseButton.textColor.a = 0.5;
        pauseButton.onEnter = () => {
            pauseButton.backgroundColor.a = 1;
            pauseButton.borderColor.a = 1;
            pauseButton.textColor.a = 1;
        }
        pauseButton.onLeave = () => {
            pauseButton.backgroundColor.a = 0.6;
            pauseButton.borderColor.a = 0.6;
            pauseButton.textColor.a = 0.6;
        }
        
        pauseButton.onClick = () => {
            this.levelTransitionScreen.alpha = 0;
            this.emitter.fireEvent(Game_Events.GAME_PAUSE);
        }
        this.pauseButton = pauseButton
        // this.pauseButton.alpha = 0.5;

        // Menu button setup.
        let menuBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", { position: new Vec2(halfViewport.x, halfViewport.y), text: "Menu" });
        menuBtn.backgroundColor = Color.BLACK;
        menuBtn.borderColor = Color.WHITE;
        menuBtn.borderRadius = 0;
        menuBtn.setPadding(new Vec2(10, 15));
        pauseButton.scale = new Vec2(0.5, 0.5);
        menuBtn.font = "PixelSimple";
        menuBtn.onClick = () => {
            if (menuBtn.visible) {
                this.goToMenu();
            }
        }
        menuBtn.visible = false
        this.menuButton = menuBtn
    }

    protected setupInkBar(): void {
        let location = new Vec2(this.viewport.getView().hw-140,45);
        let scale = new Vec2(0.1,0.1);
        // Create up to 10 hearts on the UI layer.
        try {
            //add ink bar.
            this.addLevelBackgroundImage("pencil", "UI", new Vec2(this.viewport.getView().hw,45), new Vec2(4.4,4),0.6);
            for (let i = 0; i < GameLevel.MAX_BLOCKS; i++) {
                this.inkBar.push(this.addLevelBackgroundImage("drawnTile", "UI", location, scale));
               location.x += 10;
            }
        } catch (e) {
            console.log("No ink found.")
        }
    }

    /**
     * Initializes the player
     * @param playerScale The scale of the player
     */
    protected initPlayer(playerScale: number = 1): void {
        // Add the player
        this.player = this.add.animatedSprite("player", "primary");
        // Scale player to the appropriate size.
        this.player.scale.set(playerScale, playerScale);
        if (!this.playerSpawn) {
            console.warn("Player spawn was never set - setting spawn to (0, 0)");
            this.playerSpawn = Vec2.ZERO;
        }
        this.player.position.copy(this.playerSpawn);
        let playerBox = this.player.boundary.clone();
        let oldHeight = playerBox.hh;
        //remove 1/6 of height and 1/4 width from the player box.
        let offsetY = 0;
        let offsetX = 0;
        offsetY = playerBox.getHalfSize().y / 8;
        offsetX = playerBox.getHalfSize().x / 4;
        playerBox.setHalfSize(playerBox.getHalfSize().clone().sub(new Vec2(offsetX, offsetY)));
        this.player.addPhysics(playerBox,new Vec2(0,offsetY));
        if(Home.flyHackCheats){
            this.player.addAI(PlayerController, { playerType: PlayerType.TOPDOWN, tilemap: "Main" });
        }else{
            this.player.addAI(PlayerController, { playerType: PlayerType.PLATFORMER, tilemap: "Main"});
        }
        this.player.setGroup("player");


        this.viewport.follow(this.player);
        this.livesCount = 3
        // add a compass.
        try{
            this.compass = this.addLevelBackgroundImage("Compass", "primary",this.player.position.clone().add(new Vec2(0, -this.player.boundary.hh)), new Vec2(0.2, 0.2));
    
        }catch(e){
            console.log("No compass found.")
        }
    }

    get PlayerSpawn(): Vec2 {
        return this.playerSpawn.clone();
    }

    /**
    * Initialize the enemies in the level.
    */
    initializeEnemies() {
        try {
            // Get the enemy data
            const enemyData = this.load.getObject("enemyData");
            // Create an enemies array
            this.enemies = new Array(enemyData.numEnemies);
            // Initialize the enemies
            for (let i = 0; i < enemyData.numEnemies; i++) {
                let data = enemyData.enemies[i];

                // Create an enemy

                // TODO: CHANGE THIS
                this.enemies[i] = this.add.animatedSprite(data.type, "primary");

                // TODO: INSERT HEALTH BAR HERE
                //this.healthBars[i] = this.add.uiElement(...);

                // this.enemies[i] = this.add.animatedSprite("gun_enemy", "primary");

                this.enemies[i].position.set(data.position[0], data.position[1]);
                this.enemies[i].animation.play("Idle Left");

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

                if (data.type === "melee_enemy") {
                    let actionMelee = [
                        new AttackAction(3, [AI_Statuses.IN_RANGE], [AI_Statuses.REACHED_GOAL]),
                        new Move(2, [], [AI_Statuses.IN_RANGE], { inRange: 32 })
                    ];
                    actions = actionMelee;
                    range = 40;
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
                        new Move(2, [], [AI_Statuses.MOVE_DONE], { inRange: 100, untilVisible: true }),
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
                this.enemies[i].scale = (new Vec2(0.0625, 0.0625));
                this.enemies[i].addAI(EnemyAI, enemyOptions);
            }
        } catch (e) {
            console.log("No enemy data found for this level.");
            // console.log(e)
            return;
        }
    }

    /**
     * Applies some function to every single tile in tilemap.
     * @param map The tilemap to apply the function to.
     * @param process The function to apply to each tile.
     */
    protected processTileLayer(map: OrthogonalTilemap, process: Function) {
        // Comb through every single tile in the tilemap and check if it is nonzero.
        for (let i = 0; i < map.getDimensions().x; i += 1) {
            for (let j = 0; j < map.getDimensions().y; j += 1) {
                let startTile = new Vec2(i, j)
                let tile = map.getTileAtRowCol(startTile)
                if (tile !== 0) {
                    process(tile, i, j)
                }
            }
        }
    }

    /**
     * Takes in a tile ID from spritesheet and assigns it to some group.
     * @param tileInfo The tile id to process.
     * @returns A Game_Collectables group.
     */
    protected tileToGroup(tileInfo: number): number {
        //    TODO: do a better job of this. maybe do additional parsing to orignal spritesheets.
        // Arrays are size 4 to indicate all 4 tiles that could be part of a pink/white paper.
        let PINK_PAPER_TILES = [16 + 1, 17 + 1, 24 + 1, 25 + 1]
        let WHITE_PAPER_TILES = [6 + 1, 7 + 1, 14 + 1, 15 + 1]
        if (PINK_PAPER_TILES.includes(tileInfo)) {
            return Game_Collectables.PINK_PAPER
        } else if (WHITE_PAPER_TILES.includes(tileInfo)) {
            return Game_Collectables.WHITE_PAPER
        } else {
            return 0
        }
    }

    /**
     * Adds an animated sprite to a certain layer, with scale already adjusted.
     * [NOTE]: this attempts to play "idle" animation by default.
     * @param name The name of the sprite to add. (You can find this when you loaded the sheet)
     * @param layer The layer to add the sprite to.
     * @param position The <col, row> in the tilemap to add the sprite to. 
     *                 Done to make it easier to add sprites by looking in Tiled editor.
     * @param scale The scale of the sprite.
     * @param alpha The transparency of the sprite.
     * @return The sprite that was added.
     */
    addLevelAnimatedSprite(name: string, layer: string = "primary", position: Vec2, size: Vec2 = new Vec2(1, 1), alpha: number = 1) {
        let toAdd = this.add.animatedSprite(name, layer);
        toAdd.position.copy(position);
        toAdd.scale = GameLevel.LEVEL_SCALING.clone().mult(size);
        toAdd.animation.playIfNotAlready("idle", true);
        toAdd.alpha = alpha;
        return toAdd;
    }

    /**
     * Adds a static image to a certain layer, with scale already adjusted.
     * @param name The name of the sprite to add. (You can find this when you loaded the sheet)
     * @param layer The layer to add the sprite to.
     * @param position The <col, row> in the tilemap to add the sprite to. 
     *                 Done to make it easier to add sprites by looking in Tiled editor.
     * @param scale The scale of the sprite.
     * @param alpha The transparency of the sprite.
     * @return The sprite that was added.
     */
    addLevelBackgroundImage(name: string, layer: string = "primary", position: Vec2, size: Vec2 = new Vec2(1, 1), alpha: number = 1) {
        let toAdd = this.add.sprite(name, layer);
        toAdd.position.copy(position);
        toAdd.scale = GameLevel.LEVEL_SCALING.clone().mult(size);
        toAdd.alpha = alpha;
        return toAdd;
    }


    setUpTileCheck(map: OrthogonalTilemap) {
        //Get layers for checking the drawing
        let drawLayer = map
        let arr:Array<Vec2> = [];
        let fakeArr:Array<Vec2> = [];
        if(drawLayer != null){
            //there is another win condition, so therefore, it is not fulfilled.
            this.otherWinCondition = false;
            this.processTileLayer(drawLayer, (tile: number, i: number, j: number) => {
                switch (tile) {
                    case 0:
                        break;
                    case Tileset_Names.FAKE_OUTLINE_INK:
                        drawLayer.setTileAtRowCol(new Vec2(i, j), 115);
                        fakeArr.push(new Vec2(i, j));
                        break;
                    default:
                        arr.push(new Vec2(i, j));
                        break;
                }
            })
        }
        this.REQUIRED_TILES.push({"tiles":arr,"count":0,"antiTiles":fakeArr,"completed": false});
    }

    checkDrawing():boolean{
        if(this.REQUIRED_TILES == null || this.REQUIRED_TILES.length == 0) return true;
        let count = 0;
        let total = 0;
        for(let group of this.REQUIRED_TILES){
            let groupCount = 0;
            for (let vec of group.tiles) {
                total++;
                //If current tile is a outline tile, but the player has not drawn on this tile, stop checking
                let drawing_tile = this.dynamicMap.getTileAtRowCol(vec);
                // console.log(drawing_tile);
                if (drawing_tile != 0){
                    count += 1;
                    groupCount += 1;
                }
            }
            group.completed = groupCount == group.tiles.length;
            group.count = groupCount;
            if(group.antiTiles != null && group.antiTiles.length > 0 && group.completed){
                for (let vec of group.antiTiles) {
                    let drawing_tile = this.dynamicMap.getTileAtRowCol(vec);
                    if (drawing_tile != 0){
                        group.completed = false;
                        break;
                    }
                }
            }
        }
        this.tile_drawn_count = count;
        this.tile_total_count = total;
        return count == total;
    }

    toggleSwitch(switch_id: number) :boolean{
        if(this.switches == null || this.switches[switch_id] == null) return false;
        this.switches[switch_id][2] = !this.switches[switch_id][2];
        let results = this.switches[switch_id][1];
        if(this.switches[switch_id][2]){
            for(let j = 0; j < results.length; j++){
                this.dynamicMap.fastAddTileColRow(results[j],this.switches[switch_id][3],true);
            }
        }else{
            for(let j = 0; j < results.length; j++){
                this.dynamicMap.fastRemoveTileColRow(results[j],true);
            }
        }
        let toggles = this.switches[switch_id][0];
        for(let j = 0; j < toggles.length; j++){
            toggles[j].animation.playIfNotAlready(this.switches[switch_id][2] ? "ON" : "OFF");
        }
        this.dynamicMap.badNavMesh();
    }


    
    /**
     * Processes level data given reference to tilemap.
     * @param level_id The tilemap to process.
     */
    protected processLevelData(level_id: string): void {
        let tilemapLayers = this.add.tilemap(level_id, GameLevel.LEVEL_SCALING);
        //Get only solid layer.
        // TODO: add support for multiple solid layers(mapping to different groups)
        // TODO: change animatedLayer to be levelEndLayer.
        let solidLayer = null
        let collectibleLayer = null
        let animatedLayer = null
        let backgroundLayer: Layer = null
        for (let i = 0; i < tilemapLayers.length; i += 1) {
            let name = tilemapLayers[i].getName()
            if (name == "Platforms") {
                solidLayer = tilemapLayers[i]
                //setup the navmesh.
                this.dynamicMap = <DynamicTilemap>solidLayer.getItems()[0];
                this.dynamicMap.badNavMesh();
                this.navManager.addNavigableEntity("navmesh", this.dynamicMap.navmesh);
            } else if (name == "Collectables") {
                collectibleLayer = tilemapLayers[i]
            } else if (name == "Animated") {
                animatedLayer = tilemapLayers[i]
            } else if (name == "Background") {
                backgroundLayer = tilemapLayers[i]
            } else if (name.includes("ToDraw")){
                let drawTiles = <OrthogonalTilemap>tilemapLayers[i].getItems()[0]
                this.setUpTileCheck(drawTiles);
            } else if (name.includes("SwitchGroup")) {
                //process it right now.
                let switchTiles = <OrthogonalTilemap>tilemapLayers[i].getItems()[0]
                let switchFound = false;
                let solidBlockFound = false;
                let solidBlock = Tileset_Names.SOLID_INK;
                let default_value = 1;
                let SWITCH_ON_TILE = 5;
                let SWITCH_OFF_TILE = 6;
                let affectedBlocks = Array<Vec2>();
                let switches = Array<AnimatedSprite>();
                this.processTileLayer(switchTiles, (tile: number, i: number, j: number) => {
                    // let startTile = new Vec2(i+0.5, j+0.5)
                    switch (tile) {
                        case 0:
                            break;
                        case SWITCH_ON_TILE:
                            if(!switchFound){
                                switchFound = true;
                                default_value = SWITCH_ON_TILE;
                            }else if(default_value != SWITCH_ON_TILE){
                                console.log("Switch orientation in same switch layer does not match.")
                                break;
                            }
                            //switch ON. Add to the array.
                            //create a new switch object.
                            let newSwitch_ON = this.addLevelAnimatedSprite("switch", "primary", new Vec2(i+0.5, j+0.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE), new Vec2(4, 4));
                            newSwitch_ON.animation.playIfNotAlready("ON", true);
                            switches.push(newSwitch_ON);
                            break;
                        case SWITCH_OFF_TILE:
                            if(!switchFound){
                                switchFound = true;
                                default_value = SWITCH_OFF_TILE;
                            }else if(default_value != SWITCH_OFF_TILE){
                                console.log("Switch orientation in same switch layer does not match.")
                                break;
                            }
                            let newSwitch_OFF = this.addLevelAnimatedSprite("switch", "primary", new Vec2(i+0.5, j+0.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE), new Vec2(4, 4));
                            newSwitch_OFF.animation.playIfNotAlready("OFF", true);
                            switches.push(newSwitch_OFF);
                            //switch OFF. Add to the array.
                            break;
                        default:
                            if(!solidBlockFound){
                                solidBlockFound = true;
                                solidBlock = tile;
                            }else if(solidBlock != tile){
                                console.log("Solid block in same switch layer does not match.")
                                break;
                            }
                            //the blocks that the switch affect.
                            affectedBlocks.push(new Vec2(i, j))
                            break;
                    }
                });
              
                //set all tiles in tilemap to 0
                this.processTileLayer(switchTiles, (tile: number, i: number, j: number) => {
                    switchTiles.setTileAtRowCol(new Vec2(i, j), 0);
                });
                let switchLayerName = tilemapLayers[i].getName();
                for(let j= 0; j < affectedBlocks.length; j += 1){
                    let block = affectedBlocks[j];
                    //empty block size is 64, game tile size is 32.
                    this.addLevelBackgroundImage("empty_locked_block", switchLayerName,new Vec2(block.x+0.5, block.y+0.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE), new Vec2(4, 4));
                    this.dynamicMap.setWriteAccess(block, false);
                    if(default_value == SWITCH_ON_TILE){
                        this.dynamicMap.setTileAtRowCol(block, solidBlock);
                    }
                }
                this.switches.push([switches, affectedBlocks, default_value == SWITCH_ON_TILE,solidBlock]);
                // switchTiles.visible=false;
                // tilemapLayers[i].disable();
            } else if (name == "Pen") {
                let penTiles = <OrthogonalTilemap>tilemapLayers[i].getItems()[0]
                this.processTileLayer(penTiles, (tile: number, i: number, j: number) => {
                    if(tile !== 0){
                        // if(this.dynamicMap.getTileAtRowCol(new Vec2(i, j)) === 0){
                        //     this.dynamicMap.setTileAtRowCol(new Vec2(i, j), tile);
                        // }else{

                        // }
                        this.dynamicMap.setTileAtRowCol(new Vec2(i, j), tile);
                        this.dynamicMap.setWriteAccess(new Vec2(i,j), false);
                        penTiles.setTileAtRowCol(new Vec2(i, j), 0);
                    }
                });
            }
        }
        //process navmesh again.
        this.dynamicMap = <DynamicTilemap>solidLayer.getItems()[0];
        this.dynamicMap.badNavMesh();
        this.navManager = new NavigationManager()
        this.navManager.addNavigableEntity("navmesh", this.dynamicMap.navmesh);
        // Go through all background setup functions.
        this.backgroundSetup.forEach((func) => {
            func(backgroundLayer)
        })
        // add physics to end level blocks.
        if (animatedLayer !== null) {
            let animatedTiles = <OrthogonalTilemap>animatedLayer.getItems()[0]
            this.processTileLayer(animatedTiles, (tile: number, i: number, j: number) => {
                // let startTile = new Vec2(i+0.5, j+0.5)
                switch (tile) {
                    case 0:
                        break;
                    default:
                        this.addLevelEnd(new Vec2(i + 0.5, j + 0.5))
                        animatedTiles.alpha = 1
                        break;
                }
            });
        }

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

        // Parse all collectables.
        if (collectibleLayer !== null) {
            let collectibles = <OrthogonalTilemap>collectibleLayer.getItems()[0]
            this.processTileLayer(collectibles, (tile: number, i: number, j: number) => {
                let startTile = new Vec2(i + 0.5, j + 0.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE)
                let toAdd = null
                let trigger = null
                tile = this.tileToGroup(tile)
                switch (tile) {
                    // TODO: Make a proper enum to handle this instead of hardcoding.
                    case Game_Collectables.WHITE_PAPER:
                        trigger = Game_Events.WHITE_PAPER_FOUND
                        toAdd = this.addLevelAnimatedSprite("white_paper", "primary", startTile)
                        this.numberWhite += 1
                        this.numberPapers += 1
                        break;
                    case Game_Collectables.PINK_PAPER:
                        trigger = Game_Events.PINK_PAPER_FOUND
                        toAdd = this.addLevelAnimatedSprite("pink_paper", "primary", startTile)
                        this.numberPink += 1
                        this.numberPapers += 1
                        break;
                    default:
                        break;
                }
                if (tile != 0) {
                    toAdd.addPhysics(toAdd.boundary, undefined, false, true);
                    toAdd.setTrigger("player", trigger, null);
                    this.Collectibles.push(toAdd)
                    // remove the tile from the map, we parsed it.
                    collectibles.setTileAtRowCol(new Vec2(i, j), 0)
                }
            })
        }
    }

    /**
     * Replace the level geometry when a tile is added/deleted.
     * @param position The position of the click
     * @param mode the operation to perform.
     *              0: add tile
     *              1: delete tile
     **/
    protected updateLevelGeometry(position: Vec2, mode: number = 0): boolean {
        // Check if the click position if out of bounds of the level.
        if (this.dynamicMap.getTileAtWorldPosition(position) == -1) {
            return false;
        }

        //find the tile coordinates closest to the cursor.
        let tile = this.dynamicMap.getColRowAt(position);
        let tileAABB = new AABB(tile.clone().add(new Vec2(0.5, 0.5)).clone().mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE), GameLevel.DEFAULT_LEVEL_TILE_SIZE.clone().scale(0.5));

        //prevent edits to spawn.(blocked area is a circle of radius 2)
        if (tileAABB.center.distanceTo(this.playerSpawnColRow.clone().mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE)) < 2 * GameLevel.DEFAULT_LEVEL_TILE_SIZE.x) {
            return false;
        }

        if (mode == 0) {
            //get the collider of the player in the level.
            let collider = (!this.player.onGround)?this.player.sweptRect.clone():this.player.boundary.clone();
            let colrow_toAdd = this.dynamicMap.getColRowAt(position)
            // Check if the block is not overalapping with the current enemies.
            if (this.enemies != null) {
                for (let i = 0; i < this.enemies.length; i++) {
                    if((this.enemies[i]._ai as EnemyAI).health  <=0) continue;
                    let colrow_enemy = this.dynamicMap.getColRowAt(this.enemies[i].position)
                    if (colrow_enemy.distanceTo(colrow_toAdd) < 1) return false
                }
            }
            if (collider.overlapArea(tileAABB) == 0 && !this.dynamicMap.isTileCollidable(colrow_toAdd.x, colrow_toAdd.y)) {
                if(this.placementLeft > 0){
                    if(this.dynamicMap.badAddTile(position, Tileset_Names.SOLID_INK)){
                        if (Input.isMouseJustPressed(0)) {
                            this.emitter.fireEvent(GameEventType.PLAY_SFX, { key: "scribble", loop: false, holdReference: false });       
                        }
                        if(!Home.unlimitedPlacementCheats){
                            this.placementLeft--;
                        }
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            }else{
                return false;
            }
        } else {
            // if(this.checkErasingPlatform(this.playerSpawnColRow,tile)) return;
            let colrow_toAdd = this.dynamicMap.getColRowAt(position)
            if(this.dynamicMap.isTileCollidable(colrow_toAdd.x, colrow_toAdd.y)){
                if(this.dynamicMap.badRemoveTile(position)){
                    if (Input.isMouseJustPressed(2)) {
                        this.emitter.fireEvent(GameEventType.PLAY_SFX, { key: "erase", loop: false, holdReference: false });
                    }
                    if(!Home.unlimitedPlacementCheats){
                        this.placementLeft += 1;
                        if(this.placementLeft> GameLevel.MAX_BLOCKS)
                            this.placementLeft = GameLevel.MAX_BLOCKS;
                    }
                }else{
                    return false;
                }
            }else{
                return false;
            }
        }
        this.navManager = new NavigationManager()
        this.navManager.addNavigableEntity("navmesh", this.dynamicMap.navmesh);
        return true;
    }

    /**
     * Returns true if the tile if part of a platform.
     * @param startPos The row and column of the platform.
     * @param tile The tile to check.
     * @param offset The width of the platform.
     * @returns A flag representing whether or not the tile is collidable.
     */
    checkErasingPlatform(startPos: Vec2, tile: Vec2, offset: number = 2): boolean {
        //round y to lower value.
        startPos.y = Math.floor(startPos.y);
        let startY = startPos.y;
        //round x to lower value.
        startPos.x = Math.floor(startPos.x);
        let offsetX = offset;
        let startX = Math.max(startPos.x - offsetX, 0);
        let firstBlockFound = Array(offsetX * 2 + 1).fill(-1);
        // decrement to the first tile that is soild below the spawn.
        for (let i = startX; i <= startX + offsetX * 2 && i < this.dynamicMap.getDimensions().x; i++) {
            while (!this.dynamicMap.isTileCollidable(i, startPos.y) && startPos.y < this.dynamicMap.getDimensions().y) {
                startPos.y++;
            }
            firstBlockFound[i - startX] = startPos.y;
            if (startPos.y == tile.y && i == tile.x) {
                return true;
            }
            startPos.y = startY;
        }
        return false;
    }

    /**
     * Adds a trigger to end the level.
     * @param tileCoordinate The <col,row> of the tile to add.
     * @param size The area of the square to add.
     */
    protected addLevelEnd(tileCoordinate: Vec2, size: Vec2 = new Vec2(1, 1)): void {
        let levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, "primary", { position: tileCoordinate.scale(GameLevel.DEFAULT_LEVEL_TILE_SIZE.x), size: size.scale(GameLevel.DEFAULT_LEVEL_TILE_SIZE.x) });
        levelEndArea.addPhysics(undefined, undefined, false, true);
        levelEndArea.setTrigger("player", Game_Events.PLAYER_ENTERED_LEVEL_END, null);
        levelEndArea.color = new Color(0, 0, 0, 0);
        this.levelEndSpots.push(levelEndArea);
    }

    /**
     * Handles some kind of collectable.
     * @param item_type The type of item to add.
     * @param collectableID The ID of the GameNode that represents the collectable.
     */
    protected collectObject(item_type: Game_Collectables, collectableID: number): void {
        // disable the trigger.
        let object = this.sceneGraph.getNode(collectableID)
        // find the object given id.
        object.alpha = 0;
        object.disablePhysics()
        this.remove(object)
        // Check if collectable is a paper.
        if (item_type == Game_Collectables.PINK_PAPER || item_type == Game_Collectables.WHITE_PAPER) {
            this.papersCountLabel.text = "Papers Found: " + (this.whiteFound + this.pinkFound) + "/" + (this.numberPapers);
            this.emitter.fireEvent(GameEventType.PLAY_SFX, { key: "paper_pickup", loop: false, holdReference: false });
            // If enough papers were found, then  remove the barrier to the next page.
            if (this.whiteFound + this.pinkFound == this.numberPapers) {
                // Do something here:

            }
        }
    }

    /**
     * Increments the amount of life the player has
     * @param amt The amount to add to the player life
     */
    protected incPlayerLife(amt: number): void {
        if(Home.unlimitedLives){
            if(amt <0)amt = 0;
        }
        this.livesCount += amt;
        this.livesCountLabel.text = "Lives: " + ((Home.unlimitedLives)?"∞":this.livesCount.toString())  ;
        if (this.livesCount <= 0) {
            Input.disableInput();
            this.player.disablePhysics();
        }
    }

    /**
     * Goes to the menu screen.
     */
    protected goToMenu(): void {
        Input.enableInput();
        let sceneOptions = {
            physics: {
                groupNames: ["ground", "player", "enemy"],
                collisions:
                    [
                        [0, 1, 1],
                        [1, 0, 0],
                        [1, 0, 0]
                    ]
            }
        }
        this.sceneManager.changeToScene(this.home, {}, sceneOptions);
    }
}

