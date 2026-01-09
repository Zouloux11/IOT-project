package models

import "github.com/jirenius/go-res"

// Structure pour une entrée du leaderboard
type LeaderboardEntry struct {
	PlayerName string `json:"playerName"`
	Score      int    `json:"score"`
	Date       string `json:"date"`
	Rank       int    `json:"rank"`
}

// Modèle principal pour le leaderboard
type LeaderboardModel struct {
	GameType    string                            `json:"gameType"`
	Limit       int                               `json:"limit"`
	Leaderboard res.DataValue[[]LeaderboardEntry] `json:"leaderboard"`
}

type PlayerStatsData struct {
	PlayerName   string  `json:"playerName"`
	BestScore    int     `json:"bestScore"`
	TotalGames   int     `json:"totalGames"`
	AverageScore float64 `json:"averageScore"`
	Rank         int     `json:"rank"`
}

// Modèle principal pour les stats d'un joueur
type PlayerStatsModel struct {
	Success bool                           `json:"success"`
	Stats   res.DataValue[PlayerStatsData] `json:"stats"`
}
