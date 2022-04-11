export enum Game_Events {
    PLAYER_ENTERED_LEVEL_END = "PlayerEnteredLevelEnd",
    PLAYER_OUT_OF_BOUNDS = "PlayerOutOfBounds",
    PLAYER_INVINCIBLE = "PlayerInvincible",
    PLAYER_INVINCIBLE_END = "PlayerInvincibleEnd",
    PINK_PAPER_FOUND = "PinkPaperFound",
    WHITE_PAPER_FOUND = "WhitePaperFound",
    LEVEL_START = "LevelStart",
    LEVEL_END = "LevelEnd",
    PLAYER_KILLED = "PlayerKilled",
    PLAYER_MOVE = "PlayerMoved"
}
export enum Game_Names {
    NAVMESH = "navmesh"
}

export enum AI_Statuses {
    IN_RANGE = "IN_RANGE",
    LOW_HEALTH = "LOW_HEALTH",
    CAN_RETREAT = "CAN_RETREAT",
    CAN_BERSERK = "CAN_BERSERK",
    REACHED_GOAL = "GOAL",

    WAIT_DONE = "WAIT_DONE",
    CAN_ATTACK = "CAN_ATTACK"
}