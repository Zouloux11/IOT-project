package store

import (
	"context"
	"database/sql"
	"fmt"
	"scoresmanager"
	"time"

	"scoresmanager/store/models"
	"scoresmanager/store/modext"

	"github.com/google/uuid"
	"github.com/loungeup/go-loungeup/pkg/errors"
	"github.com/volatiletech/null/v8"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"github.com/volatiletech/sqlboiler/v4/queries/qm"
)

type gamesStore struct{ baseStore *Store }

var _ scoresmanager.ScoresManager = (*gamesStore)(nil)

func (gs *gamesStore) CreateOneScore(
	scoreParams *scoresmanager.ScoreParams,
) (score *scoresmanager.Score, err error) {
	if err = scoreParams.Sanitize(); err != nil {
		return nil, err
	}

	score = &scoresmanager.Score{
		ID:         uuid.New(),
		CreatedAt:  null.TimeFrom(time.Now()),
		PlayerName: scoreParams.PlayerName,
		Score:      scoreParams.Score,
		GameType:   scoreParams.GameType,
	}

	return score, insertScore(gs.baseStore.db, score)
}

func (gs *gamesStore) ReadOneScore(
	selector *scoresmanager.ScoreSelector,
) (*scoresmanager.Score, error) {
	if err := selector.Sanitize(); err != nil {
		return nil, err
	}

	score, err := readOneScore(gs.baseStore.db, selector)
	if err != nil {
		return nil, err
	}

	return score, nil
}

func (gs *gamesStore) DeleteOneScore(
	selector *scoresmanager.ScoreSelector,
) error {
	if err := selector.Sanitize(); err != nil {
		return err
	}

	return deleteOneScore(gs.baseStore.db, selector)
}

func (gs *gamesStore) GetLeaderboard(
	gameType scoresmanager.GameType,
	limit int,
) ([]*scoresmanager.Score, error) {
	if err := scoresmanager.GameType(gameType).Validate(); err != nil {
		return nil, err
	}

	return getLeaderboard(gs.baseStore.db, gameType, limit)
}

func (gs *gamesStore) GetPlayerStats(
	gameType scoresmanager.GameType,
	playerName string,
) (*scoresmanager.PlayerStats, error) {
	if err := scoresmanager.GameType(gameType).Validate(); err != nil {
		return nil, err
	}

	return getPlayerStats(gs.baseStore.db, gameType, playerName)
}

func (gs *gamesStore) IsNewRecord(
	gameType scoresmanager.GameType,
	score int,
) (bool, error) {
	if err := scoresmanager.GameType(gameType).Validate(); err != nil {
		return false, err
	}

	return isNewRecord(gs.baseStore.db, gameType, score)
}

func (gs *gamesStore) GetPlayerRank(
	gameType scoresmanager.GameType,
	playerName string,
) (int, error) {
	if err := scoresmanager.GameType(gameType).Validate(); err != nil {
		return 0, err
	}

	return getPlayerRank(gs.baseStore.db, gameType, playerName)
}

// Database operations

func insertScore(db boil.ContextExecutor, score *scoresmanager.Score) error {
	model := &models.Score{
		ID:         score.ID.String(),
		Playername: score.PlayerName,
		Score:      score.Score,
		Gametype:   string(score.GameType),
		Createdat:  score.CreatedAt,
		Deletedat:  null.Time{},
	}

	if err := errors.MapSQLError(model.Insert(context.TODO(), db, boil.Infer())); err != nil {
		return err
	}

	return nil
}

