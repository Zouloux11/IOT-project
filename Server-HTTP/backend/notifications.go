package sensormanager

import (
	"errors"
	"strings"
	"time"

	"github.com/volatiletech/null/v8"
)

type Platform string

const (
	PlatformIOS     Platform = "ios"
	PlatformAndroid Platform = "android"
)

type PushToken struct {
	ID         int64
	Token      string
	Platform   Platform
	DeviceInfo null.JSON
	IsActive   bool
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type PushTokenParams struct {
	Token      string
	Platform   string
	DeviceInfo map[string]interface{}
}

type NotificationLog struct {
	ID           int64
	PushTokenID  int64
	Title        string
	Body         string
	Data         null.JSON
	SentAt       time.Time
	Success      bool
	ErrorMessage null.String
}

type NotificationParams struct {
	Title string
	Body  string
	Data  map[string]interface{}
}

func (p Platform) Validate() error {
	switch p {
	case PlatformIOS, PlatformAndroid:
		return nil
	default:
		return errors.New("invalid platform")
	}
}

func (p *PushTokenParams) Sanitize() error {
	p.Token = strings.TrimSpace(p.Token)
	if p.Token == "" {
		return errors.New("token cannot be empty")
	}

	if p.Platform != string(PlatformIOS) && p.Platform != string(PlatformAndroid) {
		return errors.New("invalid platform")
	}

	return nil
}

type NotificationManager interface {
	RegisterPushToken(params *PushTokenParams) (*PushToken, error)
	GetActivePushTokens() ([]*PushToken, error)
	DeactivatePushToken(token string) error
	LogNotification(log *NotificationLog) error
	SendNotificationToAll(params *NotificationParams) error
}
