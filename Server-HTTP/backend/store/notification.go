package store

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sensormanager"
	"sensormanager/store/models"
	"time"

	"github.com/loungeup/go-loungeup/pkg/errors"
	"github.com/volatiletech/null/v8"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"github.com/volatiletech/sqlboiler/v4/queries/qm"
)

type notificationsStore struct{ baseStore *Store }

var _ sensormanager.NotificationManager = (*notificationsStore)(nil)

func (ns *notificationsStore) RegisterPushToken(params *sensormanager.PushTokenParams) (*sensormanager.PushToken, error) {
	fmt.Println("📝 RegisterPushToken appelé")
	fmt.Printf("   Token: %s\n", params.Token)
	fmt.Printf("   Platform: %s\n", params.Platform)

	if err := params.Sanitize(); err != nil {
		fmt.Printf("❌ Erreur sanitize: %v\n", err)
		return nil, err
	}

	existingToken, err := models.PushTokens(
		models.PushTokenWhere.Token.EQ(params.Token),
	).One(context.TODO(), ns.baseStore.db)

	if err == nil {
		fmt.Println("♻️  Token existe déjà, réactivation...")
		existingToken.IsActive = null.BoolFrom(true)
		existingToken.UpdatedAt = null.TimeFrom(time.Now())
		_, updateErr := existingToken.Update(context.TODO(), ns.baseStore.db, boil.Infer())
		if updateErr != nil {
			fmt.Printf("❌ Erreur update: %v\n", updateErr)
			return nil, errors.MapSQLError(updateErr)
		}

		fmt.Println("✅ Token réactivé avec succès")
		return &sensormanager.PushToken{
			ID:        existingToken.ID,
			Token:     existingToken.Token,
			Platform:  sensormanager.Platform(existingToken.Platform),
			IsActive:  existingToken.IsActive.Bool,
			CreatedAt: existingToken.CreatedAt.Time,
			UpdatedAt: existingToken.UpdatedAt.Time,
		}, nil
	}

	fmt.Println("➕ Création d'un nouveau token...")
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
		fmt.Printf("❌ Erreur insert: %v\n", err)
		return nil, errors.MapSQLError(err)
	}

	fmt.Println("✅ Token créé avec succès")
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
	fmt.Println("🔍 GetActivePushTokens appelé")

	modelsDB, err := models.PushTokens(
		models.PushTokenWhere.IsActive.EQ(null.BoolFrom(true)),
		qm.OrderBy(fmt.Sprintf("%s DESC", models.PushTokenColumns.CreatedAt)),
	).All(context.TODO(), ns.baseStore.db)
	if err != nil {
		fmt.Printf("❌ Erreur lecture tokens: %v\n", err)
		return nil, errors.MapSQLError(err)
	}

	fmt.Printf("📊 Nombre de tokens actifs trouvés: %d\n", len(modelsDB))

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
		fmt.Printf("   Token %d: %s... (platform: %s)\n", i+1, m.Token[:30], m.Platform)
	}

	return result, nil
}

func (ns *notificationsStore) DeactivatePushToken(token string) error {
	fmt.Printf("🔕 DeactivatePushToken: %s...\n", token[:30])

	_, err := models.PushTokens(
		models.PushTokenWhere.Token.EQ(token),
	).UpdateAll(context.TODO(), ns.baseStore.db, models.M{
		models.PushTokenColumns.IsActive:  null.BoolFrom(false),
		models.PushTokenColumns.UpdatedAt: null.TimeFrom(time.Now()),
	})
	if err != nil {
		fmt.Printf("❌ Erreur deactivate: %v\n", err)
		return errors.MapSQLError(err)
	}

	fmt.Println("✅ Token désactivé")
	return nil
}

func (ns *notificationsStore) SendNotificationToAll(params *sensormanager.NotificationParams) error {
	fmt.Println("┌─────────────────────────────────────────┐")
	fmt.Println("│   🔔 SendNotificationToAll              │")
	fmt.Println("└─────────────────────────────────────────┘")
	fmt.Printf("📋 Title: %s\n", params.Title)
	fmt.Printf("📋 Body: %s\n", params.Body)
	fmt.Printf("📋 Data: %+v\n", params.Data)

	tokens, err := ns.GetActivePushTokens()
	if err != nil {
		fmt.Printf("❌ Erreur récupération tokens: %v\n", err)
		return err
	}

	if len(tokens) == 0 {
		fmt.Println("⚠️  Aucun token actif trouvé!")
		return nil
	}

	fmt.Printf("🚀 Envoi vers %d token(s)...\n", len(tokens))

	for i, token := range tokens {
		fmt.Printf("\n--- Token %d/%d ---\n", i+1, len(tokens))
		go ns.sendExpoNotification(token, params, i+1)
	}

	fmt.Println("\n✅ Toutes les goroutines lancées")
	return nil
}

func (ns *notificationsStore) sendExpoNotification(token *sensormanager.PushToken, params *sensormanager.NotificationParams, index int) {
	fmt.Printf("  🚀 [Goroutine %d] Démarrage\n", index)
	fmt.Printf("  📱 [Goroutine %d] Token: %s...\n", index, token.Token[:30])

	dataJSON, _ := json.Marshal(params.Data)
	payload := map[string]interface{}{
		"to":       token.Token,
		"title":    params.Title,
		"body":     params.Body,
		"data":     params.Data,
		"sound":    "default",
		"priority": "high",
	}

	payloadBytes, _ := json.Marshal(payload)
	fmt.Printf("  📦 [Goroutine %d] Payload: %s\n", index, string(payloadBytes))

	fmt.Printf("  🌐 [Goroutine %d] POST vers Expo API...\n", index)
	resp, err := http.Post(
		"https://exp.host/--/api/v2/push/send",
		"application/json",
		bytes.NewBuffer(payloadBytes),
	)

	log := &sensormanager.NotificationLog{
		PushTokenID: token.ID,
		Title:       params.Title,
		Body:        params.Body,
		Data:        null.JSONFrom(dataJSON),
		Success:     false,
	}

	if err != nil {
		fmt.Printf("  ❌ [Goroutine %d] Erreur HTTP: %v\n", index, err)
		log.ErrorMessage = null.StringFrom(err.Error())
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("  📥 [Goroutine %d] Réponse Expo (status %d): %s\n", index, resp.StatusCode, string(body))

	if resp.StatusCode != 200 {
		fmt.Printf("  ❌ [Goroutine %d] Erreur Expo: %d\n", index, resp.StatusCode)
		log.ErrorMessage = null.StringFrom(string(body))
		return
	}

	log.Success = true
	fmt.Printf("  ✅ [Goroutine %d] Notification envoyée avec succès\n", index)
}