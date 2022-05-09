import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import HealthBar from "../UI/HealthBar";

export default interface BattlerAI extends AI {
    owner: GameNode;

    health: number;
    healthBar: HealthBar;
    damage: (damage: number) => void;
}