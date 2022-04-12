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
import Tutorial from "./Tutorial";

export default class MainMenu extends Scene {

    loadScene(): void {
        // Load the menu song

    }

    startScene(): void {
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
    unloadScene(): void {
    }
}

