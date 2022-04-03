import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import ArrayUtils from "../../Wolfie2D/Utils/ArrayUtils";
import Color from "../../Wolfie2D/Utils/Color";
import PriorityQueue from "../../Wolfie2D/Utils/PriorityQueue";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";
import SortingUtils from "../../Wolfie2D/Utils/SortingUtils";
import Game from "./Game";
import Level1 from "./Level1";

export default class MainMenu extends Scene {

    animatedSprite: AnimatedSprite;

    loadScene(): void {
        // Load the menu song

    }

    startScene(): void {
        this.addUILayer("Main");

        // Center the viewport
        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);

        this.viewport.setZoomLevel(1);

        // Create a play button
        let playBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "Main", {position: new Vec2(size.x, size.y), text: "Play Game"});
        playBtn.backgroundColor = Color.TRANSPARENT;
        playBtn.borderColor = Color.WHITE;
        playBtn.borderRadius = 0;
        playBtn.setPadding(new Vec2(50, 10));
        playBtn.font = "PixelSimple";
        // When the play button is clicked, go to the next scene
        playBtn.onClick = () => {
            /*
                Init the next scene with physics collisions:

                          ground  player  balloon 
                ground    No      --      -- 
                player    Yes      No      --  
                balloon   Yes      No      No  

                Each layer becomes a number. In this case, 4 bits matter for each

                ground:  self - 000, collisions - 011
                player:  self - 001, collisions - 100
                balloon: self - 010, collisions - 000
            */

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
            this.sceneManager.changeToScene(Level1, {}, sceneOptions);
        }

        // Scene has started, so start playing music
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "menu", loop: true, holdReference: true});
    }

    unloadScene(): void {
    }
}

