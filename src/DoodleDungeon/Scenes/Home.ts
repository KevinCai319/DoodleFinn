import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import { Game_Events } from "../Events";
import PlayerController, { PlayerStates, PlayerType } from "../Player/PlayerController";
import DemoLevel from "./DemoLevel";
import GameLevel from "./Game";
import Level1 from "./Level1";
import Level4 from "./Level4";
import Level2 from "./Level2";
import Level3 from "./Level3";
import Level5 from "./Level5";
import Level5a from "./Level5a";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import PlayerState from "../Player/PlayerStates/PlayerState";
import Level6 from "./Level6";


export default class Home extends GameLevel {
    static LevelsUnlocked:number = 1;
    static numberOfLevels = 8;

    //Add references to other levels here.
    static Levels = [DemoLevel,Level1,Level4,Level2,Level5a,Level3,Level5,Level6];

    LEVEL_NAME:string ="Tutorial"
    LEVEL_TILESET:string = "Tutorial"
    Instructions:AnimatedSprite = null
    Controls:AnimatedSprite = null
    curControl:Sprite = null;
    //           [unlocked, door sprite, level]
    doors:Array<[boolean, AnimatedSprite, new (...args: any) => GameLevel]>;
    static bestTimes:Array<number>;
    bestTimeLabels:Array<Label> = []
    static firstLoad: boolean = true;
    //Cheats.
    static invincibilityCheats:boolean = false;
    static unlimitedPlacementCheats:boolean = false;
    static flyHackCheats:boolean = false;
    //Toggle could be handled in own class, but not needed since it is only 
    //used in this class.
    toggles: Array<[Sprite,Sprite,boolean,Function]> = [];
    static unlimitedLives:boolean = false;
    static allLevelsUnlocked:boolean = false;
    static controls:Array<string> = ["T-begin","T-graphite","T-bound","T-goal","T-atk-1","T-atk-2","T-int","T-end","T-sum"];
    instr_index:number = 0;
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/"+this.LEVEL_NAME+"/"+this.LEVEL_NAME+".json");
        super.loadScene(false);
        
        this.load.spritesheet("InstructionsButton", "game_assets/spritesheets/TutorialAssets/InstructionsButton.json")
        this.load.spritesheet("Controls","game_assets/spritesheets/TutorialAssets/Controls.json" )
        this.load.image("Backstory", "game_assets/spritesheets/TutorialAssets/Backstory.png")
        this.load.spritesheet("Door","game_assets/spritesheets/TutorialAssets/Door.json")

        this.load.image("LevelSelect", "game_assets/spritesheets/TutorialAssets/LevelSelect.png");
        this.load.image("help", "game_assets/spritesheets/TutorialAssets/help.png");
        this.load.image("credit1","game_assets/spritesheets/TutorialAssets/credit1.png")
        this.load.image("credit2","game_assets/spritesheets/TutorialAssets/credit2.png")
        this.load.image("ClickHere", "game_assets/spritesheets/TutorialAssets/ClickHere.png");
        this.load.image("PressE", "game_assets/spritesheets/TutorialAssets/PressE.png");

        this.load.image("T-begin", "game_assets/spritesheets/TutorialAssets/Final_Tutorial/Tutorial-Beginning.png");
        this.load.image("T-graphite", "game_assets/spritesheets/TutorialAssets/Final_Tutorial/Tutorial-Graphite.png");
        this.load.image("T-bound", "game_assets/spritesheets/TutorialAssets/Final_Tutorial/Tutorial-Level-Boundary.png");
        this.load.image("T-goal", "game_assets/spritesheets/TutorialAssets/Final_Tutorial/Tutorial-Goals.png");
        this.load.image("T-atk-1", "game_assets/spritesheets/TutorialAssets/Final_Tutorial/Tutorial-Attack.png");
        this.load.image("T-atk-2", "game_assets/spritesheets/TutorialAssets/Final_Tutorial/Tutorial-Attack-Sight.png");
        this.load.image("T-int", "game_assets/spritesheets/TutorialAssets/Final_Tutorial/Tutorial-Interact.png");
        this.load.image("T-end", "game_assets/spritesheets/TutorialAssets/Final_Tutorial/Tutorial-End.png");
        this.load.image("T-sum", "game_assets/spritesheets/TutorialAssets/Final_Tutorial/Tutorial-Summary.png");
        

