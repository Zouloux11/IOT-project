package store

import (
	"database/sql"
	"fmt"
	"sensormanager"
)

type Store struct {
	Sensors       sensormanager.SensorManager
	Notifications sensormanager.NotificationManager

	db *sql.DB
}

type Option func(*Store) error

func New(options ...Option) *Store {
	result := &Store{}

	result.Sensors = &sensorsStore{baseStore: result}
	result.Notifications = &notificationsStore{baseStore: result}

	for _, option := range options {
		if err := option(result); err != nil {
			panic(fmt.Errorf("could not create store: %w", err))
		}
	}

	return result
}

func WithDB(db *sql.DB) Option {
	return func(s *Store) error {
		if err := db.Ping(); err != nil {
			return fmt.Errorf("could not ping database: %w", err)
		}

		s.db = db

		return nil
	}
}
