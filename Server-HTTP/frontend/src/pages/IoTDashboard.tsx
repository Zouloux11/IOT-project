import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MicrophoneCard } from '../components/iot/MicrophoneCard';
import { DistanceCard } from '../components/iot/DistanceCard';
import { MotionCard } from '../components/iot/MotionCard';
import { AlertsList } from '../components/iot/AlertsList';
import { sensorApi } from '../lib/sensorAPI';
import type { MicrophoneHistory, DistanceHistory, MotionHistory } from '../lib/sensorAPI';

interface SensorData {
  microphone: MicrophoneHistory[];
  distance: DistanceHistory[];
  motion: MotionHistory[];
}

interface Alert {
  id: number;
  type: 'microphone' | 'distance' | 'motion';
  deviceId: string;
  message: string;
  value: number | boolean;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

const MAX_POINTS = 120; // Nombre fixe de points (10 min à 1 point/5s)

const IoTDashboard = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    microphone: [],
    distance: [],
    motion: []
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Stocker le dernier ID récupéré pour chaque capteur
  const lastIds = useRef({
    microphone: 0,
    distance: 0,
    motion: 0
  });

  const fetchInitialData = async () => {
    try {
      const [micData, distData, motionData] = await Promise.all([
        sensorApi.getMicrophoneHistory('ESP_001', MAX_POINTS),
        sensorApi.getDistanceHistory('ESP_002', MAX_POINTS),
        sensorApi.getMotionHistory('ESP_004', MAX_POINTS)
      ]);

      // Garder seulement MAX_POINTS les plus récents
      setSensorData({
        microphone: micData.slice(0, MAX_POINTS),
        distance: distData.slice(0, MAX_POINTS),
        motion: motionData.slice(0, MAX_POINTS)
      });

      // Sauvegarder les derniers IDs
      if (micData.length > 0) lastIds.current.microphone = micData[0].id;
      if (distData.length > 0) lastIds.current.distance = distData[0].id;
      if (motionData.length > 0) lastIds.current.motion = motionData[0].id;

      setError(null);
    } catch (error) {
      console.error('Error fetching sensor history:', error);
      setError('Failed to fetch sensor data');
    }
  };

  const fetchNewData = async () => {
    try {
      // ✅ Récupérer seulement les 5 derniers points (nouveaux)
      const [micData, distData, motionData] = await Promise.all([
        sensorApi.getMicrophoneHistory('ESP_001', 5),
        sensorApi.getDistanceHistory('ESP_002', 5),
        sensorApi.getMotionHistory('ESP_004', 5)
      ]);

      setSensorData(prev => {
        const newState = { ...prev };

        // ✅ Ajouter seulement les nouveaux points (ID > dernier ID)
        const newMic = micData.filter(d => d.id > lastIds.current.microphone);
        if (newMic.length > 0) {
          newState.microphone = [...newMic, ...prev.microphone].slice(0, MAX_POINTS);
          lastIds.current.microphone = newMic[0].id;
        }

        const newDist = distData.filter(d => d.id > lastIds.current.distance);
        if (newDist.length > 0) {
          newState.distance = [...newDist, ...prev.distance].slice(0, MAX_POINTS);
          lastIds.current.distance = newDist[0].id;
        }

        const newMotion = motionData.filter(d => d.id > lastIds.current.motion);
        if (newMotion.length > 0) {
          newState.motion = [...newMotion, ...prev.motion].slice(0, MAX_POINTS);
          lastIds.current.motion = newMotion[0].id;
        }

        return newState;
      });

      setError(null);
    } catch (error) {
      console.error('Error fetching new data:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const [micAlerts, distAlerts, motionAlerts] = await Promise.all([
        sensorApi.getMicrophoneAlerts('ESP_001', '', 50),
        sensorApi.getDistanceAlerts('ESP_002', '', 50),
        sensorApi.getMotionAlerts('ESP_004', '', 50)
      ]);

      const allAlerts: Alert[] = [
        ...micAlerts.map(a => ({
          id: a.id,
          type: 'microphone' as const,
          deviceId: a.deviceId,
          message: `High noise level: ${a.decibels.toFixed(1)} dB (threshold: ${a.thresholdExceeded} dB)`,
          value: a.decibels,
          status: a.alertStatus as 'active' | 'acknowledged' | 'resolved',
          createdAt: a.createdAt,
          acknowledgedAt: a.acknowledgedAt,
          resolvedAt: a.resolvedAt
        })),
        ...distAlerts.map(a => ({
          id: a.id,
          type: 'distance' as const,
          deviceId: a.deviceId,
          message: `Distance ${a.thresholdType}: ${a.distanceCm.toFixed(1)} cm (from ${a.thresholdValue.toFixed(1)} cm)`,
          value: a.distanceCm,
          status: a.alertStatus as 'active' | 'acknowledged' | 'resolved',
          createdAt: a.createdAt,
          acknowledgedAt: a.acknowledgedAt,
          resolvedAt: a.resolvedAt
        })),
        ...motionAlerts.map(a => ({
          id: a.id,
          type: 'motion' as const,
          deviceId: a.deviceId,
          message: a.alertReason || 'Motion detected',
          value: a.motionDetected,
          status: a.alertStatus as 'active' | 'acknowledged' | 'resolved',
          createdAt: a.createdAt,
          acknowledgedAt: a.acknowledgedAt,
          resolvedAt: a.resolvedAt
        }))
      ];

      allAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAlerts(allAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchNewData(), fetchAlerts()]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      if (alert.type === 'microphone') {
        await sensorApi.updateMicrophoneAlertStatus(alertId, 'acknowledged');
      } else if (alert.type === 'distance') {
        await sensorApi.updateDistanceAlertStatus(alertId, 'acknowledged');
      } else if (alert.type === 'motion') {
        await sensorApi.updateMotionAlertStatus(alertId, 'acknowledged');
      }

      await fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolve = async (alertId: number) => {
    try {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      if (alert.type === 'microphone') {
        await sensorApi.updateMicrophoneAlertStatus(alertId, 'resolved');
      } else if (alert.type === 'distance') {
        await sensorApi.updateDistanceAlertStatus(alertId, 'resolved');
      } else if (alert.type === 'motion') {
        await sensorApi.updateMotionAlertStatus(alertId, 'resolved');
      }

      await fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  useEffect(() => {
    // ✅ Chargement initial
    fetchInitialData();
    
    const interval = setInterval(refreshData, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Activity className="h-6 w-6 text-gray-700" />
                <h1 className="text-2xl font-bold text-gray-900">IoT Sensor Dashboard</h1>
              </div>
              <p className="text-sm text-gray-500">
                Real-time monitoring • Last update: {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : 'Never'}
              </p>
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
            
            <Button
              onClick={() => fetchInitialData().then(() => setLastUpdate(new Date()))}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sensors */}
          <div className="lg:col-span-2 space-y-6">
            <MicrophoneCard
              deviceId="ESP_001"
              data={sensorData.microphone}
            />

            <DistanceCard
              deviceId="ESP_002"
              data={sensorData.distance}
            />

            <MotionCard
              deviceId="ESP_004"
              data={sensorData.motion}
            />
          </div>

          {/* Alerts Sidebar */}
          <div className="lg:col-span-1">
            <AlertsList 
              alerts={alerts.filter(a => a.status !== 'resolved')}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTDashboard;