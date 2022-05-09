import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import BattlerAI from "../Enemies/BattlerAI";
import GameLevel from "../Scenes/Game";


export default class HealthBar {
    protected hearts: Array<Sprite>;
    protected entity: BattlerAI;
    protected absoluteOffset: boolean;
    protected offset: Vec2 = Vec2.ZERO;
    protected spacing: number = 20;
    // Create the health bar for the entity.
    constructor(Game: GameLevel, layerName:string, entity: BattlerAI, maxHealth: number,
                offset: Vec2, absolute: boolean = false,spacing: number, scale: Vec2 = new Vec2(1, 1)) {
        this.entity = entity;
        this.offset = offset;
        this.spacing = spacing;
        this.absoluteOffset = absolute;
        this.hearts = new Array<Sprite>();
        let location = this.offset.clone();
        if(!this.absoluteOffset){
            location.add(this.entity.owner.position);
        }
        try {
            for (let i = 0; i < Math.ceil(maxHealth/2.0); i++) {
                this.hearts.push(Game.addLevelBackgroundImage("half_heart", layerName, location, scale));
                this.hearts.push(Game.addLevelBackgroundImage("heart", layerName, location, scale));
                location.x += spacing;
            }
            if(!this.absoluteOffset){
                let totalWidth = ((this.hearts.length/2-1) * this.spacing) + (this.hearts.length * this.hearts[0].boundary.hw);
                this.offset.x -= totalWidth/2;
            }
        } catch (e) {

        }
    }

    // Update the health bar to reflect the current health of the entity.
    updateHealthBar(): void {
        let entityHealth = this.entity.health;
        let entityPosition = this.offset.clone();
        if(!this.absoluteOffset){
            entityPosition.add(this.entity.owner.position.clone());
        }
        for (let i = 0; i < this.hearts.length; i++) {
            this.hearts[i].position = entityPosition.clone()
            if (i % 2 == 1) {
                this.hearts[i].visible = (i + 1 <= entityHealth);
            } else {
                this.hearts[i].visible = (i + 1 == entityHealth && entityHealth % 2 == 1);
            }
            if(i % 2 == 1){
                entityPosition.x += this.spacing;
            }
        }
    }
    removeHealthBar(): void {
        for (let i = 0; i < this.hearts.length; i++) {
            this.hearts[i].destroy();
        }
    }
}