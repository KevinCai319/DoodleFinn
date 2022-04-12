import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Layer from "../../Wolfie2D/Scene/Layer";
import GameLevel from "./Game";

export default class Tutorial extends GameLevel {
    LEVEL_NAME:string ="Tutorial"
    LEVEL_TILESET:string = "Tutorial"
    Instructions:AnimatedSprite = null
    Controls:AnimatedSprite = null
    loadScene(): void {
        // Load resources
        this.load.tilemap(this.LEVEL_NAME, "game_assets/tilemaps/"+this.LEVEL_NAME+"/"+this.LEVEL_NAME+".json");
        this.load.spritesheet("player", "game_assets/spritesheets/DoodleFinn/DoodleFinn-Sprite.json");
        this.load.spritesheet("gun_enemy", "game_assets/spritesheets/gun_enemy.json");
        this.load.spritesheet("pink_paper", "game_assets/spritesheets/pink_paper.json");
        this.load.spritesheet("white_paper", "game_assets/spritesheets/white_paper.json");
        this.load.spritesheet("cursor", "game_assets/spritesheets/cursor.json");
        this.load.spritesheet("LevelSelect", "game_assets/spritesheets/LevelSelect.json");
        this.load.spritesheet("help", "game_assets/spritesheets/help.json");
        this.load.spritesheet("InstructionsButton", "game_assets/spritesheets/TutorialAssets/InstructionsButton.json")
        this.load.spritesheet("Controls","game_assets/spritesheets/TutorialAssets/Controls.json" )
        // Load in the enemy info
        this.load.object("enemyData", "game_assets/data/enemy.json");
    }

    // DoodleFinn TODO
    /**
     * If you are moving to another level.
     * To keep: 
     *  Spritesheets for the player, enemies, and items.
     *  SFX and music.
     * 
     * 
     */
    unloadScene(){
        // Keep resources - this is up to you
        this.load.keepSpritesheet("player");
        
    }

    startScene(): void {
        // Add the Demo Level.
        this.nextLevel = null
        this.playerSpawnColRow = new Vec2(77,10)
        // Do generic setup for a GameLevel
        this.backgroundSetup.push((layer:Layer)=>{
            let selectSign = this.addLevelGraphic("LevelSelect",layer.getName(),new Vec2(84,12.8).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(3,3))
            selectSign.alpha = 0.5
            let helpSign = this.addLevelGraphic("help",layer.getName(),new Vec2(69.3,11.6).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(1.75,1.75))
            helpSign.alpha = 0.5
            this.Instructions = this.addLevelGraphic("InstructionsButton",layer.getName(), new Vec2(75,13.4).mult(GameLevel.DEFAULT_LEVEL_TILE_SIZE),new Vec2(2,2))
        })
        super.startScene();
        this.Controls = this.add.animatedSprite("Controls","UI")
        this.Controls.position= this.getViewport().getHalfSize()
        this.Controls.scale=  this.Controls.position.scaled(2).div(this.Controls.size)
        this.Controls.visible = false
        this.viewport.setZoomLevel(1.25);
        this.viewport.setBounds(0, 0, this.dynamicMap.getDimensions().x*GameLevel.DEFAULT_LEVEL_TILE_SIZE.x, this.dynamicMap.getDimensions().y*GameLevel.DEFAULT_LEVEL_TILE_SIZE.y)
        this.enemies.forEach(enemy => {
            enemy.setAIActive(false, {});
            enemy.isCollidable = false;
            enemy.visible = false;
        })
        this.livesCountLabel.destroy()
        this.papersCountLabel.destroy()
        this.levelEndLabel.destroy()
        // this.levelTransitionScreen.destroy()
        this.livesCount = 1
        
    }

    updateScene(deltaT: number): void {
        let region = Input.getGlobalMousePosition().x/GameLevel.DEFAULT_LEVEL_TILE_SIZE.x
        if(!this.Controls.visible){
            this.cursorDisabled = this.cursor.boundary.containsPoint(this.Instructions.position)
        }

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