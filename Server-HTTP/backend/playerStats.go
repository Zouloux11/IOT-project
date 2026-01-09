package scoresmanager

type PlayerStats struct {
	PlayerName   string
	BestScore    int
	TotalGames   int
	GameType     GameType
	AverageScore float64
	Rank         int
}

type PlayerStatsSelector struct {
	GameType   GameType
	PlayerName string
}
