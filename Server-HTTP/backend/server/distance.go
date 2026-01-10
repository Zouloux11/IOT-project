package server

import (
	"sensormanager"
	"sensormanager/server/models"

	"github.com/jirenius/go-res"
)

func (s *Server) addDistanceHandler() {
	provider := &distanceProvider{s}

	s.service.Handle("sensor.distance",
		res.Access(res.AccessGranted),
		res.Call("record", provider.RecordData),
	)
}

type distanceProvider struct{ server *Server }

func (p *distanceProvider) RecordData(request res.CallRequest) {
	var params models.DistanceParams
	request.ParseParams(&params)

	sensorParams := &sensormanager.DistanceParams{
		DeviceID:   params.DeviceID,
		DistanceCm: params.DistanceCm,
	}

	alertResponse, err := p.server.store.Sensors.RecordDistance(sensorParams)
	if err != nil {
		request.Error(err)
		return
	}

	// 🔔 Envoyer une notification si alerte déclenchée
	if alertResponse.Alert {
		notifParams := &sensormanager.NotificationParams{
			Title: "⚠️ Alerte Distance",
			Body:  alertResponse.Message,
			Data: map[string]interface{}{
				"type":     "distance",
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
