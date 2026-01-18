const API_BASE_URL = 'https://api.loiccapdeville.fr/api/sensormanager';

export interface MicrophoneHistory {
  id: number;
  deviceId: string;
  decibels: number;
  recordedAt: string;
}

export interface DistanceHistory {
  id: number;
  deviceId: string;
  distanceCm: number;
  recordedAt: string;
}

export interface MotionHistory {
  id: number;
  deviceId: string;
  motionDetected: boolean;
  recordedAt: string;
}

export interface MicrophoneAlert {
  id: number;
  deviceId: string;
  decibels: number;
  thresholdExceeded: number;
  alertStatus: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface DistanceAlert {
  id: number;
  deviceId: string;
  distanceCm: number;
  thresholdType: string;
  thresholdValue: number;
  alertStatus: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface MotionAlert {
  id: number;
  deviceId: string;
  motionDetected: boolean;
  alertReason?: string;
  alertStatus: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

class SensorAPI {
  // ===== MICROPHONE =====
  async getMicrophoneHistory(deviceId: string, limit: number = 100): Promise<MicrophoneHistory[]> {
    const response = await fetch(`${API_BASE_URL}/sensor/microphone/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: deviceId, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch microphone history');
    return response.json();
  }

  async getMicrophoneAlerts(
    deviceId: string,
    status: string = '',
    limit: number = 50
  ): Promise<MicrophoneAlert[]> {
    const response = await fetch(`${API_BASE_URL}/alerts/microphone/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: deviceId, status, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch microphone alerts');
    return response.json();
  }

  async updateMicrophoneAlertStatus(alertId: number, status: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/alerts/microphone/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_id: alertId, status }),
    });
    if (!response.ok) throw new Error('Failed to update microphone alert status');
  }

  // ===== DISTANCE =====
  async getDistanceHistory(deviceId: string, limit: number = 100): Promise<DistanceHistory[]> {
    const response = await fetch(`${API_BASE_URL}/sensor/distance/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: deviceId, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch distance history');
    return response.json();
  }

  async getDistanceAlerts(
    deviceId: string,
    status: string = '',
    limit: number = 50
  ): Promise<DistanceAlert[]> {
    const response = await fetch(`${API_BASE_URL}/alerts/distance/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: deviceId, status, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch distance alerts');
    return response.json();
  }

  async updateDistanceAlertStatus(alertId: number, status: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/alerts/distance/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_id: alertId, status }),
    });
    if (!response.ok) throw new Error('Failed to update distance alert status');
  }

  // ===== MOTION =====
  async getMotionHistory(deviceId: string, limit: number = 100): Promise<MotionHistory[]> {
    const response = await fetch(`${API_BASE_URL}/sensor/motion/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: deviceId, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch motion history');
    return response.json();
  }

  async getMotionAlerts(
    deviceId: string,
    status: string = '',
    limit: number = 50
  ): Promise<MotionAlert[]> {
    const response = await fetch(`${API_BASE_URL}/alerts/motion/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: deviceId, status, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch motion alerts');
    return response.json();
  }

  async updateMotionAlertStatus(alertId: number, status: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/alerts/motion/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_id: alertId, status }),
    });
    if (!response.ok) throw new Error('Failed to update motion alert status');
  }
}

export const sensorApi = new SensorAPI();