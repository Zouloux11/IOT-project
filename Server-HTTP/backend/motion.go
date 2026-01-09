package sensormanager

import (
	"errors"
	"strings"
	"time"
)

type MotionData struct {
	ID             int64
	DeviceID       string
	MotionDetected bool
	RecordedAt     time.Time
}

type MotionParams struct {
	DeviceID       string
	MotionDetected bool
}

func (p *MotionParams) Sanitize() error {
	p.DeviceID = strings.TrimSpace(p.DeviceID)
	if p.DeviceID == "" {
		return errors.New("device ID cannot be empty")
	}

	return nil
}
