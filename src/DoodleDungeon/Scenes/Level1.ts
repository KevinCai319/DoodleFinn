import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";
import Home from "./Home";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Level4 from "./Level4";

export default class Level1 extends GameLevel {
    LEVEL_NAME: string = "Level_1"
    LEVEL_TILESET: string = "Level_1"
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/" + this.LEVEL_NAME + "/" + this.LEVEL_TILESET + ".json");
        super.loadScene(true);
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/" + this.LEVEL_NAME + "/enemy.json");
        this.load.image("art", "game_assets/spritesheets/LevelEnd/Congratulations/Level1_EndArt.png");
        this.load.image("pauseArt", "game_assets/spritesheets/Level_Layout/Level_1.png")
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
            if (Home.LevelsUnlocked == 2) {
                Home.LevelsUnlocked += 1;
            }
        }
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level_music"});
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = Level4;
        this.home = Home
        this.playerSpawnColRow = new Vec2(7, 40)
        // Do generic setup for a GameLevel
        super.startScene();

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level_music", loop: true, holdReference: true});
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
    show_art(): void {
        this.addLevelBackgroundImage("art","UI",this.viewport.getHalfSize(),new Vec2(3,3),1);
    }
}