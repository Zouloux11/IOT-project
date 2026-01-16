package sensormanager

import (
	"errors"
	"time"
)

type SensorType string

const (
	SensorTypeDistance   SensorType = "distance"
	SensorTypeMicrophone SensorType = "microphone"
	SensorTypeMotion     SensorType = "motion"
)

type DistanceData struct {
	ID         int64
	DeviceID   string
	DistanceCm float64
	RecordedAt time.Time
}

type DistanceParams struct {
	DeviceID   string  `json:"deviceId"`
	DistanceCm float64 `json:"distanceCm"`
}

func (p *DistanceParams) Sanitize() error {
	if p.DeviceID == "" {
		return errors.New("deviceId is required")
	}
	if p.DistanceCm < 0 {
		return errors.New("distanceCm must be positive")
	}
	return nil
}

type MicrophoneData struct {
	ID         int64
	DeviceID   string
	Decibels   float64
	RecordedAt time.Time
}

type MicrophoneParams struct {
	DeviceID string  `json:"deviceId"`
	Decibels float64 `json:"decibels"`
}

func (p *MicrophoneParams) Sanitize() error {
	if p.DeviceID == "" {
		return errors.New("deviceId is required")
	}
	if p.Decibels < 0 {
		return errors.New("decibels must be positive")
	}
	return nil
}

type MotionData struct {
	ID             int64
	DeviceID       string
	MotionDetected bool
	RecordedAt     time.Time
}

type MotionParams struct {
	DeviceID       string `json:"deviceId"`
	MotionDetected bool   `json:"motionDetected"`
}

func (p *MotionParams) Sanitize() error {
	if p.DeviceID == "" {
		return errors.New("deviceId is required")
	}
	return nil
}

type AlertResponse struct {
	Alert      bool
	Message    string
	Value      float64
	Threshold  float64
	DeviceID   string
	RecordedAt time.Time
}

type SensorManager interface {
	RecordDistance(params *DistanceParams) (*AlertResponse, error)
	GetDistanceHistory(deviceID string, limit int) ([]*DistanceData, error)

	RecordMicrophone(params *MicrophoneParams) (*AlertResponse, error)
	GetMicrophoneHistory(deviceID string, limit int) ([]*MicrophoneData, error)

	RecordMotion(params *MotionParams) (*AlertResponse, error)
	GetMotionHistory(deviceID string, limit int) ([]*MotionData, error)
}
