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
		res.Call("history", provider.GetHistory),
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

	// 🔔 Envoyer une notification si alerte déclenchée
	if alertResponse.Alert {
		notifParams := &sensormanager.NotificationParams{
			Title: "⚠️ Alerte Microphone",
			Body:  alertResponse.Message,
			Data: map[string]interface{}{
				"type":     "microphone",
				"deviceId": alertResponse.DeviceID,
				"value":    alertResponse.Value,
			},
		}

		// Envoi asynchrone pour ne pas bloquer la réponse
		go p.server.store.Notifications.SendNotificationToAll(notifParams)
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

func (p *microphoneProvider) GetHistory(request res.CallRequest) {
	var params struct {
		DeviceID string `json:"deviceId"`
		Limit    int    `json:"limit"`
	}
	request.ParseParams(&params)

	if params.Limit == 0 {
		params.Limit = 20
	}

	data, err := p.server.store.Sensors.GetMicrophoneHistory(params.DeviceID, params.Limit)
	if err != nil {
		request.Error(err)
		return
	}

	// Convertir en format de réponse
	result := make([]map[string]interface{}, len(data))
	for i, d := range data {
		result[i] = map[string]interface{}{
			"id":         d.ID,
			"deviceId":   d.DeviceID,
			"decibels":   d.Decibels,
			"recordedAt": d.RecordedAt.Format("2006-01-02T15:04:05Z"),
		}
	}

	request.OK(result)
}
