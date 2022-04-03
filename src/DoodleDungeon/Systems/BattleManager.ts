import GameNode from "../../Wolfie2D/Nodes/GameNode";
import BattlerAI from "../Enemies/BattlerAI";

export default class BattleManager {
    players: Array<BattlerAI>;

    enemies: Array<BattlerAI>;

    handleInteraction(attackerType: string) {
        if (attackerType === "player") {
            // Check for collisions with enemies

        } else {
            // Check for collision with player
  
        }
    }

    setPlayers(player: Array<BattlerAI>): void {
        this.players = player;
    }

    setEnemies(enemies: Array<BattlerAI>): void {
        this.enemies = enemies;
    }
}