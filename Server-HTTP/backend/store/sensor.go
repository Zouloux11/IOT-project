package store

import (
	"context"
	"fmt"
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

// Microphone

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

	return ss.checkThreshold(params.DeviceID, sensormanager.SensorTypeMicrophone, params.Decibels)
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

// Distance

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

	return ss.checkThreshold(params.DeviceID, sensormanager.SensorTypeDistance, params.DistanceCm)
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

// Motion

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

	var value float64
	if params.MotionDetected {
		value = 1
	}

	return ss.checkThreshold(params.DeviceID, sensormanager.SensorTypeMotion, value)
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

// Thresholds

var thresholds = make(map[string]*sensormanager.ThresholdConfig)

func (ss *sensorsStore) SetThreshold(config *sensormanager.ThresholdConfig) error {
	key := config.DeviceID + "_" + string(config.SensorType)
	thresholds[key] = config
	return nil
}

func (ss *sensorsStore) GetThreshold(deviceID string, sensorType sensormanager.SensorType) (*sensormanager.ThresholdConfig, error) {
	key := deviceID + "_" + string(sensorType)
	config, ok := thresholds[key]
	if !ok {
		return nil, fmt.Errorf("no threshold configured for device %s and sensor %s", deviceID, sensorType)
	}
	return config, nil
}

func (ss *sensorsStore) checkThreshold(deviceID string, sensorType sensormanager.SensorType, value float64) (*sensormanager.AlertResponse, error) {
	config, err := ss.GetThreshold(deviceID, sensorType)
	if err != nil {
		return &sensormanager.AlertResponse{
			Alert:      false,
			DeviceID:   deviceID,
			Value:      value,
			RecordedAt: time.Now(),
		}, nil
	}

	if config.LastTriggered.Valid {
		cooldownEnd := config.LastTriggered.Time.Add(time.Duration(config.CooldownSec) * time.Second)
		if time.Now().Before(cooldownEnd) {
			return &sensormanager.AlertResponse{
				Alert:      false,
				Message:    "Cooldown active",
				DeviceID:   deviceID,
				Value:      value,
				RecordedAt: time.Now(),
			}, nil
		}
	}

	alert := false
	var message string
	var thresholdValue float64

	if config.MaxValue != nil && value > *config.MaxValue {
		alert = true
		thresholdValue = *config.MaxValue
		message = fmt.Sprintf("Value %.2f exceeds maximum threshold %.2f", value, *config.MaxValue)
		config.LastTriggered = null.TimeFrom(time.Now())
	}

	if config.MinValue != nil && value < *config.MinValue {
		alert = true
		thresholdValue = *config.MinValue
		message = fmt.Sprintf("Value %.2f below minimum threshold %.2f", value, *config.MinValue)
		config.LastTriggered = null.TimeFrom(time.Now())
	}

	return &sensormanager.AlertResponse{
		Alert:      alert,
		Message:    message,
		Value:      value,
		Threshold:  thresholdValue,
		DeviceID:   deviceID,
		RecordedAt: time.Now(),
	}, nil
}
