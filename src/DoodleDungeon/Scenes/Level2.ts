import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";
import Home from "./Home";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Level5a from "./Level5a";
import { Tileset_Names } from "../Events";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Layer from "../../Wolfie2D/Scene/Layer";

export default class Level2 extends GameLevel {
    LEVEL_NAME: string = "Level_2"
    LEVEL_TILESET: string = "Level_2_new"
    // MAKE_SURE_EMPTY: Array<Vec2> = [];
    completed_before:Array<boolean> = [false,false,false,false];
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/" + this.LEVEL_NAME + "/" + this.LEVEL_TILESET + ".json");
        super.loadScene(true);
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/" + this.LEVEL_NAME + "/enemy.json");
        this.load.image("art", "game_assets/spritesheets/LevelEnd/Congratulations/Level2_EndArt.png");
        this.load.image("tictac","game_assets/spritesheets/Level2-TicTac.png");
        this.load.image("test","game_assets/spritesheets/Level2-Scantron.png");
        this.load.image("hangman","game_assets/spritesheets/Level2-Hangman.png");

    }

    // DoodleFinn TODO
    /**
     * If you are moving to another level.
     * To keep: 
     *  Spritesheets for the player, enemies, and items.
     *  SFX and music.
     */
    unloadScene() {
        // Keep resources - this is up to you
        super.unloadCommon();
        if (this.gameEnd) {
            let time = this.levelTimer.getTimeElapsed() / 1000;
            Home.bestTimes[3] = Math.min(Home.bestTimes[3], time);
            if (Home.bestTimes[3] == -1) Home.bestTimes[3] = time;
        }
        if (Home.LevelsUnlocked == 4) {
            Home.LevelsUnlocked += 1;
        }
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level_music"});
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = Level5a;
        this.home = Home
        this.playerSpawnColRow = new Vec2(7, 40)
        this.backgroundSetup.push((layer:Layer)=>{
            this.addLevelBackgroundImage("tictac",layer.getName(),new Vec2(22.5,28).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(4,4))
            this.addLevelBackgroundImage("test",layer.getName(),new Vec2(49.5,24).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(3.1,3.1))
            this.addLevelBackgroundImage("hangman",layer.getName(),new Vec2(22.5,5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(4,4))

        })
        // Do generic setup for a GameLevel
        super.startScene();
        //read in foreground layer.
        // let foregroundLayer = this.getTilemap("Foreground") as OrthogonalTilemap;
        // this.processTileLayer(foregroundLayer, (tile: number, i: number, j: number) => {
        //     if(tile == Tileset_Names.OUTLINE_INK){
        //         this.MAKE_SURE_EMPTY.push(new Vec2(i,j));
        //     }
        // });
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level_music", loop: true, holdReference: true});
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
    checkDrawing():boolean{
        let result = super.checkDrawing();
        let i = 0;
        this.REQUIRED_TILES.forEach(group => {
            if(group.completed && !this.completed_before[i]){
                this.completed_before[i] = true;
                this.toggleSwitch(i);
                // //set all the tiles to be impossible to edit
                group.tiles.forEach(tile => {
                    this.dynamicMap.setWriteAccess(tile,false);
                    this.addLevelBackgroundImage("empty_locked_block","primary",tile.clone().add(new Vec2(0.5,0.5)).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(4, 4),1);
                })
                this.emitter.fireEvent(GameEventType.PLAY_SFX, { key: "puzzle-unlocked", loop: false, holdReference: false });       
            }else{

            }
            i++;
        })
        this.otherWinCondition = true;
        return true;
    }
    show_art(): void {
        this.addLevelBackgroundImage("art","UI",this.viewport.getHalfSize(),new Vec2(3,3),1);
    }
}