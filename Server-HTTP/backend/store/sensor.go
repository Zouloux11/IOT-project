package store

import (
	"context"
	"fmt"
	"math"
	"sensormanager"
	"sensormanager/store/models"
	"time"

	"github.com/ericlagergren/decimal"

	"github.com/loungeup/go-loungeup/pkg/errors"
	"github.com/volatiletech/null/v8"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"github.com/volatiletech/sqlboiler/v4/queries/qm"
	"github.com/volatiletech/sqlboiler/v4/types"
)

type sensorsStore struct{ baseStore *Store }

var _ sensormanager.SensorManager = (*sensorsStore)(nil)

const (
	MicrophoneThresholdDB        = 80.0
	DistanceVariationThresholdCM = 30.0
	AlertCooldownSeconds         = 30
)

type lastValue struct {
	value         float64
	timestamp     time.Time
	lastTriggered time.Time
}

var (
	lastDistances   = make(map[string]*lastValue)
	lastMotions     = make(map[string]*lastValue)
	lastMicrophones = make(map[string]*lastValue)
)

func (ss *sensorsStore) RecordMicrophone(params *sensormanager.MicrophoneParams) (*sensormanager.AlertResponse, error) {
	if err := params.Sanitize(); err != nil {
		return nil, err
	}

	model := &models.MicrophoneDatum{
		DeviceID:   params.DeviceID,
		Decibels:   types.NewDecimal(new(decimal.Big).SetFloat64(params.Decibels)),
		RecordedAt: null.TimeFrom(time.Now()),
	}

	if err := model.Insert(context.TODO(), ss.baseStore.db, boil.Infer()); err != nil {
		return nil, errors.MapSQLError(err)
	}

	return ss.checkMicrophoneAlert(params.DeviceID, params.Decibels)
}

