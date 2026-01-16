package server

import (
	"sensormanager"

	"github.com/jirenius/go-res"
)

func (s *Server) addAlertsHandlers() {
	s.addMicrophoneAlertsHandler()
	s.addDistanceAlertsHandler()
	s.addMotionAlertsHandler()
}

// ============= MICROPHONE ALERTS =============

func (s *Server) addMicrophoneAlertsHandler() {
	provider := &microphoneAlertsProvider{s}

	s.service.Handle("alerts.microphone",
		res.Access(res.AccessGranted),
		res.Call("get", provider.GetAlerts),
		res.Call("updateStatus", provider.UpdateStatus),
	)
}

type microphoneAlertsProvider struct{ server *Server }

func (p *microphoneAlertsProvider) GetAlerts(request res.CallRequest) {
	var params struct {
		DeviceID string `json:"deviceId"`
		Status   string `json:"status,omitempty"`
		Limit    int    `json:"limit,omitempty"`
	}
	request.ParseParams(&params)

	if params.Limit == 0 {
		params.Limit = 50
	}

	alertParams := &sensormanager.GetAlertsParams{
		DeviceID: params.DeviceID,
		Status:   sensormanager.AlertStatus(params.Status),
		Limit:    params.Limit,
	}

	alerts, err := p.server.store.Sensors.GetMicrophoneAlerts(alertParams)
	if err != nil {
		request.Error(err)
		return
	}

	result := make([]map[string]interface{}, len(alerts))
	for i, a := range alerts {
		item := map[string]interface{}{
			"id":                a.ID,
			"deviceId":          a.DeviceID,
			"decibels":          a.Decibels,
			"thresholdExceeded": a.ThresholdExceeded,
			"alertStatus":       string(a.AlertStatus),
			"createdAt":         a.CreatedAt.Format("2006-01-02T15:04:05Z"),
		}

		if a.DataID != nil {
			item["dataId"] = *a.DataID
		}
		if a.AcknowledgedAt != nil {
			item["acknowledgedAt"] = a.AcknowledgedAt.Format("2006-01-02T15:04:05Z")
		}
		if a.ResolvedAt != nil {
			item["resolvedAt"] = a.ResolvedAt.Format("2006-01-02T15:04:05Z")
		}

		result[i] = item
	}

	request.OK(result)
}

func (p *microphoneAlertsProvider) UpdateStatus(request res.CallRequest) {
	var params struct {
		AlertID int64  `json:"alertId"`
		Status  string `json:"status"`
	}
	request.ParseParams(&params)

	updateParams := &sensormanager.UpdateAlertStatusParams{
		AlertID: params.AlertID,
		Status:  sensormanager.AlertStatus(params.Status),
	}

	err := p.server.store.Sensors.UpdateMicrophoneAlertStatus(updateParams)
	if err != nil {
		request.Error(err)
		return
	}

	request.OK(map[string]interface{}{
		"success": true,
		"message": "Alert status updated",
	})
}

// ============= DISTANCE ALERTS =============

func (s *Server) addDistanceAlertsHandler() {
	provider := &distanceAlertsProvider{s}

	s.service.Handle("alerts.distance",
		res.Access(res.AccessGranted),
		res.Call("get", provider.GetAlerts),
		res.Call("updateStatus", provider.UpdateStatus),
	)
}

type distanceAlertsProvider struct{ server *Server }

