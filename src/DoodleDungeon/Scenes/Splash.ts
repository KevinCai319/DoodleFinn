import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import ArrayUtils from "../../Wolfie2D/Utils/ArrayUtils";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import PriorityQueue from "../../Wolfie2D/Utils/PriorityQueue";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";
import SortingUtils from "../../Wolfie2D/Utils/SortingUtils";
import { Game_Events } from "../Events";
import Game from "./Game";
import Level1 from "./Level1";
import Tutorial from "./Tutorial";

export default class Splash extends Scene {

    logo: AnimatedSprite;
    clicked:boolean = false;
    loadScene(): void {
        // Load the menu song
        this.load.spritesheet("splash_screen", "game_assets/spritesheets/splash_screen.json")
    }

    startScene(): void {
        this.addUILayer("UI");
        let back = this.add.graphic(GraphicType.RECT, "UI", { position: new Vec2(2000, 2000), size: new Vec2(4000, 4000) });
        back.color = Color.WHITE
        this.logo = this.add.animatedSprite("splash_screen","UI")
        this.logo.position= this.getViewport().getHalfSize()
        this.logo.scale = this.logo.position.scaled(2).div(this.logo.size)
        this.logo.animation.playIfNotAlready("idle",false)
        this.logo.tweens.add("fadeOut", {
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
            onEnd: Game_Events.SPLASH_SCREEN_END
        });

        // Center the viewport
        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);
        this.viewport.setZoomLevel(1);
        
      
    }
    protected subscribeToEvents() {
        this.receiver.subscribe([
            Game_Events.SPLASH_SCREEN_END,
            Game_Events.SPLASH_SCREEN_SHOW
        ]);
    }
    updateScene(deltaT: number): void {
        if(Input.isMouseJustPressed() && !this.clicked){
            this.logo.tweens.play("fadeOut");
            this.clicked = true
        }
        if(this.logo.alpha == 0){
            let sceneOptions = {
                physics: {
                    groupNames: ["ground", "player","enemy"],
                    collisions:
                    [
                        [0, 1, 1],
                        [1, 0, 0],
                        [1, 0, 0]
                    ]
                }
            }
            this.sceneManager.changeToScene(Tutorial, {}, sceneOptions);
        }
    }
    unloadScene(): void {
    }
}


