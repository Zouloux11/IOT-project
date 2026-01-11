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

export const sensorApi = {
  recordMicrophone: async (deviceId: string, decibels: number): Promise<AlertResponse> => {
    const response = await fetch(`${API_BASE_URL}/sensor/microphone/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, decibels }),
    });
    return response.json();
  },

  recordDistance: async (deviceId: string, distanceCm: number): Promise<AlertResponse> => {
    const response = await fetch(`${API_BASE_URL}/sensor/distance/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, distanceCm }),
    });
    return response.json();
  },

  recordMotion: async (deviceId: string, motionDetected: boolean): Promise<AlertResponse> => {
    const response = await fetch(`${API_BASE_URL}/sensor/motion/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, motionDetected }),
    });
    return response.json();
  },

  // ✅ CHANGÉ : POST avec body JSON au lieu de GET avec URL
  getMicrophoneHistory: async (deviceId: string, limit: number = 20) => {
    const response = await fetch(`${API_BASE_URL}/sensor/microphone/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, limit }),
    });
    return response.json();
  },

  getDistanceHistory: async (deviceId: string, limit: number = 20) => {
    const response = await fetch(`${API_BASE_URL}/sensor/distance/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, limit }),
    });
    return response.json();
  },

  getMotionHistory: async (deviceId: string, limit: number = 20) => {
    const response = await fetch(`${API_BASE_URL}/sensor/motion/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, limit }),
    });
    return response.json();
  },
};