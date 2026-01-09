package sensormanager

import (
	"errors"
	"strings"
	"time"
)

type DistanceData struct {
	ID         int64
	DeviceID   string
	DistanceCm float64
	RecordedAt time.Time
}

type DistanceParams struct {
	DeviceID   string
	DistanceCm float64
}

func (p *DistanceParams) Sanitize() error {
	p.DeviceID = strings.TrimSpace(p.DeviceID)
	if p.DeviceID == "" {
		return errors.New("device ID cannot be empty")
	}

	if p.DistanceCm < 0 || p.DistanceCm > 1000 {
		return errors.New("distance must be between 0 and 1000 cm")
	}

	return nil
}
