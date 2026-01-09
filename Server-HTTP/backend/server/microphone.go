package server

import (
	"sensormanager"
	"sensormanager/server/models"

	"github.com/jirenius/go-res"
)

func (s *Server) addMicrophoneHandler() {
	provider := &microphoneProvider{s}

	s.service.Handle("sensor.microphone",
		res.Access(res.AccessGranted),
		res.Call("record", provider.RecordData),
	)
}

type microphoneProvider struct{ server *Server }

func (p *microphoneProvider) RecordData(request res.CallRequest) {
	var params models.MicrophoneParams
	request.ParseParams(&params)

	sensorParams := &sensormanager.MicrophoneParams{
		DeviceID: params.DeviceID,
		Decibels: params.Decibels,
	}

	alertResponse, err := p.server.store.Sensors.RecordMicrophone(sensorParams)
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
