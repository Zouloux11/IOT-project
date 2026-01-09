package server

import (
	"fmt"
	"net/url"
	"strconv"

	"scoresmanager"
	"scoresmanager/server/models"

	"github.com/jirenius/go-res"
	"github.com/loungeup/go-loungeup/pkg/resutil"
)

func (s *Server) addLeaderboardHandler() {
	provider := &leaderboardProvider{s}

	s.service.Handle("game.$gameType.leaderboard",
		res.Access(res.AccessGranted),
		res.GetModel(resutil.UseGetModelHandler(provider)),
	)
}

type leaderboardProvider struct{ server *Server }

func (p *leaderboardProvider) ParseModelSelector(resource res.Resource) (*scoresmanager.LeaderboardSelector, error) {
	gameType := scoresmanager.GameType(resource.PathParam("gameType"))
	if err := gameType.Validate(); err != nil {
		return nil, fmt.Errorf("invalid game type: %s", gameType)
	}

	query := resource.ParseQuery()
	limit := 10
	if l := query.Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	return &scoresmanager.LeaderboardSelector{
		GameType: gameType,
		Limit:    limit,
	}, nil
}

func (p *leaderboardProvider) ReadModel(sel *scoresmanager.LeaderboardSelector) (*scoresmanager.LeaderboardContent, error) {
	scores, err := p.server.store.Games.GetLeaderboard(sel.GameType, sel.Limit)
	if err != nil {
		return nil, err
	}

	return &scoresmanager.LeaderboardContent{
		GameType: string(sel.GameType),
		Scores:   scores,
		Limit:    sel.Limit,
	}, nil
}

func (p *leaderboardProvider) MakeModelQuery(*scoresmanager.LeaderboardSelector) url.Values {
	return nil
}

func (p *leaderboardProvider) MapModel(content *scoresmanager.LeaderboardContent) interface{} {
	entries := make([]models.LeaderboardEntry, len(content.Scores))
	for i, score := range content.Scores {
		entries[i] = models.LeaderboardEntry{
			PlayerName: score.PlayerName,
			Score:      score.Score,
			Date:       score.CreatedAt.Time.Format("2006-01-02T15:04:05Z"),
			Rank:       i + 1,
		}
	}

	return &models.LeaderboardModel{
		GameType: content.GameType,
		Limit:    content.Limit,
		Leaderboard: res.DataValue[[]models.LeaderboardEntry]{
			Data: entries,
		},
	}
}

func (p *leaderboardProvider) MakeModelRID(content *scoresmanager.LeaderboardContent) string {
	return "scoresmanager.game." + content.GameType + ".leaderboard"
}
