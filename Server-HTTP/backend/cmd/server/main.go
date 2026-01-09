package main

import (
	"fmt"
	_ "net/http/pprof"

	"scoresmanager/environment"
	"scoresmanager/server"
	"scoresmanager/store"

	"github.com/jirenius/go-res"
	"github.com/loungeup/go-loungeup/pkg/log"
	"github.com/remyduthu/checker"
)

func main() {
	fmt.Println("Starting ...")

	variables := environment.Parse()

	db := environment.MustInitDB(variables)
	defer db.Close()

	natsConn := environment.MustInitNATSConn(variables)
	defer natsConn.Close()

	fmt.Println("Connected to NATS")
	service := res.NewService("scoresmanager").
		SetInChannelSize(variables.ServiceInChannelSize).
		SetLogger(log.Default().Adapter).
		SetWorkerCount(variables.ServiceWorkerCount)

	fmt.Println("Connected to res")

	store := store.New(
		store.WithDB(db),
	)

	server.New(
		server.WithService(service),
		server.WithStore(store),
	)

	if variables.HealthEnabled {
		go checker.HTTP(
			func() error {
				if err := db.Ping(); err != nil {
					return fmt.Errorf("failed to ping database: %w", err)
				}

				if !natsConn.IsConnected() {
					return fmt.Errorf("NATS connection is %s", natsConn.Status().String())
				}

				natsConn.IsConnected()

				return nil
			},
			func() error {
				if natsConn.IsClosed() {
					return fmt.Errorf("NATS connection is closed")
				}

				return nil
			},
		)
	}

	if err := service.Serve(natsConn); err != nil {
		panic(fmt.Errorf("could not start server: %w", err))
	}
}
