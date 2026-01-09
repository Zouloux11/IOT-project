// Package environment provides methods to interact with environment variables.
package environment

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/caarlos0/env/v8"
	"github.com/joho/godotenv"
	"github.com/loungeup/go-loungeup/pkg/cache"
	"github.com/loungeup/go-loungeup/pkg/postgres"
	"github.com/nats-io/nats.go"
)

// Variables represents the environment variables used by the application. Please, make sure to update the .env.example
// file when modyfing this structure.
//
//nolint:tagalign
type Variables struct {
	DBHost     string `env:"DB_HOST,required" envDefault:"localhost"`
	DBPort     string `env:"DB_PORT,required" envDefault:"5437"`
	DBName     string `env:"DB_NAME,required" envDefault:"sensormanager"`
	DBUser     string `env:"DB_USER,required" envDefault:"sensormanager"`
	DBPassword string `env:"DB_PASSWORD,required" envDefault:"sensormanager"`

	HealthEnabled bool `env:"FM_HEALTH_ENABLED" envDefault:"true"`

	NATSURL string `env:"FM_NATS_URL,required" envDefault:"nats://nats_iot:4222"`

	LoungeUpClientHTTPTimeout time.Duration `env:"GP_LOUNGEUP_CLIENT_HTTP_TIMEOUT" envDefault:"2s"`
	LoungeUpClientNATSTimeout time.Duration `env:"GP_LOUNGEUP_CLIENT_NATS_TIMEOUT" envDefault:"10s"`

	// https://github.com/jirenius/go-res/blob/372a82d603a13d7601f8b14e74eccaebd325ee61/service.go#L20-L21
	ServiceInChannelSize int `env:"GP_SERVICE_IN_CHANNEL_SIZE" envDefault:"1024"`

	// https://github.com/jirenius/go-res/blob/372a82d603a13d7601f8b14e74eccaebd325ee61/service.go#L23-L24
	ServiceWorkerCount int `env:"GP_SERVICE_WORKER_COUNT" envDefault:"32"`
}

// Parse environment variables.
func Parse() *Variables {
	godotenv.Load() // Used for local development.

	result := &Variables{}
	if err := env.Parse(result); err != nil {
		panic(fmt.Errorf("could not parse environment variables: %w", err))
	}

	return result
}

func MustInitCache() *cache.Ristretto {
	result, err := cache.NewRistretto(cache.VeryLargeRistrettoCache)
	if err != nil {
		panic(fmt.Errorf("could not create Ristretto cache: %w", err))
	}

	return result
}

func MustInitDB(variables *Variables) *sql.DB {
	const dbConnectionsCount = 10

	result, err := postgres.Open(postgres.Configuration{
		Host:     variables.DBHost,
		Port:     variables.DBPort,
		DBName:   variables.DBName,
		User:     variables.DBUser,
		Password: variables.DBPassword,
		SSLMode:  "disable",
	})
	if err != nil {
		panic(fmt.Errorf("could not open database: %w", err))
	}

	result.SetMaxIdleConns(dbConnectionsCount)
	result.SetMaxOpenConns(dbConnectionsCount)

	return result
}

func MustInitNATSConn(variables *Variables) *nats.Conn {
	result, err := nats.Connect(variables.NATSURL)
	if err != nil {
		panic(fmt.Errorf("could not connect to NATS system: %w", err))
	}

	return result
}
