const API_BASE_URL = 'https://api.loiccapdeville.fr/api/sensormanager';

export interface SensorReading {
  deviceId: string;
  value: number | boolean;
  recordedAt: string;
}

export interface AlertResponse {
  alert: boolean;
  message?: string;
  value: number;
  threshold?: number;
  deviceId: string;
  recordedAt: string;
}

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

export interface Alert {
  id: number;
  deviceId: string;
  alertStatus: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface MicrophoneAlert extends Alert {
  decibels: number;
  thresholdExceeded: number;
  dataId?: number;
}

export interface DistanceAlert extends Alert {
  distanceCm: number;
  thresholdType: string;
  thresholdValue: number;
  dataId?: number;
}

export interface MotionAlert extends Alert {
  motionDetected: boolean;
  alertReason: string;
  dataId?: number;
}

export const sensorApi = {
  // ============= RECORD SENSORS =============
  
  recordMicrophone: async (deviceId: string, decibels: number): Promise<AlertResponse> => {
    const response = await fetch(`${API_BASE_URL}/sensor/microphone/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, decibels }),
    });
    if (!response.ok) throw new Error('Failed to record microphone data');
    return response.json();
  },

  recordDistance: async (deviceId: string, distanceCm: number): Promise<AlertResponse> => {
    const response = await fetch(`${API_BASE_URL}/sensor/distance/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, distanceCm }),
    });
    if (!response.ok) throw new Error('Failed to record distance data');
    return response.json();
  },

  recordMotion: async (deviceId: string, motionDetected: boolean): Promise<AlertResponse> => {
    const response = await fetch(`${API_BASE_URL}/sensor/motion/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, motionDetected }),
    });
    if (!response.ok) throw new Error('Failed to record motion data');
    return response.json();
  },

  // ============= GET HISTORY =============

  getMicrophoneHistory: async (deviceId: string, limit: number = 20): Promise<MicrophoneHistory[]> => {
    const response = await fetch(`${API_BASE_URL}/sensor/microphone/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch microphone history');
    return response.json();
  },

  getDistanceHistory: async (deviceId: string, limit: number = 20): Promise<DistanceHistory[]> => {
    const response = await fetch(`${API_BASE_URL}/sensor/distance/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch distance history');
    return response.json();
  },

  getMotionHistory: async (deviceId: string, limit: number = 20): Promise<MotionHistory[]> => {
    const response = await fetch(`${API_BASE_URL}/sensor/motion/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch motion history');
    return response.json();
  },

  // ============= ALERTS =============

  getMicrophoneAlerts: async (deviceId: string, status?: string, limit: number = 50): Promise<MicrophoneAlert[]> => {
    const response = await fetch(`${API_BASE_URL}/alerts/microphone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, status, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch microphone alerts');
    return response.json();
  },

  getDistanceAlerts: async (deviceId: string, status?: string, limit: number = 50): Promise<DistanceAlert[]> => {
    const response = await fetch(`${API_BASE_URL}/alerts/distance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, status, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch distance alerts');
    return response.json();
  },

  getMotionAlerts: async (deviceId: string, status?: string, limit: number = 50): Promise<MotionAlert[]> => {
    const response = await fetch(`${API_BASE_URL}/alerts/motion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, status, limit }),
    });
    if (!response.ok) throw new Error('Failed to fetch motion alerts');
    return response.json();
  },

  updateMicrophoneAlertStatus: async (alertId: number, status: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/alerts/microphone/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, status }),
    });
    if (!response.ok) throw new Error('Failed to update microphone alert status');
  },

  updateDistanceAlertStatus: async (alertId: number, status: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/alerts/distance/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, status }),
    });
    if (!response.ok) throw new Error('Failed to update distance alert status');
  },

  updateMotionAlertStatus: async (alertId: number, status: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/alerts/motion/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, status }),
    });
    if (!response.ok) throw new Error('Failed to update motion alert status');
  },
};