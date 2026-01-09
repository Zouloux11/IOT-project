package server

import (
	"fmt"
	"net/url"

	"scoresmanager"
	"scoresmanager/server/models"

	"github.com/jirenius/go-res"
	"github.com/loungeup/go-loungeup/pkg/resutil"
)

func (s *Server) addPlayerStatsHandler() {
	provider := &playerStatsProvider{s}

	s.service.Handle("game.$gameType.player.$playerName.stats",
		res.Access(res.AccessGranted),
		res.GetModel(resutil.UseGetModelHandler(provider)),
	)
}

type playerStatsProvider struct{ server *Server }

func (p *playerStatsProvider) ParseModelSelector(resource res.Resource) (*scoresmanager.PlayerStatsSelector, error) {
	gameType := scoresmanager.GameType(resource.PathParam("gameType"))
	playerName := resource.PathParam("playerName")

	if err := gameType.Validate(); err != nil {
		return nil, fmt.Errorf("invalid game type: %s", gameType)
	}

	return &scoresmanager.PlayerStatsSelector{
		GameType:   gameType,
		PlayerName: playerName,
	}, nil
}

func (p *playerStatsProvider) ReadModel(sel *scoresmanager.PlayerStatsSelector) (*scoresmanager.PlayerStats, error) {
	return p.server.store.Games.GetPlayerStats(sel.GameType, sel.PlayerName)
}

func (p *playerStatsProvider) MakeModelQuery(*scoresmanager.PlayerStatsSelector) url.Values {
	return nil
}

func (p *playerStatsProvider) MapModel(stats *scoresmanager.PlayerStats) interface{} {
	return &models.PlayerStatsModel{
		Success: true,
		Stats: res.DataValue[models.PlayerStatsData]{
			Data: models.PlayerStatsData{
				PlayerName:   stats.PlayerName,
				BestScore:    stats.BestScore,
				TotalGames:   stats.TotalGames,
				AverageScore: stats.AverageScore,
				Rank:         stats.Rank,
			},
		},
	}
}

func (p *playerStatsProvider) MakeModelRID(stats *scoresmanager.PlayerStats) string {
	return "scoresmanager.game." + string(stats.GameType) + ".player." + stats.PlayerName + ".stats"
}
