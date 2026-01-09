FROM golang:1.23.1
WORKDIR /app

COPY . .

COPY .env /app/.env

RUN go mod download

RUN go build -o /app/sensormanager cmd/server/main.go

CMD ["/app/sensormanager"]

