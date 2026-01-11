import React, { createContext, useContext, useState, useEffect } from 'react';
import { sensorApi, AlertResponse } from '../services/sensorApi';
import { schedulePushNotification } from '../services/notifications';

interface SensorData {
  microphone: { value: number; recordedAt: string }[];
  distance: { value: number; recordedAt: string }[];
  motion: { value: boolean; recordedAt: string }[];
}

interface SensorContextType {
  sensorData: SensorData;
  alerts: AlertResponse[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sensorData, setSensorData] = useState<SensorData>({
    microphone: [],
    distance: [],
    motion: [],
  });
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [micData, distData, motionData] = await Promise.all([
        sensorApi.getMicrophoneHistory('ESP_001', 20),
        sensorApi.getDistanceHistory('ESP_002', 20),
        sensorApi.getMotionHistory('ESP_004', 20),
      ]);

      // 🔥 CORRECTION : Mapper les données de l'API vers le format attendu
setSensorData({
  microphone: (Array.isArray(micData) ? micData : micData.data || []).map((d: any) => ({
    value: d.decibelDb,
    recordedAt: d.recordedAt,
  })),
  distance: (Array.isArray(distData) ? distData : distData.data || []).map((d: any) => ({
    value: d.distanceCm,
    recordedAt: d.recordedAt,
  })),
  motion: (Array.isArray(motionData) ? motionData : motionData.data || []).map((d: any) => ({
    value: d.motionDetected,
    recordedAt: d.recordedAt,
  })),
});
      // Générer des alertes locales si nécessaire
      checkForAlerts(
        (micData.data || []).map((d: any) => ({ value: d.decibelDb, recordedAt: d.recordedAt })),
        (distData.data || []).map((d: any) => ({ value: d.distanceCm, recordedAt: d.recordedAt })),
        (motionData.data || []).map((d: any) => ({ value: d.motionDetected, recordedAt: d.recordedAt }))
      );
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForAlerts = (
    mic: { value: number; recordedAt: string }[],
    dist: { value: number; recordedAt: string }[],
    motion: { value: boolean; recordedAt: string }[]
  ) => {
    const latestMic = mic[0];
    const latestDist = dist[0];
    const latestMotion = motion[0];

    // Alerte microphone
    if (latestMic && latestMic.value > 80) {
      schedulePushNotification(
        '🔊 Alerte Sonore',
        `Niveau sonore élevé: ${latestMic.value.toFixed(1)} dB`,
        { type: 'microphone', deviceId: 'ESP_001' }
      );
    }

    // Alerte distance
    if (latestDist && latestDist.value < 30) {
      schedulePushNotification(
        '⚠️ Obstacle Proche',
        `Distance: ${latestDist.value.toFixed(1)} cm`,
        { type: 'distance', deviceId: 'ESP_002' }
      );
    }

    // Alerte mouvement
    if (latestMotion && latestMotion.value) {
      schedulePushNotification(
        '🚶 Mouvement Détecté',
        'Activité détectée par le capteur',
        { type: 'motion', deviceId: 'ESP_004' }
      );
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SensorContext.Provider value={{ sensorData, alerts, loading, refreshData }}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensors = () => {
  const context = useContext(SensorContext);
  if (!context) throw new Error('useSensors must be used within SensorProvider');
  return context;
};