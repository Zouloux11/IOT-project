package models

type ScoreParams struct {
	PlayerName string `json:"playerName"`
	Score      int    `json:"score"`
	GameType   string `json:"gameType"`
}