func (ss *sensorsStore) GetMicrophoneHistory(deviceID string, limit int) ([]*sensormanager.MicrophoneData, error) {
	modelsDB, err := models.MicrophoneData(
		models.MicrophoneDatumWhere.DeviceID.EQ(deviceID),
		qm.OrderBy(fmt.Sprintf("%s DESC", models.MicrophoneDatumColumns.RecordedAt)),
		qm.Limit(limit),
	).All(context.TODO(), ss.baseStore.db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	result := make([]*sensormanager.MicrophoneData, len(modelsDB))
	for i, m := range modelsDB {
		decibels, _ := m.Decibels.Float64()
		result[i] = &sensormanager.MicrophoneData{
			ID:         m.ID,
			DeviceID:   m.DeviceID,
			Decibels:   decibels,
			RecordedAt: m.RecordedAt.Time,
		}
	}

	return result, nil
}

func (ss *sensorsStore) RecordDistance(params *sensormanager.DistanceParams) (*sensormanager.AlertResponse, error) {
	if err := params.Sanitize(); err != nil {
		return nil, err
	}

	model := &models.DistanceDatum{
		DeviceID:   params.DeviceID,
		DistanceCM: types.NewDecimal(new(decimal.Big).SetFloat64(params.DistanceCm)),
		RecordedAt: null.TimeFrom(time.Now()),
	}

	if err := model.Insert(context.TODO(), ss.baseStore.db, boil.Infer()); err != nil {
		return nil, errors.MapSQLError(err)
	}

	return ss.checkDistanceAlert(params.DeviceID, params.DistanceCm)
}

func (ss *sensorsStore) GetDistanceHistory(deviceID string, limit int) ([]*sensormanager.DistanceData, error) {
	modelsDB, err := models.DistanceData(
		models.DistanceDatumWhere.DeviceID.EQ(deviceID),
		qm.OrderBy(fmt.Sprintf("%s DESC", models.DistanceDatumColumns.RecordedAt)),
		qm.Limit(limit),
	).All(context.TODO(), ss.baseStore.db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	result := make([]*sensormanager.DistanceData, len(modelsDB))
	for i, m := range modelsDB {
		distanceCm, _ := m.DistanceCM.Float64()
		result[i] = &sensormanager.DistanceData{
			ID:         m.ID,
			DeviceID:   m.DeviceID,
			DistanceCm: distanceCm,
			RecordedAt: m.RecordedAt.Time,
		}
	}

	return result, nil
}

func (ss *sensorsStore) RecordMotion(params *sensormanager.MotionParams) (*sensormanager.AlertResponse, error) {
	if err := params.Sanitize(); err != nil {
		return nil, err
	}

	model := &models.MotionDatum{
		DeviceID:       params.DeviceID,
		MotionDetected: params.MotionDetected,
		RecordedAt:     null.TimeFrom(time.Now()),
	}

	if err := model.Insert(context.TODO(), ss.baseStore.db, boil.Infer()); err != nil {
		return nil, errors.MapSQLError(err)
	}

	return ss.checkMotionAlert(params.DeviceID, params.MotionDetected)
}

func (ss *sensorsStore) GetMotionHistory(deviceID string, limit int) ([]*sensormanager.MotionData, error) {
	modelsDB, err := models.MotionData(
		models.MotionDatumWhere.DeviceID.EQ(deviceID),
		qm.OrderBy(fmt.Sprintf("%s DESC", models.MotionDatumColumns.RecordedAt)),
		qm.Limit(limit),
	).All(context.TODO(), ss.baseStore.db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	result := make([]*sensormanager.MotionData, len(modelsDB))
	for i, m := range modelsDB {
		result[i] = &sensormanager.MotionData{
			ID:             m.ID,
			DeviceID:       m.DeviceID,
			MotionDetected: m.MotionDetected,
			RecordedAt:     m.RecordedAt.Time,
		}
	}

	return result, nil
}

func (ss *sensorsStore) checkMicrophoneAlert(deviceID string, decibels float64) (*sensormanager.AlertResponse, error) {
	now := time.Now()

	last, exists := lastMicrophones[deviceID]
	if exists && now.Sub(last.lastTriggered).Seconds() < AlertCooldownSeconds {
		return &sensormanager.AlertResponse{
			Alert:      false,
			Message:    "Cooldown active",
			DeviceID:   deviceID,
			Value:      decibels,
			RecordedAt: now,
		}, nil
	}

	if decibels >= MicrophoneThresholdDB {
		if !exists {
			lastMicrophones[deviceID] = &lastValue{}
		}
		lastMicrophones[deviceID].lastTriggered = now

		return &sensormanager.AlertResponse{
			Alert:      true,
			Message:    fmt.Sprintf("High noise level detected: %.1f dB", decibels),
			Value:      decibels,
			Threshold:  MicrophoneThresholdDB,
			DeviceID:   deviceID,
			RecordedAt: now,
		}, nil
	}

	return &sensormanager.AlertResponse{
		Alert:      false,
		DeviceID:   deviceID,
		Value:      decibels,
		RecordedAt: now,
	}, nil
}

func (ss *sensorsStore) checkDistanceAlert(deviceID string, distance float64) (*sensormanager.AlertResponse, error) {
	now := time.Now()

	last, exists := lastDistances[deviceID]
	if !exists {
		lastDistances[deviceID] = &lastValue{
			value:     distance,
			timestamp: now,
		}
		return &sensormanager.AlertResponse{
			Alert:      false,
			DeviceID:   deviceID,
			Value:      distance,
			RecordedAt: now,
		}, nil
	}

	if now.Sub(last.lastTriggered).Seconds() < AlertCooldownSeconds {
		last.value = distance
		last.timestamp = now
		return &sensormanager.AlertResponse{
			Alert:      false,
			Message:    "Cooldown active",
			DeviceID:   deviceID,
			Value:      distance,
			RecordedAt: now,
		}, nil
	}

	variation := math.Abs(distance - last.value)

	if variation >= DistanceVariationThresholdCM {
		last.lastTriggered = now
		last.value = distance
		last.timestamp = now

		return &sensormanager.AlertResponse{
			Alert:      true,
			Message:    fmt.Sprintf("Large distance change detected: %.1f cm variation", variation),
			Value:      distance,
			Threshold:  last.value,
			DeviceID:   deviceID,
			RecordedAt: now,
		}, nil
	}

	last.value = distance
	last.timestamp = now

	return &sensormanager.AlertResponse{
		Alert:      false,
		DeviceID:   deviceID,
		Value:      distance,
		RecordedAt: now,
	}, nil
}

func (ss *sensorsStore) checkMotionAlert(deviceID string, motionDetected bool) (*sensormanager.AlertResponse, error) {
	now := time.Now()

	if !motionDetected {
		return &sensormanager.AlertResponse{
			Alert:      false,
			DeviceID:   deviceID,
			Value:      0,
			RecordedAt: now,
		}, nil
	}

	last, exists := lastMotions[deviceID]
	if exists && now.Sub(last.lastTriggered).Seconds() < AlertCooldownSeconds {
		return &sensormanager.AlertResponse{
			Alert:      false,
			Message:    "Cooldown active",
			DeviceID:   deviceID,
			Value:      1,
			RecordedAt: now,
		}, nil
	}

	if !exists {
		lastMotions[deviceID] = &lastValue{}
	}
	lastMotions[deviceID].lastTriggered = now

	return &sensormanager.AlertResponse{
		Alert:      true,
		Message:    "Motion detected",
		Value:      1,
		DeviceID:   deviceID,
		RecordedAt: now,
	}, nil
}