func readOneScore(db boil.ContextExecutor, scoreSelector *scoresmanager.ScoreSelector) (*scoresmanager.Score, error) {
	scoreDB, err := models.Scores(
		models.ScoreWhere.ID.EQ(scoreSelector.ScoreID.String()),
		models.ScoreWhere.Gametype.EQ(string(scoreSelector.GameType)),
		models.ScoreWhere.Deletedat.IsNull(),
	).One(context.TODO(), db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	score, err := modext.MapScore(scoreDB)
	if err != nil {
		return nil, err
	}

	return score, nil
}

func deleteOneScore(db boil.ContextExecutor, scoreSelector *scoresmanager.ScoreSelector) error {
	_, err := models.Scores(
		models.ScoreWhere.ID.EQ(scoreSelector.ScoreID.String()),
		models.ScoreWhere.Gametype.EQ(string(scoreSelector.GameType)),
		models.ScoreWhere.Deletedat.IsNull(),
	).UpdateAll(context.TODO(), db, models.M{models.ScoreColumns.Deletedat: time.Now()})
	if err != nil {
		return errors.MapSQLError(err)
	}

	return nil
}

func getLeaderboard(db boil.ContextExecutor, gameType scoresmanager.GameType, limit int) ([]*scoresmanager.Score, error) {
	scoresDB, err := models.Scores(
		models.ScoreWhere.Gametype.EQ(string(gameType)),
		models.ScoreWhere.Deletedat.IsNull(),
		qm.OrderBy(fmt.Sprintf("%s ASC", models.ScoreColumns.Score)), // ASC pour les temps de réaction (plus bas = meilleur)
		qm.Limit(limit),
	).All(context.TODO(), db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	scores := make([]*scoresmanager.Score, len(scoresDB))
	for i, scoreDB := range scoresDB {
		score, err := modext.MapScore(scoreDB)
		if err != nil {
			return nil, err
		}
		scores[i] = score
	}

	return scores, nil
}

func getPlayerStats(db boil.ContextExecutor, gameType scoresmanager.GameType, playerName string) (*scoresmanager.PlayerStats, error) {
	// Get all scores for this player and game type
	scoresDB, err := models.Scores(
		models.ScoreWhere.Gametype.EQ(string(gameType)),
		models.ScoreWhere.Playername.EQ(playerName),
		models.ScoreWhere.Deletedat.IsNull(),
		qm.OrderBy(fmt.Sprintf("%s ASC", models.ScoreColumns.Score)),
	).All(context.TODO(), db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	if len(scoresDB) == 0 {
		return nil, &errors.Error{
			Code:    errors.CodeNotFound,
			Message: fmt.Sprintf("No scores found for player %s in game %s", playerName, gameType),
		}
	}

	// Calculate stats
	totalGames := len(scoresDB)
	bestScore := scoresDB[0].Score // First one is the best (lowest for reaction time)

	totalScore := 0
	for _, score := range scoresDB {
		totalScore += score.Score
	}
	averageScore := float64(totalScore) / float64(totalGames)

	// Get player rank
	rank, err := getPlayerRank(db, gameType, playerName)
	if err != nil {
		return nil, err
	}

	return &scoresmanager.PlayerStats{
		PlayerName:   playerName,
		BestScore:    bestScore,
		TotalGames:   totalGames,
		AverageScore: averageScore,
		Rank:         rank,
	}, nil
}

func isNewRecord(db boil.ContextExecutor, gameType scoresmanager.GameType, score int) (bool, error) {
	// Get the current best score (lowest for reaction time)
	bestScoreDB, err := models.Scores(
		models.ScoreWhere.Gametype.EQ(string(gameType)),
		models.ScoreWhere.Deletedat.IsNull(),
		qm.OrderBy(fmt.Sprintf("%s ASC", models.ScoreColumns.Score)),
		qm.Limit(1),
	).One(context.TODO(), db)
	if err != nil {
		if err == sql.ErrNoRows {
			// No existing scores, so this is automatically a new record
			return true, nil
		}
		return false, errors.MapSQLError(err)
	}

	// For reaction time, lower is better
	return score < bestScoreDB.Score, nil
}

func getPlayerRank(db boil.ContextExecutor, gameType scoresmanager.GameType, playerName string) (int, error) {
	// Get the player's best score
	playerBestScore, err := models.Scores(
		models.ScoreWhere.Gametype.EQ(string(gameType)),
		models.ScoreWhere.Playername.EQ(playerName),
		models.ScoreWhere.Deletedat.IsNull(),
		qm.OrderBy(fmt.Sprintf("%s ASC", models.ScoreColumns.Score)),
		qm.Limit(1),
	).One(context.TODO(), db)
	if err != nil {
		return 0, errors.MapSQLError(err)
	}

	// Count how many unique players have a better score
	query := `
		SELECT COUNT(DISTINCT playername) + 1 as rank
		FROM scores 
		WHERE gametype = $1 
		AND deletedat IS NULL 
		AND score < $2
	`

	var rank int
	err = db.QueryRowContext(context.TODO(), query, gameType, playerBestScore.Score).Scan(&rank)
	if err != nil {
		return 0, fmt.Errorf("failed to get player rank: %w", err)
	}

	return rank, nil
}

// Helper functions for specific game logic

func (gs *gamesStore) GetTopPlayersCount(gameType scoresmanager.GameType) (int, error) {
	if err := scoresmanager.GameType(gameType).Validate(); err != nil {
		return 0, err
	}

	query := `
		SELECT COUNT(DISTINCT playername)
		FROM scores 
		WHERE gametype = $1 
		AND deletedat IS NULL
	`

	var count int
	err := gs.baseStore.db.QueryRowContext(context.TODO(), query, gameType).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get top players count: %w", err)
	}

	return count, nil
}

func (gs *gamesStore) GetRecentScores(gameType scoresmanager.GameType, limit int) ([]*scoresmanager.Score, error) {
	if err := scoresmanager.GameType(gameType).Validate(); err != nil {
		return nil, err
	}

	scoresDB, err := models.Scores(
		models.ScoreWhere.Gametype.EQ(string(gameType)),
		models.ScoreWhere.Deletedat.IsNull(),
		qm.OrderBy(fmt.Sprintf("%s DESC", models.ScoreColumns.Createdat)),
		qm.Limit(limit),
	).All(context.TODO(), gs.baseStore.db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	scores := make([]*scoresmanager.Score, len(scoresDB))
	for i, scoreDB := range scoresDB {
		score, err := modext.MapScore(scoreDB)
		if err != nil {
			return nil, err
		}
		scores[i] = score
	}

	return scores, nil
}
