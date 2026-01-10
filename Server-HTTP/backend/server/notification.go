package server

import (
	"sensormanager"
	"sensormanager/server/models"

	"github.com/jirenius/go-res"
)

func (s *Server) addNotificationHandler() {
	provider := &notificationProvider{s}

	s.service.Handle("notifications",
		res.Access(res.AccessGranted),
		res.Call("register", provider.RegisterToken),
		res.Call("send", provider.SendNotification),
	)
}

type notificationProvider struct{ server *Server }

func (p *notificationProvider) RegisterToken(request res.CallRequest) {
	var params models.PushTokenParams
	request.ParseParams(&params)

	tokenParams := &sensormanager.PushTokenParams{
		Token:      params.PushToken,
		Platform:   params.Platform,
		DeviceInfo: map[string]interface{}{},
	}

	token, err := p.server.store.Notifications.RegisterPushToken(tokenParams)
	if err != nil {
		request.Error(err)
		return
	}

	request.OK(map[string]interface{}{
		"success": true,
		"tokenId": token.ID,
	})
}

func (p *notificationProvider) SendNotification(request res.CallRequest) {
	var params models.NotificationParams
	request.ParseParams(&params)

	notifParams := &sensormanager.NotificationParams{
		Title: params.Title,
		Body:  params.Body,
		Data:  params.Data,
	}

	err := p.server.store.Notifications.SendNotificationToAll(notifParams)
	if err != nil {
		request.Error(err)
		return
	}

	request.OK(map[string]interface{}{
		"success": true,
		"message": "Notifications envoyées",
	})
}
