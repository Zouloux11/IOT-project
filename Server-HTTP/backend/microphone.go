package sensormanager

import (
	"errors"
	"strings"
	"time"
)

type MicrophoneData struct {
	ID         int64
	DeviceID   string
	Decibels   float64
	RecordedAt time.Time
}

type MicrophoneParams struct {
	DeviceID string
	Decibels float64
}

func (p *MicrophoneParams) Sanitize() error {
	p.DeviceID = strings.TrimSpace(p.DeviceID)
	if p.DeviceID == "" {
		return errors.New("device ID cannot be empty")
	}

	if p.Decibels < 0 || p.Decibels > 200 {
		return errors.New("decibels must be between 0 and 200")
	}

	return nil
}
