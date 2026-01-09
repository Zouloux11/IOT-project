package sensormanager

import (
	"fmt"
	"time"

	"github.com/volatiletech/null/v8"
)

type SensorType string

const (
	SensorTypeMicrophone SensorType = "microphone"
	SensorTypeDistance   SensorType = "distance"
	SensorTypeMotion     SensorType = "motion"
)

type ThresholdConfig struct {
	DeviceID      string
	SensorType    SensorType
	MaxValue      *float64
	MinValue      *float64
	CooldownSec   int
	LastTriggered null.Time
}

type AlertResponse struct {
	Alert      bool
	Message    string
	Value      float64
	Threshold  float64
	DeviceID   string
	RecordedAt time.Time
}

func (st SensorType) Validate() error {
	switch st {
	case SensorTypeMicrophone, SensorTypeDistance, SensorTypeMotion:
		return nil
	default:
		return fmt.Errorf("invalid sensor type: %s", st)
	}
}

type SensorManager interface {
	// Microphone
	RecordMicrophone(params *MicrophoneParams) (*AlertResponse, error)
	GetMicrophoneHistory(deviceID string, limit int) ([]*MicrophoneData, error)

	// Distance
	RecordDistance(params *DistanceParams) (*AlertResponse, error)
	GetDistanceHistory(deviceID string, limit int) ([]*DistanceData, error)

	// Motion
	RecordMotion(params *MotionParams) (*AlertResponse, error)
	GetMotionHistory(deviceID string, limit int) ([]*MotionData, error)

	// Thresholds
	SetThreshold(config *ThresholdConfig) error
	GetThreshold(deviceID string, sensorType SensorType) (*ThresholdConfig, error)
}
