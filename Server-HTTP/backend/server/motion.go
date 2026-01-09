package server

import (
	"sensormanager"
	"sensormanager/server/models"

	"github.com/jirenius/go-res"
)

func (s *Server) addMotionHandler() {
	provider := &motionProvider{s}

	s.service.Handle("sensor.motion",
		res.Access(res.AccessGranted),
		res.Call("record", provider.RecordData),
	)
}

type motionProvider struct{ server *Server }

func (p *motionProvider) RecordData(request res.CallRequest) {
	var params models.MotionParams
	request.ParseParams(&params)

	sensorParams := &sensormanager.MotionParams{
		DeviceID:       params.DeviceID,
		MotionDetected: params.MotionDetected,
	}

	alertResponse, err := p.server.store.Sensors.RecordMotion(sensorParams)
	if err != nil {
		request.Error(err)
		return
	}

	request.OK(&models.AlertResponseModel{
		Alert:      alertResponse.Alert,
		Message:    alertResponse.Message,
		Value:      alertResponse.Value,
		Threshold:  alertResponse.Threshold,
		DeviceID:   alertResponse.DeviceID,
		RecordedAt: alertResponse.RecordedAt.Format("2006-01-02T15:04:05Z"),
	})
}
