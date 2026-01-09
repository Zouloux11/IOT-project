package modext

import (
	"scoresmanager"
	"scoresmanager/store/models"

	"github.com/google/uuid"
)

func MapScore(scoreDB *models.Score) (*scoresmanager.Score, error) {
	scoreID, err := uuid.Parse(scoreDB.ID)
	if err != nil {
		return nil, err
	}

	gameType := scoresmanager.GameType(scoreDB.Gametype)

	return &scoresmanager.Score{
		ID:         scoreID,
		PlayerName: scoreDB.Playername,
		Score:      scoreDB.Score,
		GameType:   gameType,
		CreatedAt:  scoreDB.Createdat,
	}, nil
}
