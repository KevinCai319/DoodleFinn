export enum Game_Events {
	PLAYER_ENTERED_LEVEL_END = "PlayerEnteredLevelEnd",
	PLAYER_LOSE_LIFE = "PlayerOutOfBounds",
	PLAYER_HURT = "PlayerHurt",
	PLAYER_INVINCIBLE = "PlayerInvincible",
	PLAYER_INVINCIBLE_END = "PlayerInvincibleEnd",
	PINK_PAPER_FOUND = "PinkPaperFound",
	WHITE_PAPER_FOUND = "WhitePaperFound",
	LEVEL_START = "LevelStart",
	LEVEL_END = "LevelEnd",
	PLAYER_KILLED = "PlayerKilled",
	PLAYER_MOVE = "PlayerMoved",
	PLAYER_ATTACK = "PlayerAttacked",
	PLAYER_ATTACK_FINISHED = "PlayerAttackFinished",
	PLAYER_BALLOON_POPPED = "PlayerBalloonPopped",
	PLAYER_BALLOON_PICKED_UP = "PlayerBalloonPickedUp",
	SPLASH_SCREEN_SHOW = "SplashShow",
	SPLASH_SCREEN_END = "SplashDone",
	GAME_PAUSE = "GAME_PAUSE",
	GAME_SHOW_IMAGE = "GAME_SHOW_IMAGE"
}
export enum Game_Names {
    NAVMESH = "navmesh"
}
export enum Game_Collectables{
    WHITE_PAPER = 4,
    PINK_PAPER =  5
}
export enum Tileset_Names {
	SOLID_INK = 81
}
export enum AI_Statuses {
    IN_RANGE = "IN_RANGE",
    LOW_HEALTH = "LOW_HEALTH",
    CAN_RETREAT = "CAN_RETREAT",
    CAN_BERSERK = "CAN_BERSERK",
    REACHED_GOAL = "GOAL",

    MOVE_DONE = "MOVE_DONE",
    WAIT_DONE = "WAIT_DONE",
    CAN_ATTACK = "CAN_ATTACK"
}