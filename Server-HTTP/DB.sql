CREATE TABLE microphone_data (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    decibels DECIMAL(10, 2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE distance_data (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    distance_cm DECIMAL(10, 2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE motion_data (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    motion_detected BOOLEAN NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_microphone_time ON microphone_data(recorded_at DESC);
CREATE INDEX idx_distance_time ON distance_data(recorded_at DESC);
CREATE INDEX idx_motion_time ON motion_data(recorded_at DESC);

CREATE TABLE push_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL,
    device_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_push_tokens_platform ON push_tokens(platform);

-- Alertes pour les données de microphone (décibels)
CREATE TABLE microphone_alerts (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    data_id BIGINT REFERENCES microphone_data(id) ON DELETE SET NULL,
    decibels DECIMAL(10, 2) NOT NULL,
    threshold_exceeded DECIMAL(10, 2) NOT NULL,
    alert_status VARCHAR(20) DEFAULT 'active' CHECK (alert_status IN ('active', 'acknowledged', 'resolved')),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alertes pour les données de distance
CREATE TABLE distance_alerts (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    data_id BIGINT REFERENCES distance_data(id) ON DELETE SET NULL,
    distance_cm DECIMAL(10, 2) NOT NULL,
    threshold_type VARCHAR(20) NOT NULL CHECK (threshold_type IN ('too_close', 'too_far')),
    threshold_value DECIMAL(10, 2) NOT NULL,
    alert_status VARCHAR(20) DEFAULT 'active' CHECK (alert_status IN ('active', 'acknowledged', 'resolved')),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alertes pour les données de mouvement
CREATE TABLE motion_alerts (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    data_id BIGINT REFERENCES motion_data(id) ON DELETE SET NULL,
    motion_detected BOOLEAN NOT NULL,
    alert_reason VARCHAR(100), -- ex: 'unexpected_motion', 'continuous_motion'
    alert_status VARCHAR(20) DEFAULT 'active' CHECK (alert_status IN ('active', 'acknowledged', 'resolved')),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_microphone_alerts_device ON microphone_alerts(device_id);
CREATE INDEX idx_microphone_alerts_status ON microphone_alerts(alert_status);
CREATE INDEX idx_microphone_alerts_time ON microphone_alerts(created_at DESC);

CREATE INDEX idx_distance_alerts_device ON distance_alerts(device_id);
CREATE INDEX idx_distance_alerts_status ON distance_alerts(alert_status);
CREATE INDEX idx_distance_alerts_time ON distance_alerts(created_at DESC);

CREATE INDEX idx_motion_alerts_device ON motion_alerts(device_id);
CREATE INDEX idx_motion_alerts_status ON motion_alerts(alert_status);
CREATE INDEX idx_motion_alerts_time ON motion_alerts(created_at DESC);