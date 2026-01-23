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
	MicrophoneThresholdDB        = 60.0
	DistanceVariationThresholdCM = 30.0
	AlertCooldownSeconds         = 10
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

// ============= MICROPHONE =============

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

	return ss.checkMicrophoneAlert(params.DeviceID, params.Decibels, model.ID)
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

func (ss *sensorsStore) checkMicrophoneAlert(deviceID string, decibels float64, dataID int64) (*sensormanager.AlertResponse, error) {
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

		// 💾 Enregistrer l'alerte dans la DB
		alert := &models.MicrophoneAlert{
			DeviceID:          deviceID,
			DataID:            null.Int64From(dataID),
			Decibels:          types.NewDecimal(new(decimal.Big).SetFloat64(decibels)),
			ThresholdExceeded: types.NewDecimal(new(decimal.Big).SetFloat64(MicrophoneThresholdDB)),
			AlertStatus:       null.StringFrom(string(sensormanager.AlertStatusActive)),
		}

		if err := alert.Insert(context.TODO(), ss.baseStore.db, boil.Infer()); err != nil {
			return nil, errors.MapSQLError(err)
		}

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

// ============= DISTANCE =============

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

	return ss.checkDistanceAlert(params.DeviceID, params.DistanceCm, model.ID)
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

func (ss *sensorsStore) checkDistanceAlert(deviceID string, distance float64, dataID int64) (*sensormanager.AlertResponse, error) {
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
		oldValue := last.value
		last.value = distance
		last.timestamp = now

		// 💾 Enregistrer l'alerte dans la DB
		thresholdType := "too_close"
		if distance > oldValue {
			thresholdType = "too_far"
		}

		alert := &models.DistanceAlert{
			DeviceID:       deviceID,
			DataID:         null.Int64From(dataID),
			DistanceCM:     types.NewDecimal(new(decimal.Big).SetFloat64(distance)),
			ThresholdType:  thresholdType,
			ThresholdValue: types.NewDecimal(new(decimal.Big).SetFloat64(oldValue)),
			AlertStatus:    null.StringFrom(string(sensormanager.AlertStatusActive)),
		}

		if err := alert.Insert(context.TODO(), ss.baseStore.db, boil.Infer()); err != nil {
			return nil, errors.MapSQLError(err)
		}

		return &sensormanager.AlertResponse{
			Alert:      true,
			Message:    fmt.Sprintf("Large distance change detected: %.1f cm variation", variation),
			Value:      distance,
			Threshold:  oldValue,
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

// ============= MOTION =============

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

	return ss.checkMotionAlert(params.DeviceID, params.MotionDetected, model.ID)
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

func (ss *sensorsStore) checkMotionAlert(deviceID string, motionDetected bool, dataID int64) (*sensormanager.AlertResponse, error) {
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

	// 💾 Enregistrer l'alerte dans la DB
	alert := &models.MotionAlert{
		DeviceID:       deviceID,
		DataID:         null.Int64From(dataID),
		MotionDetected: motionDetected,
		AlertReason:    null.StringFrom("unexpected_motion"),
		AlertStatus:    null.StringFrom(string(sensormanager.AlertStatusActive)),
	}

	if err := alert.Insert(context.TODO(), ss.baseStore.db, boil.Infer()); err != nil {
		return nil, errors.MapSQLError(err)
	}

	return &sensormanager.AlertResponse{
		Alert:      true,
		Message:    "Motion detected",
		Value:      1,
		DeviceID:   deviceID,
		RecordedAt: now,
	}, nil
}

// ============= MICROPHONE ALERTS =============

func (ss *sensorsStore) GetMicrophoneAlerts(params *sensormanager.GetAlertsParams) ([]*sensormanager.MicrophoneAlert, error) {
	queryMods := []qm.QueryMod{
		models.MicrophoneAlertWhere.DeviceID.EQ(params.DeviceID),
		qm.OrderBy(fmt.Sprintf("%s DESC", models.MicrophoneAlertColumns.CreatedAt)),
	}

	if params.Status != "" {
		queryMods = append(queryMods, models.MicrophoneAlertWhere.AlertStatus.EQ(null.StringFrom(string(params.Status))))
	}

	if params.Limit > 0 {
		queryMods = append(queryMods, qm.Limit(params.Limit))
	}

	modelsDB, err := models.MicrophoneAlerts(queryMods...).All(context.TODO(), ss.baseStore.db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	result := make([]*sensormanager.MicrophoneAlert, len(modelsDB))
	for i, m := range modelsDB {
		decibels, _ := m.Decibels.Float64()
		threshold, _ := m.ThresholdExceeded.Float64()

		var dataID *int64
		if m.DataID.Valid {
			dataID = &m.DataID.Int64
		}

		var ackAt, resAt *time.Time
		if m.AcknowledgedAt.Valid {
			ackAt = &m.AcknowledgedAt.Time
		}
		if m.ResolvedAt.Valid {
			resAt = &m.ResolvedAt.Time
		}

		result[i] = &sensormanager.MicrophoneAlert{
			ID:                m.ID,
			DeviceID:          m.DeviceID,
			DataID:            dataID,
			Decibels:          decibels,
			ThresholdExceeded: threshold,
			AlertStatus:       sensormanager.AlertStatus(m.AlertStatus.String),
			AcknowledgedAt:    ackAt,
			ResolvedAt:        resAt,
			CreatedAt:         m.CreatedAt.Time,
		}
	}

	return result, nil
}

func (ss *sensorsStore) UpdateMicrophoneAlertStatus(params *sensormanager.UpdateAlertStatusParams) error {
	alert, err := models.FindMicrophoneAlert(context.TODO(), ss.baseStore.db, params.AlertID)
	if err != nil {
		return errors.MapSQLError(err)
	}

	alert.AlertStatus = null.StringFrom(string(params.Status))

	now := time.Now()
	switch params.Status {
	case sensormanager.AlertStatusAcknowledged:
		alert.AcknowledgedAt = null.TimeFrom(now)
	case sensormanager.AlertStatusResolved:
		alert.ResolvedAt = null.TimeFrom(now)
	}

	_, err = alert.Update(context.TODO(), ss.baseStore.db, boil.Infer())
	return errors.MapSQLError(err)
}

// ============= DISTANCE ALERTS =============

func (ss *sensorsStore) GetDistanceAlerts(params *sensormanager.GetAlertsParams) ([]*sensormanager.DistanceAlert, error) {
	queryMods := []qm.QueryMod{
		models.DistanceAlertWhere.DeviceID.EQ(params.DeviceID),
		qm.OrderBy(fmt.Sprintf("%s DESC", models.DistanceAlertColumns.CreatedAt)),
	}

	if params.Status != "" {
		queryMods = append(queryMods, models.DistanceAlertWhere.AlertStatus.EQ(null.StringFrom(string(params.Status))))
	}

	if params.Limit > 0 {
		queryMods = append(queryMods, qm.Limit(params.Limit))
	}

	modelsDB, err := models.DistanceAlerts(queryMods...).All(context.TODO(), ss.baseStore.db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	result := make([]*sensormanager.DistanceAlert, len(modelsDB))
	for i, m := range modelsDB {
		distance, _ := m.DistanceCM.Float64()
		threshold, _ := m.ThresholdValue.Float64()

		var dataID *int64
		if m.DataID.Valid {
			dataID = &m.DataID.Int64
		}

		var ackAt, resAt *time.Time
		if m.AcknowledgedAt.Valid {
			ackAt = &m.AcknowledgedAt.Time
		}
		if m.ResolvedAt.Valid {
			resAt = &m.ResolvedAt.Time
		}

		result[i] = &sensormanager.DistanceAlert{
			ID:             m.ID,
			DeviceID:       m.DeviceID,
			DataID:         dataID,
			DistanceCm:     distance,
			ThresholdType:  m.ThresholdType,
			ThresholdValue: threshold,
			AlertStatus:    sensormanager.AlertStatus(m.AlertStatus.String),
			AcknowledgedAt: ackAt,
			ResolvedAt:     resAt,
			CreatedAt:      m.CreatedAt.Time,
		}
	}

	return result, nil
}

func (ss *sensorsStore) UpdateDistanceAlertStatus(params *sensormanager.UpdateAlertStatusParams) error {
	alert, err := models.FindDistanceAlert(context.TODO(), ss.baseStore.db, params.AlertID)
	if err != nil {
		return errors.MapSQLError(err)
	}

	alert.AlertStatus = null.StringFrom(string(params.Status))

	now := time.Now()
	switch params.Status {
	case sensormanager.AlertStatusAcknowledged:
		alert.AcknowledgedAt = null.TimeFrom(now)
	case sensormanager.AlertStatusResolved:
		alert.ResolvedAt = null.TimeFrom(now)
	}

	_, err = alert.Update(context.TODO(), ss.baseStore.db, boil.Infer())
	return errors.MapSQLError(err)
}

// ============= MOTION ALERTS =============

func (ss *sensorsStore) GetMotionAlerts(params *sensormanager.GetAlertsParams) ([]*sensormanager.MotionAlert, error) {
	queryMods := []qm.QueryMod{
		models.MotionAlertWhere.DeviceID.EQ(params.DeviceID),
		qm.OrderBy(fmt.Sprintf("%s DESC", models.MotionAlertColumns.CreatedAt)),
	}

	if params.Status != "" {
		queryMods = append(queryMods, models.MotionAlertWhere.AlertStatus.EQ(null.StringFrom(string(params.Status))))
	}

	if params.Limit > 0 {
		queryMods = append(queryMods, qm.Limit(params.Limit))
	}

	modelsDB, err := models.MotionAlerts(queryMods...).All(context.TODO(), ss.baseStore.db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	result := make([]*sensormanager.MotionAlert, len(modelsDB))
	for i, m := range modelsDB {
		var dataID *int64
		if m.DataID.Valid {
			dataID = &m.DataID.Int64
		}

		var ackAt, resAt *time.Time
		if m.AcknowledgedAt.Valid {
			ackAt = &m.AcknowledgedAt.Time
		}
		if m.ResolvedAt.Valid {
			resAt = &m.ResolvedAt.Time
		}

		result[i] = &sensormanager.MotionAlert{
			ID:             m.ID,
			DeviceID:       m.DeviceID,
			DataID:         dataID,
			MotionDetected: m.MotionDetected,
			AlertReason:    m.AlertReason.String,
			AlertStatus:    sensormanager.AlertStatus(m.AlertStatus.String),
			AcknowledgedAt: ackAt,
			ResolvedAt:     resAt,
			CreatedAt:      m.CreatedAt.Time,
		}
	}

	return result, nil
}

func (ss *sensorsStore) UpdateMotionAlertStatus(params *sensormanager.UpdateAlertStatusParams) error {
	alert, err := models.FindMotionAlert(context.TODO(), ss.baseStore.db, params.AlertID)
	if err != nil {
		return errors.MapSQLError(err)
	}

	alert.AlertStatus = null.StringFrom(string(params.Status))

	now := time.Now()
	switch params.Status {
	case sensormanager.AlertStatusAcknowledged:
		alert.AcknowledgedAt = null.TimeFrom(now)
	case sensormanager.AlertStatusResolved:
		alert.ResolvedAt = null.TimeFrom(now)
	}

	_, err = alert.Update(context.TODO(), ss.baseStore.db, boil.Infer())
	return errors.MapSQLError(err)
}
