package server

import (
	"scoresmanager/store"

	"github.com/jirenius/go-res"
)

type Server struct {
	service *res.Service
	store   *store.Store
}

type Option func(*Server)

func New(options ...Option) *Server {
	result := &Server{
		//...
	}

	for _, option := range options {
		option(result)
	}

	if result.service == nil {
		panic("could not create server without RES service")
	}

	if result.store == nil {
		panic("could not create server without Store configuration")
	}

	result.addRESHandlers()

	return result
}

func WithService(service *res.Service) Option { return func(s *Server) { s.service = service } }

func WithStore(store *store.Store) Option { return func(s *Server) { s.store = store } }

func (s *Server) addRESHandlers() {
	s.addScoreHandler()
	s.addLeaderboardHandler()
	s.addPlayerStatsHandler()
}
