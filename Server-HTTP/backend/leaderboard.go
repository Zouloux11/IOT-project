package scoresmanager

type LeaderboardSelector struct {
	GameType GameType
	Limit    int
}

type LeaderboardContent struct {
	GameType string
	Scores   []*Score
	Limit    int
}