        this.load.image("Cheats", "game_assets/spritesheets/TutorialAssets/Cheats.png");
        this.load.image("ON", "game_assets/spritesheets/TutorialAssets/TOGGLE_ON.png");
        this.load.image("OFF", "game_assets/spritesheets/TutorialAssets/TOGGLE_OFF.png");

        this.load.audio("menu_music", "game_assets/music/doodlefinn_main.wav")
        this.load.audio("toggle_switch", "game_assets/sounds/toggle_switch.wav")
    }

    // DoodleFinn TODO
    /**
     * If you are moving to another level.
     * To keep: 
     *  Spritesheets for the player, enemies, and items.
     *  SFX and music.
     * 
     */
    unloadScene(){
        // Keep resources - this is up to you
        super.unloadCommon();
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "menu_music"});
    }

    startScene(): void {
        if(Home.firstLoad){
            Home.bestTimes = new Array<number>(Home.numberOfLevels);
            // Clear best times.
            for(let i = 0; i < Home.numberOfLevels; i++){
                Home.bestTimes[i] = -1.0;
            }
            Home.firstLoad = false;
        }
        this.doors = [];
        for(let i = 0; i < Home.numberOfLevels; i++){
            this.doors.push([i < Home.LevelsUnlocked, null, Home.Levels[i]]);
        }

        this.playerSpawnColRow = new Vec2(77,10);

        // Add custom background graphics for this level.
        this.backgroundSetup.push((layer:Layer)=>{
            let selectSign = this.addLevelBackgroundImage("LevelSelect",layer.getName(),new Vec2(84,12.8).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(3,3))
            selectSign.alpha = 0.5
            let helpSign = this.addLevelBackgroundImage("help",layer.getName(),new Vec2(69.3,11.6).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1.75,1.75))
            helpSign.alpha = 0.5
            this.Instructions = this.addLevelAnimatedSprite("InstructionsButton",layer.getName(), new Vec2(75,13.4).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(2,2))
            let backstory = this.addLevelBackgroundImage("Backstory",layer.getName(),new Vec2(45,5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1.8,1.8))
            backstory.alpha = 0.8
            this.addLevelBackgroundImage("ClickHere",layer.getName(),new Vec2(78.5,11.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(3,3));
            this.addLevelBackgroundImage("Cheats",layer.getName(),new Vec2(55,15).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(3,3));
            
            this.toggles.push([this.addLevelBackgroundImage("ON",layer.getName(),new Vec2(60,13.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1),0.8*(Home.invincibilityCheats?0:1)),
            this.addLevelBackgroundImage("OFF",layer.getName(),new Vec2(60,13.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1),0.8*(Home.invincibilityCheats?1:0)),
            Home.invincibilityCheats,
            ()=>{
                Home.invincibilityCheats = !Home.invincibilityCheats;
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, 
                    {key: "toggle_switch", loop: false, holdReference: false});
            }]);
            this.toggles.push([this.addLevelBackgroundImage("ON",layer.getName(),new Vec2(60,14.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1),0.8*(Home.unlimitedLives?0:1)),
                                this.addLevelBackgroundImage("OFF",layer.getName(),new Vec2(60,14.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1),0.8*(Home.unlimitedLives?1:0)),
                                Home.unlimitedLives,
                                ()=>{
                                    Home.unlimitedLives = !Home.unlimitedLives;
                                    this.emitter.fireEvent(GameEventType.PLAY_SOUND, 
                                        {key: "toggle_switch", loop: false, holdReference: false});
                                }]);
            this.toggles.push([this.addLevelBackgroundImage("ON",layer.getName(),new Vec2(60,15.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1),0.8*(Home.allLevelsUnlocked?0:1)),
                                this.addLevelBackgroundImage("OFF",layer.getName(),new Vec2(60,15.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1),0.8*(Home.allLevelsUnlocked?1:0)),
                                Home.allLevelsUnlocked,
                                ()=>{
                                    Home.allLevelsUnlocked= !Home.allLevelsUnlocked;
                                    this.emitter.fireEvent(GameEventType.PLAY_SOUND, 
                                        {key: "toggle_switch", loop: false, holdReference: false});
                                }]);
            this.toggles.push([this.addLevelBackgroundImage("ON",layer.getName(),new Vec2(60,16.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1),0.8*(Home.flyHackCheats?0:1)),
                                this.addLevelBackgroundImage("OFF",layer.getName(),new Vec2(60,16.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1),0.8*(Home.flyHackCheats?1:0)),
                                Home.flyHackCheats,
                                ()=>{
                                    Home.flyHackCheats = !Home.flyHackCheats;
                                    (this.player._ai as PlayerController).changeState(PlayerStates.IDLE);
                                    (this.player._ai as PlayerController).playerType = (Home.flyHackCheats)?PlayerType.TOPDOWN:PlayerType.PLATFORMER
                                    this.player._velocity = Vec2.ZERO;
                                    this.emitter.fireEvent(GameEventType.PLAY_SOUND, 
                                        {key: "toggle_switch", loop: false, holdReference: false});
                                }]);
            this.toggles.push([this.addLevelBackgroundImage("ON",layer.getName(),new Vec2(60,17.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1),0.8*(Home.unlimitedPlacementCheats?0:1)),
            this.addLevelBackgroundImage("OFF",layer.getName(),new Vec2(60,17.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1,1),0.8*(Home.unlimitedPlacementCheats?1:0)),
            Home.unlimitedPlacementCheats,
            ()=>{
                Home.unlimitedPlacementCheats = !Home.unlimitedPlacementCheats;
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, 
                    {key: "toggle_switch", loop: false, holdReference: false});
            }]);
            
            this.addLevelBackgroundImage("PressE",layer.getName(),new Vec2(94.5,14).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(3,3));
            //Adding doors, and their best times.
            for(let i = 0; i < this.doors.length; i++){
                let new_door = this.addLevelAnimatedSprite("Door",layer.getName(),new Vec2(90+5*i,17).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.5,0.5))
                let levelLabel =  <Label>this.add.uiElement(UIElementType.LABEL, layer.getName(), { position: new Vec2(90.25+5*i,12).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE), text: "Best Time: \n" });
                if(Home.bestTimes[i] != -1){
                    let levelTime =  <Label>this.add.uiElement(UIElementType.LABEL, layer.getName(), { position: new Vec2(90.25+5*i,13).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE), text: ""+Home.bestTimes[i] + "s" });
                }else{
                    let levelTime =  <Label>this.add.uiElement(UIElementType.LABEL, layer.getName(), { position: new Vec2(90.25+5*i,13).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE), text: "Not Played" });
                }
                if(this.doors[i][0]){

                    new_door.alpha = 1;
                }else{
                    new_door.alpha = 0.2;
                }
                this.doors[i][1] = new_door;
            }
            
            let cred2 =this.addLevelBackgroundImage("credit2",layer.getName(),new Vec2(30,15).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1.8,1.8))
            let cred1 =this.addLevelBackgroundImage("credit1",layer.getName(),new Vec2(10,5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1.8,1.8))
            cred2.alpha = 0.5
            cred1.alpha = 0.5
        })
        super.startScene();
        (<PlayerController>this.player._ai).MIN_SPEED = 300;
        (<PlayerController>this.player._ai).MAX_SPEED = 400;
        this.Controls = this.add.animatedSprite("Controls","UI")
        this.Controls.position= this.getViewport().getHalfSize()
        this.Controls.scale = this.Controls.position.scaled(2).div(this.Controls.size)
        this.Controls.visible = false
        this.Controls.alpha=1;
        this.viewport.setZoomLevel(1.1);
        this.viewport.setBounds(0, 0, this.dynamicMap.getDimensions().x*GameLevel.DEFAULT_LEVEL_TILE_SIZE.x, this.dynamicMap.getDimensions().y*GameLevel.DEFAULT_LEVEL_TILE_SIZE.y)
        // this.viewport.update(0);
        this.livesCountLabel.destroy()
        this.papersCountLabel.destroy()
        // this.levelEndLabel.destroy()
        // this.levelTransitionScreen.destroy()
        this.livesCount = 1
        this.pauseButton.visible = false
        this.pauseButton.destroy()

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "menu_music", loop: true, holdReference: true});
    }
    updateScene(deltaT: number): void {
        this.placementLeft = GameLevel.MAX_BLOCKS;
        if(!this.Controls.visible){
            this.cursorDisabled = this.cursor.boundary.containsPoint(this.Instructions.position)
        }
        //Iterate through all cheat buttons.
        for(let i = 0; i < this.toggles.length; i++){
            let chosenSprite = this.toggles[i][(this.toggles[i][2])?1:0];
            if(chosenSprite.boundary.containsPoint(Input.getGlobalMousePosition())){
                chosenSprite.alpha = 1;
                this.cursorDisabled = true;
                if(Input.isMouseJustPressed(0)){
                    
                    this.toggles[i][2] = !this.toggles[i][2];
                    chosenSprite.alpha = 0;
                    this.toggles[i][3](this.toggles[i][2]);
                    chosenSprite = this.toggles[i][(this.toggles[i][2])?1:0];
                    chosenSprite.alpha = 1;
                }
            }else{
                chosenSprite.alpha = 0.8;
            }
        }



        // iterate through all doors.
        for(let i = 0; i < this.doors.length; i++){
            //check if it is unlocked.
            if(this.doors[i][0] || (Home.allLevelsUnlocked && i < Home.Levels.length)){
                this.doors[i][1].alpha = 0.8;
                if(this.doors[i][1].boundary.overlapArea(this.player.boundary)){
                    this.doors[i][1].alpha = 1;
                    if(Input.isKeyJustPressed("e")){
                        this.nextLevel = this.doors[i][2];
                        this.emitter.fireEvent(Game_Events.LEVEL_END);
                    }
                }
            }else{
                this.doors[i][1].alpha = 0.2;
            }
        }
        // if(this.door.boundary.overlapArea(this.player.boundary) && Input.isKeyJustPressed("e")){
        //     this.emitter.fireEvent(Game_Events.LEVEL_END)
        // }
        super.updateScene(deltaT);
        if(!this.Controls.visible){
            if(this.Instructions.boundary.containsPoint(Input.getGlobalMousePosition())){
                this.Instructions.animation.playIfNotAlready("highlighted")
                if(Input.isMouseJustPressed()){
                    this.player.freeze()
                    this.Controls.visible = true
                    this.instr_index=0;
                    let tmp = this.add.sprite(Home.controls[this.instr_index],"UI")
                    tmp.position= this.getViewport().getHalfSize()
                    tmp.scale = tmp.position.scaled(2).div(tmp.size)
                    tmp.visible = true;
                    this.curControl = tmp;
                }
            }else{
                this.Instructions.animation.playIfNotAlready("idle")
            }

        }else{
            if(Input.isMouseJustPressed()){
                this.curControl.visible = false;
                this.remove(this.curControl)
                if(this.instr_index < Home.controls.length-1){
                    this.instr_index++
                    //show the image for the proper index.
                    let tmp = this.add.sprite(Home.controls[this.instr_index],"UI")
                    tmp.position= this.getViewport().getHalfSize()
                    tmp .scale = tmp.position.scaled(2).div(tmp.size)
                    tmp.visible = true;
                    this.curControl = tmp;
                }else{
                    this.player.unfreeze()
                    this.Controls.visible = false
                    this.instr_index = 0;
                }
            }
        }

    }
    //@Override
    // Player can fall as many times as needed.
    protected incPlayerLife(amt: number): void {
    }
}