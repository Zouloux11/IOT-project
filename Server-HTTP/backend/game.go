package scoresmanager

import (
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/volatiletech/null/v8"
)

type GameType string

const (
	GameTypeReaction GameType = "reaction"
)

type Score struct {
	ID         uuid.UUID
	PlayerName string
	Score      int
	GameType   GameType
	CreatedAt  null.Time
}

type ScoreParams struct {
	PlayerName string
	Score      int
	GameType   GameType
}

type ScoreSelector struct {
	ScoreID  uuid.UUID
	GameType GameType
}

func (gt GameType) Validate() error {
	switch gt {
	case GameTypeReaction:
		return nil
	default:
		return fmt.Errorf("invalid game type: %s", gt)
	}
}

func (p *ScoreParams) Sanitize() error {
	p.PlayerName = strings.TrimSpace(p.PlayerName)
	if p.PlayerName == "" {
		return errors.New("player name cannot be empty")
	}

	if err := p.GameType.Validate(); err != nil {
		return err
	}

	if p.Score < 0 {
		return errors.New("score cannot be negative")
	}

	return nil
}

func (s *ScoreSelector) Sanitize() error {

	if err := s.GameType.Validate(); err != nil {
		return err
	}

	if s.ScoreID == uuid.Nil {
		return errors.New("score ID cannot be nil")
	}

	return nil
}

type ScoresManager interface {
	CreateOneScore(params *ScoreParams) (*Score, error)

	ReadOneScore(selector *ScoreSelector) (*Score, error)

	DeleteOneScore(selector *ScoreSelector) error

	GetLeaderboard(gameType GameType, limit int) ([]*Score, error)

	GetPlayerStats(gameType GameType, playerName string) (*PlayerStats, error)

	IsNewRecord(gameType GameType, score int) (bool, error)
}
