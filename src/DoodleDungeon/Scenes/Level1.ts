import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./Game";
import Home from "./Home";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Level1 extends GameLevel {
    LEVEL_NAME: string = "Level_1"
    LEVEL_TILESET: string = "Level_1"
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/" + this.LEVEL_NAME + "/" + this.LEVEL_TILESET + ".json");
        this.load.spritesheet("player", "game_assets/spritesheets/DoodleFinn/DoodleFinn-Sprite.json");
        this.load.spritesheet("melee_enemy", "game_assets/spritesheets/FlyEnemy/FlyEnemy.json")
        this.load.spritesheet("charging_enemy", "game_assets/spritesheets/ChargeEnemy/ChargeEnemy.json")

        this.load.spritesheet("pink_paper", "game_assets/spritesheets/pink_paper.json");
        this.load.spritesheet("white_paper", "game_assets/spritesheets/white_paper.json");
        this.load.spritesheet("cursor", "game_assets/spritesheets/cursor.json");
        this.load.image("heart", "game_assets/spritesheets/Full_Heart.png");
        this.load.image("half_heart", "game_assets/spritesheets/Half_Heart.png");
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/" + this.LEVEL_NAME + "/enemy.json");

        this.load.audio("level_music", "game_assets/music/doodlefinn_level_music.wav")

        this.load.audio("player_hit_enemy", "game_assets/sounds/coin.wav")
        this.load.audio("jump", "game_assets/sounds/coin.wav")

        this.load.audio("player_death", "game_assets/sounds/coin.wav")
        this.load.audio("player_hurt", "game_assets/sounds/coin.wav")
        this.load.audio("scribble", "game_assets/sounds/coin.wav")
        this.load.audio("erase", "game_assets/sounds/coin.wav")
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
        this.load.keepSpritesheet("player");
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
        this.playerSpawnColRow = new Vec2(7, 40)
        // Do generic setup for a GameLevel
        super.startScene();

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level_music", loop: true, holdReference: true});
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}