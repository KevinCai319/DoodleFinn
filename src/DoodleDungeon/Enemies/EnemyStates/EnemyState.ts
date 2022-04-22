import State from "../../../Wolfie2D/DataTypes/State/State";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import GameLevel from "../../Scenes/Game";
import EnemyAI from "../EnemyAI";

export default abstract class EnemyState extends State {
    protected parent: EnemyAI;
    protected owner: GameNode;
    triggerDistance: number = GameLevel.DEFAULT_LEVEL_TILE_SIZE.x*10;
    constructor(parent: EnemyAI, owner: GameNode){
      super(parent);
      this.owner = owner;
    }
}