func (p *distanceAlertsProvider) GetAlerts(request res.CallRequest) {
	var params struct {
		DeviceID string `json:"deviceId"`
		Status   string `json:"status,omitempty"`
		Limit    int    `json:"limit,omitempty"`
	}
	request.ParseParams(&params)

	if params.Limit == 0 {
		params.Limit = 50
	}

	alertParams := &sensormanager.GetAlertsParams{
		DeviceID: params.DeviceID,
		Status:   sensormanager.AlertStatus(params.Status),
		Limit:    params.Limit,
	}

	alerts, err := p.server.store.Sensors.GetDistanceAlerts(alertParams)
	if err != nil {
		request.Error(err)
		return
	}

	result := make([]map[string]interface{}, len(alerts))
	for i, a := range alerts {
		item := map[string]interface{}{
			"id":             a.ID,
			"deviceId":       a.DeviceID,
			"distanceCm":     a.DistanceCm,
			"thresholdType":  a.ThresholdType,
			"thresholdValue": a.ThresholdValue,
			"alertStatus":    string(a.AlertStatus),
			"createdAt":      a.CreatedAt.Format("2006-01-02T15:04:05Z"),
		}

		if a.DataID != nil {
			item["dataId"] = *a.DataID
		}
		if a.AcknowledgedAt != nil {
			item["acknowledgedAt"] = a.AcknowledgedAt.Format("2006-01-02T15:04:05Z")
		}
		if a.ResolvedAt != nil {
			item["resolvedAt"] = a.ResolvedAt.Format("2006-01-02T15:04:05Z")
		}

		result[i] = item
	}

	request.OK(result)
}

func (p *distanceAlertsProvider) UpdateStatus(request res.CallRequest) {
	var params struct {
		AlertID int64  `json:"alertId"`
		Status  string `json:"status"`
	}
	request.ParseParams(&params)

	updateParams := &sensormanager.UpdateAlertStatusParams{
		AlertID: params.AlertID,
		Status:  sensormanager.AlertStatus(params.Status),
	}

	err := p.server.store.Sensors.UpdateDistanceAlertStatus(updateParams)
	if err != nil {
		request.Error(err)
		return
	}

	request.OK(map[string]interface{}{
		"success": true,
		"message": "Alert status updated",
	})
}

// ============= MOTION ALERTS =============

func (s *Server) addMotionAlertsHandler() {
	provider := &motionAlertsProvider{s}

	s.service.Handle("alerts.motion",
		res.Access(res.AccessGranted),
		res.Call("get", provider.GetAlerts),
		res.Call("updateStatus", provider.UpdateStatus),
	)
}

type motionAlertsProvider struct{ server *Server }

func (p *motionAlertsProvider) GetAlerts(request res.CallRequest) {
	var params struct {
		DeviceID string `json:"deviceId"`
		Status   string `json:"status,omitempty"`
		Limit    int    `json:"limit,omitempty"`
	}
	request.ParseParams(&params)

	if params.Limit == 0 {
		params.Limit = 50
	}

	alertParams := &sensormanager.GetAlertsParams{
		DeviceID: params.DeviceID,
		Status:   sensormanager.AlertStatus(params.Status),
		Limit:    params.Limit,
	}

	alerts, err := p.server.store.Sensors.GetMotionAlerts(alertParams)
	if err != nil {
		request.Error(err)
		return
	}

	result := make([]map[string]interface{}, len(alerts))
	for i, a := range alerts {
		item := map[string]interface{}{
			"id":             a.ID,
			"deviceId":       a.DeviceID,
			"motionDetected": a.MotionDetected,
			"alertReason":    a.AlertReason,
			"alertStatus":    string(a.AlertStatus),
			"createdAt":      a.CreatedAt.Format("2006-01-02T15:04:05Z"),
		}

		if a.DataID != nil {
			item["dataId"] = *a.DataID
		}
		if a.AcknowledgedAt != nil {
			item["acknowledgedAt"] = a.AcknowledgedAt.Format("2006-01-02T15:04:05Z")
		}
		if a.ResolvedAt != nil {
			item["resolvedAt"] = a.ResolvedAt.Format("2006-01-02T15:04:05Z")
		}

		result[i] = item
	}

	request.OK(result)
}

func (p *motionAlertsProvider) UpdateStatus(request res.CallRequest) {
	var params struct {
		AlertID int64  `json:"alertId"`
		Status  string `json:"status"`
	}
	request.ParseParams(&params)

	updateParams := &sensormanager.UpdateAlertStatusParams{
		AlertID: params.AlertID,
		Status:  sensormanager.AlertStatus(params.Status),
	}

	err := p.server.store.Sensors.UpdateMotionAlertStatus(updateParams)
	if err != nil {
		request.Error(err)
		return
	}

	request.OK(map[string]interface{}{
		"success": true,
		"message": "Alert status updated",
	})
}
