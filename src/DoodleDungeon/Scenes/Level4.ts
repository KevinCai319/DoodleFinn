import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";
import Home from "./Home";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Layer from "../../Wolfie2D/Scene/Layer";
import DynamicTilemap from "../../Wolfie2D/Nodes/Tilemaps/DynamicMap";
import { AI_Statuses, Game_Collectables, Game_Events, Tileset_Names } from "../Events";

export default class Level4 extends GameLevel {
    LEVEL_NAME: string = "Level_4"
    LEVEL_TILESET: string = "Level_4"
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/" + this.LEVEL_NAME + "/" + this.LEVEL_TILESET + ".json");
        super.loadScene(true);
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/" + this.LEVEL_NAME + "/enemy.json");
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
            Home.bestTimes[1] = Math.min(Home.bestTimes[1], time);
            if (Home.bestTimes[1] == -1) Home.bestTimes[1] = time;
        }
        if (Home.LevelsUnlocked == 2) {
            Home.LevelsUnlocked += 1;
        }
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level_music"});
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = null
        this.home = Home
        this.playerSpawnColRow = new Vec2(3, 30)
        // Do generic setup for a GameLevel
        super.startScene();
        //this.processLevelData(this.LEVEL_NAME);

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level_music", loop: true, holdReference: true});
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
        // if(this.tilemaps.foreground == drawnTiles){
        //     this.emitter.fireEvent(Game_Events.LEVEL_END);
        // }
    }

    // protected processLevelData(level_id: string): void {
    //     super.processLevelData(level_id);

    //     let tilemapLayers = this.add.tilemap(level_id, GameLevel.LEVEL_SCALING);
    //     let penLayer = null;
    //     let foregroundLayer = null;
    //     for (let i = 0; i < tilemapLayers.length; i += 1) {
    //         let name = tilemapLayers[i].getName()
    //         if (name == "Pen") {
    //             penLayer = tilemapLayers[i]
    //         } else if (name == "Foreground") {
    //             foregroundLayer = tilemapLayers[i]
    //         }
    //     }

    //     let outline = <OrthogonalTilemap>foregroundLayer.getItems()[0];
    //     this.processTileLayer(outline, (tile: number, i: number, j: number) => {

    //     });

    //     if(foregroundLayer != null){

    //     }
    //     // Parse all collectables.
    //     if (collectibleLayer !== null) {
    //         let collectibles = <OrthogonalTilemap>collectibleLayer.getItems()[0]
    //         this.processTileLayer(collectibles, (tile: number, i: number, j: number) => {
    //             let startTile = new Vec2(i + 0.5, j + 0.5).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE)
    //             let toAdd = null
    //             let trigger = null
    //             tile = this.tileToGroup(tile)
    //             switch (tile) {
    //                 // TODO: Make a proper enum to handle this instead of hardcoding.
    //                 case Game_Collectables.WHITE_PAPER:
    //                     trigger = Game_Events.WHITE_PAPER_FOUND
    //                     toAdd = this.addLevelAnimatedSprite("white_paper", "primary", startTile)
    //                     this.numberWhite += 1
    //                     this.numberPapers += 1
    //                     break;
    //                 case Game_Collectables.PINK_PAPER:
    //                     trigger = Game_Events.PINK_PAPER_FOUND
    //                     toAdd = this.addLevelAnimatedSprite("pink_paper", "primary", startTile)
    //                     this.numberPink += 1
    //                     this.numberPapers += 1
    //                     break;
    //                 default:
    //                     break;
    //             }
    //             if (tile != 0) {
    //                 toAdd.addPhysics(toAdd.boundary, undefined, false, true);
    //                 toAdd.setTrigger("player", trigger, null);
    //                 this.Collectibles.push(toAdd)
    //                 // remove the tile from the map, we parsed it.
    //                 collectibles.setTileAtRowCol(new Vec2(i, j), 0)
    //             }
    //         })
    //     }
    // }
    
}