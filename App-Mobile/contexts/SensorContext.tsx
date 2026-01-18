import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  sensorApi, 
  MicrophoneHistory, 
  DistanceHistory, 
  MotionHistory,
  MicrophoneAlert,
  DistanceAlert,
  MotionAlert
} from '../services/sensorApi';

interface SensorData {
  microphone: MicrophoneHistory[];
  distance: DistanceHistory[];
  motion: MotionHistory[];
}

interface Alert {
  id: number;
  type: 'microphone' | 'distance' | 'motion';
  severity: 'low' | 'medium' | 'high';
  message: string;
  value: number | boolean;
  timestamp: string;
  deviceId: string;
  acknowledged: boolean;
  status: string;
}

interface SensorContextType {
  sensorData: SensorData;
  alerts: Alert[];
  loading: boolean;
  refreshData: () => Promise<void>;
  acknowledgeAlert: (id: number, type: 'microphone' | 'distance' | 'motion') => Promise<void>;
  resolveAlert: (id: number, type: 'microphone' | 'distance' | 'motion') => Promise<void>;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sensorData, setSensorData] = useState<SensorData>({
    microphone: [],
    distance: [],
    motion: [],
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Récupérer l'historique des capteurs
      const [micData, distData, motionData] = await Promise.all([
        sensorApi.getMicrophoneHistory('ESP_001', 120),
        sensorApi.getDistanceHistory('ESP_002', 120),
        sensorApi.getMotionHistory('ESP_004', 120),
      ]);

      setSensorData({
        microphone: micData,
        distance: distData,
        motion: motionData,
      });

      // Récupérer les alertes de l'API
      await refreshAlerts();
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAlerts = async () => {
    try {
      const [micAlerts, distAlerts, motionAlerts] = await Promise.all([
        sensorApi.getMicrophoneAlerts('ESP_001', '', 50),
        sensorApi.getDistanceAlerts('ESP_002', '', 50),
        sensorApi.getMotionAlerts('ESP_004', '', 50),
      ]);

      const allAlerts: Alert[] = [
        ...micAlerts.map(a => ({
          id: a.id,
          type: 'microphone' as const,
          severity: a.decibels >= 100 ? 'high' : 'medium' as const,
          message: `Niveau sonore élevé: ${a.decibels.toFixed(1)} dB (seuil: ${a.thresholdExceeded} dB)`,
          value: a.decibels,
          timestamp: a.createdAt,
          deviceId: a.deviceId,
          acknowledged: a.alertStatus !== 'active',
          status: a.alertStatus,
        })),
        ...distAlerts.map(a => ({
          id: a.id,
          type: 'distance' as const,
          severity: a.distanceCm < 10 ? 'high' : 'medium' as const,
          message: `Distance ${a.thresholdType}: ${a.distanceCm.toFixed(1)} cm (depuis ${a.thresholdValue.toFixed(1)} cm)`,
          value: a.distanceCm,
          timestamp: a.createdAt,
          deviceId: a.deviceId,
          acknowledged: a.alertStatus !== 'active',
          status: a.alertStatus,
        })),
        ...motionAlerts.map(a => ({
          id: a.id,
          type: 'motion' as const,
          severity: 'high' as const,
          message: a.alertReason || 'Mouvement détecté',
          value: a.motionDetected,
          timestamp: a.createdAt,
          deviceId: a.deviceId,
          acknowledged: a.alertStatus !== 'active',
          status: a.alertStatus,
        })),
      ];

      allAlerts.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setAlerts(allAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const acknowledgeAlert = async (id: number, type: 'microphone' | 'distance' | 'motion') => {
    try {
      if (type === 'microphone') {
        await sensorApi.updateMicrophoneAlertStatus(id, 'acknowledged');
      } else if (type === 'distance') {
        await sensorApi.updateDistanceAlertStatus(id, 'acknowledged');
      } else if (type === 'motion') {
        await sensorApi.updateMotionAlertStatus(id, 'acknowledged');
      }
      await refreshAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const resolveAlert = async (id: number, type: 'microphone' | 'distance' | 'motion') => {
    try {
      if (type === 'microphone') {
        await sensorApi.updateMicrophoneAlertStatus(id, 'resolved');
      } else if (type === 'distance') {
        await sensorApi.updateDistanceAlertStatus(id, 'resolved');
      } else if (type === 'motion') {
        await sensorApi.updateMotionAlertStatus(id, 'resolved');
      }
      await refreshAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SensorContext.Provider value={{ 
      sensorData, 
      alerts, 
      loading, 
      refreshData,
      acknowledgeAlert,
      resolveAlert
    }}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensors = () => {
  const context = useContext(SensorContext);
  if (!context) throw new Error('useSensors must be used within SensorProvider');
  return context;
};