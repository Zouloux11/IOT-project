package store

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sensormanager"
	"sensormanager/store/models"
	"strings"
	"time"

	"github.com/loungeup/go-loungeup/pkg/errors"
	"github.com/volatiletech/null/v8"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"github.com/volatiletech/sqlboiler/v4/queries/qm"
)

type notificationsStore struct{ baseStore *Store }

var _ sensormanager.NotificationManager = (*notificationsStore)(nil)

func (ns *notificationsStore) RegisterPushToken(params *sensormanager.PushTokenParams) (*sensormanager.PushToken, error) {
	if err := params.Sanitize(); err != nil {
		return nil, err
	}

	// Vérifier si le token existe déjà
	existingToken, err := models.PushTokens(
		models.PushTokenWhere.Token.EQ(params.Token),
	).One(context.TODO(), ns.baseStore.db)

	if err == nil {
		// Token existe, le réactiver
		existingToken.IsActive = null.BoolFrom(true)
		existingToken.UpdatedAt = null.TimeFrom(time.Now())
		_, updateErr := existingToken.Update(context.TODO(), ns.baseStore.db, boil.Infer())
		if updateErr != nil {
			return nil, errors.MapSQLError(updateErr)
		}

		return &sensormanager.PushToken{
			ID:        existingToken.ID,
			Token:     existingToken.Token,
			Platform:  sensormanager.Platform(existingToken.Platform),
			IsActive:  existingToken.IsActive.Bool,
			CreatedAt: existingToken.CreatedAt.Time,
			UpdatedAt: existingToken.UpdatedAt.Time,
		}, nil
	}

	// Créer un nouveau token
	deviceInfoJSON, _ := json.Marshal(params.DeviceInfo)
	model := &models.PushToken{
		Token:      params.Token,
		Platform:   params.Platform,
		DeviceInfo: null.JSONFrom(deviceInfoJSON),
		IsActive:   null.BoolFrom(true),
		CreatedAt:  null.TimeFrom(time.Now()),
		UpdatedAt:  null.TimeFrom(time.Now()),
	}

	if err := model.Insert(context.TODO(), ns.baseStore.db, boil.Infer()); err != nil {
		return nil, errors.MapSQLError(err)
	}

	return &sensormanager.PushToken{
		ID:        model.ID,
		Token:     model.Token,
		Platform:  sensormanager.Platform(model.Platform),
		IsActive:  model.IsActive.Bool,
		CreatedAt: model.CreatedAt.Time,
		UpdatedAt: model.UpdatedAt.Time,
	}, nil
}

func (ns *notificationsStore) GetActivePushTokens() ([]*sensormanager.PushToken, error) {
	modelsDB, err := models.PushTokens(
		models.PushTokenWhere.IsActive.EQ(null.BoolFrom(true)),
		qm.OrderBy(fmt.Sprintf("%s DESC", models.PushTokenColumns.CreatedAt)),
	).All(context.TODO(), ns.baseStore.db)
	if err != nil {
		return nil, errors.MapSQLError(err)
	}

	result := make([]*sensormanager.PushToken, len(modelsDB))
	for i, m := range modelsDB {
		result[i] = &sensormanager.PushToken{
			ID:        m.ID,
			Token:     m.Token,
			Platform:  sensormanager.Platform(m.Platform),
			IsActive:  m.IsActive.Bool,
			CreatedAt: m.CreatedAt.Time,
			UpdatedAt: m.UpdatedAt.Time,
		}
	}

	return result, nil
}

func (ns *notificationsStore) DeactivatePushToken(token string) error {
	_, err := models.PushTokens(
		models.PushTokenWhere.Token.EQ(token),
	).UpdateAll(context.TODO(), ns.baseStore.db, models.M{
		models.PushTokenColumns.IsActive:  null.BoolFrom(false),
		models.PushTokenColumns.UpdatedAt: null.TimeFrom(time.Now()),
	})
	if err != nil {
		return errors.MapSQLError(err)
	}

	return nil
}

func (ns *notificationsStore) SendNotificationToAll(params *sensormanager.NotificationParams) error {
	tokens, err := ns.GetActivePushTokens()
	if err != nil {
		return err
	}

	for _, token := range tokens {
		go ns.sendExpoNotification(token, params)
	}

	return nil
}

func (ns *notificationsStore) sendExpoNotification(token *sensormanager.PushToken, params *sensormanager.NotificationParams) {
	dataJSON, _ := json.Marshal(params.Data)
	payload := map[string]interface{}{
		"to":    token.Token,
		"title": params.Title,
		"body":  params.Body,
		"data":  params.Data,
		"sound": "default",
	}

	payloadBytes, _ := json.Marshal(payload)
	resp, err := http.Post(
		"https://exp.host/--/api/v2/push/send",
		"application/json",
		strings.NewReader(string(payloadBytes)),
	)

	log := &sensormanager.NotificationLog{
		PushTokenID: token.ID,
		Title:       params.Title,
		Body:        params.Body,
		Data:        null.JSONFrom(dataJSON),
		Success:     false,
	}

	if err != nil {
		log.ErrorMessage = null.StringFrom(err.Error())
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		log.ErrorMessage = null.StringFrom(string(body))
		return
	}

	log.Success = true
}
