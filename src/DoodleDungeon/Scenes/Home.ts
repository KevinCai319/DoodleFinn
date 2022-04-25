import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import { Game_Events } from "../Events";
import PlayerController from "../Player/PlayerController";
import DemoLevel from "./DemoLevel";
import GameLevel from "./Game";
import Level1 from "./Level1";

export default class Home extends GameLevel {
    static LevelsUnlocked:number = 1;
    static numberOfLevels = 6;

    //Add references to other levels here.
    static Levels = [DemoLevel,Level1];

    LEVEL_NAME:string ="Tutorial"
    LEVEL_TILESET:string = "Tutorial"
    Instructions:AnimatedSprite = null
    Controls:AnimatedSprite = null
    //           [unlocked, door sprite, level]
    doors:Array<[boolean, AnimatedSprite, new (...args: any) => GameLevel]>;
    static bestTimes:Array<number>;
    bestTimeLabels:Array<Label> = []
    static firstLoad: boolean = true;
    //Cheats.
    static invincibilityCheats:boolean = false;
    static unlimitedPlacementCheats:boolean = false;
    static allLevelCheats:boolean = false;
    static flyHackCheats:boolean = false;
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/"+this.LEVEL_NAME+"/"+this.LEVEL_NAME+".json");
        this.load.spritesheet("player", "game_assets/spritesheets/DoodleFinn/DoodleFinn-Sprite.json");
        this.load.spritesheet("gun_enemy", "game_assets/spritesheets/gun_enemy.json");
        this.load.spritesheet("pink_paper", "game_assets/spritesheets/pink_paper.json");
        this.load.spritesheet("white_paper", "game_assets/spritesheets/white_paper.json");
        this.load.spritesheet("cursor", "game_assets/spritesheets/cursor.json");
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
        this.load.keepSpritesheet("player");
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
            if(i >= Home.LevelsUnlocked){
                this.doors.push([false, null, null]);
            }else{
                this.doors.push([true, null, Home.Levels[i]]);
            }
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
            this.addLevelBackgroundImage("PressE",layer.getName(),new Vec2(94.5,14).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(3,3));
            //Adding doors, and their best times.d
            for(let i = 0; i < this.doors.length; i++){
                let new_door = this.addLevelAnimatedSprite("Door",layer.getName(),new Vec2(90+5*i,17).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(0.5,0.5))
                if(this.doors[i][0]){
                    let levelLabel =  <Label>this.add.uiElement(UIElementType.LABEL, layer.getName(), { position: new Vec2(90.25+5*i,12).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE), text: "Best Time: \n" });
                    if(Home.bestTimes[i] != -1){
                        let levelTime =  <Label>this.add.uiElement(UIElementType.LABEL, layer.getName(), { position: new Vec2(90.25+5*i,13).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE), text: ""+Home.bestTimes[i] + "s" });
                    }else{
                        let levelTime =  <Label>this.add.uiElement(UIElementType.LABEL, layer.getName(), { position: new Vec2(90.25+5*i,13).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE), text: "Not Played" });
                    }

                    new_door.alpha = 1;
                }else{
                    new_door.alpha = 0.5;
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
    }

    updateScene(deltaT: number): void {
        if(!this.Controls.visible){
            this.cursorDisabled = this.cursor.boundary.containsPoint(this.Instructions.position)
        }
        // iterate through all doors.
        for(let i = 0; i < this.doors.length; i++){
            //check if it is unlocked.
            if(this.doors[i][0]){
                if(this.doors[i][1].boundary.overlapArea(this.player.boundary) && Input.isKeyJustPressed("e")){
                    this.nextLevel = this.doors[i][2];
                    this.emitter.fireEvent(Game_Events.LEVEL_END);
                }
            }else{
                
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
                }
            }else{
                this.Instructions.animation.playIfNotAlready("idle")
            }

        }else{
            if(Input.isMouseJustPressed()){
                this.player.unfreeze()
                this.Controls.visible = false
            }
        }

    }
    //@Override
    // Player can fall as many times as needed.
    protected incPlayerLife(amt: number): void {
    }
}