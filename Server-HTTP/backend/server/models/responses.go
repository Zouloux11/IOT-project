package models

import "github.com/jirenius/go-res"

type MicrophoneParams struct {
	DeviceID string  `json:"deviceID"`
	Decibels float64 `json:"decibels"`
}

type DistanceParams struct {
	DeviceID   string  `json:"deviceID"`
	DistanceCm float64 `json:"distanceCm"`
}

type MotionParams struct {
	DeviceID       string `json:"deviceID"`
	MotionDetected bool   `json:"motionDetected"`
}

type AlertResponseModel struct {
	Alert      bool    `json:"alert"`
	Message    string  `json:"message,omitempty"`
	Value      float64 `json:"value"`
	Threshold  float64 `json:"threshold,omitempty"`
	DeviceID   string  `json:"deviceID"`
	RecordedAt string  `json:"recordedAt"`
}

type SensorHistoryModel struct {
	DeviceID string                         `json:"deviceID"`
	Data     res.DataValue[[]SensorReading] `json:"data"`
}

type SensorReading struct {
	Value      float64 `json:"value"`
	RecordedAt string  `json:"recordedAt"`
}

type PushTokenParams struct {
	PushToken string `json:"pushToken"`
	Platform  string `json:"platform"`
}

type NotificationParams struct {
	Title string                 `json:"title"`
	Body  string                 `json:"body"`
	Data  map[string]interface{} `json:"data"`
}
