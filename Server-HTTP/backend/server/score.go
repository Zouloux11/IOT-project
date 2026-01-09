package server

import (
	"fmt"
	"net/url"

	"scoresmanager"
	"scoresmanager/server/models"

	"github.com/jirenius/go-res"
	"github.com/loungeup/go-loungeup/pkg/resutil"
)

func (s *Server) addScoreHandler() {
	provider := &scoreProvider{s}

	hooks := []res.CallHandler{
		func(request res.CallRequest) {
			params, err := provider.ParseModelParams(request)
			if err != nil {
				fmt.Println(err.Error())
				return
			}
			request.Service().Reset([]string{
				"scoresmanager.game." + params.GameType + ".leaderboard",
			}, nil)
		},
	}

	s.service.Handle("game.$gameType.scores",
		res.Access(res.AccessGranted),
		res.Call("new", resutil.WithCallHandlerHooks(resutil.UseCreateModelHandler(provider), hooks)),
	)

	s.service.Handle("game.$gameType.scores.$scoreID",
		res.Access(res.AccessGranted),
		res.GetModel(resutil.UseGetModelHandler(provider)),
		res.Call("delete", resutil.WithCallHandlerHooks(resutil.UseDeleteModelHandler(provider), hooks)),
	)
}

type scoreProvider struct{ server *Server }

func (p *scoreProvider) CreateModel(params *models.ScoreParams) (*scoresmanager.Score, error) {
	gameType := scoresmanager.GameType(params.GameType)
	if err := gameType.Validate(); err != nil {
		return nil, fmt.Errorf("invalid game type: %s", params.GameType)
	}

	scoreParams := scoresmanager.ScoreParams{
		PlayerName: params.PlayerName,
		Score:      params.Score,
		GameType:   gameType,
	}

	score, err := p.server.store.Games.CreateOneScore(&scoreParams)
	if err != nil {
		return nil, err
	}

	isNewRecord, err := p.server.store.Games.IsNewRecord(gameType, params.Score)
	if err != nil {
		fmt.Printf("Error checking new record: %v\n", err)
	}
	if isNewRecord {
		fmt.Printf("New record achieved by %s with score %d in %s!\n",
			params.PlayerName, params.Score, gameType)
	}

	return score, nil
}

func (p *scoreProvider) ParseModelParams(request res.CallRequest) (*models.ScoreParams, error) {
	gameType := request.PathParam("gameType")
	result := &models.ScoreParams{GameType: gameType}
	request.ParseParams(result)
	return result, nil
}

func (p *scoreProvider) ParseModelSelector(resource res.Resource) (*scoresmanager.ScoreSelector, error) {
	scoreID, err := resutil.ParseUUIDPathParam(resource, "scoreID")
	if err != nil {
		return nil, err
	}
	gameType := scoresmanager.GameType(resource.PathParam("gameType"))
	if err := gameType.Validate(); err != nil {
		return nil, fmt.Errorf("invalid game type: %s", gameType)
	}
	return &scoresmanager.ScoreSelector{ScoreID: scoreID, GameType: gameType}, nil
}

func (p *scoreProvider) ReadModel(sel *scoresmanager.ScoreSelector) (*scoresmanager.Score, error) {
	return p.server.store.Games.ReadOneScore(sel)
}

func (p *scoreProvider) DeleteModel(sel *scoresmanager.ScoreSelector) error {
	return p.server.store.Games.DeleteOneScore(sel)
}

func (p *scoreProvider) MakeModelQuery(*scoresmanager.ScoreSelector) url.Values {
	return nil
}

func (p *scoreProvider) MapModel(score *scoresmanager.Score) interface{} {
	type Model struct {
		ID         string `json:"id"`
		PlayerName string `json:"playerName"`
		Score      int    `json:"score"`
		GameType   string `json:"gameType"`
		Date       string `json:"date"`
	}
	return &Model{
		ID:         score.ID.String(),
		PlayerName: score.PlayerName,
		Score:      score.Score,
		GameType:   string(score.GameType),
		Date:       score.CreatedAt.Time.Format("2006-01-02T15:04:05Z"),
	}
}

func (p *scoreProvider) MakeModelRID(score *scoresmanager.Score) string {
	return "scoresmanager.game." + string(score.GameType) + ".scores." + score.ID.String()
}
