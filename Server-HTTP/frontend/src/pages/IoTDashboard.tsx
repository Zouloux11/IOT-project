import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MicrophoneCard } from '../components/iot/MicrophoneCard';
import { DistanceCard } from '../components/iot/DistanceCard';
import { MotionCard } from '../components/iot/MotionCard';
import { recordSensorData } from '../lib/resClient';

interface SensorData {
  microphone: Array<{ value: number; recordedAt: string }>;
  distance: Array<{ value: number; recordedAt: string }>;
  motion: Array<{ value: boolean; recordedAt: string }>;
}

const IoTDashboard = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    microphone: [],
    distance: [],
    motion: []
  });

  const [alerts, setAlerts] = useState({
    microphone: { alert: false, message: '' },
    distance: { alert: false, message: '' },
    motion: { alert: false, message: '' }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate fetching data (replace with real API calls)
  const fetchSensorData = async () => {
    setIsRefreshing(true);
    
    // TODO: Replace with real API calls to your backend
    // Example:
    // const micData = await fetch('http://api.iot.loiccapdeville.fr/sensor/microphone/ESP_001/history?limit=20');
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchSensorData();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchSensorData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Activity className="h-10 w-10 text-primary" />
              IoT Sensor Dashboard
            </h1>
            <p className="text-muted-foreground">Real-time monitoring of your sensors</p>
          </div>
          
          <Button
            onClick={fetchSensorData}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Sensor Cards Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <MicrophoneCard
            deviceId="ESP_001"
            data={sensorData.microphone}
            latestValue={sensorData.microphone[0]?.value || 0}
            alert={alerts.microphone.alert}
            alertMessage={alerts.microphone.message}
          />

          <DistanceCard
            deviceId="ESP_002"
            data={sensorData.distance}
            latestValue={sensorData.distance[0]?.value || 0}
            alert={alerts.distance.alert}
            alertMessage={alerts.distance.message}
          />

          <MotionCard
            deviceId="ESP_004"
            data={sensorData.motion}
            latestValue={sensorData.motion[0]?.value || false}
            alert={alerts.motion.alert}
            alertMessage={alerts.motion.message}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default IoTDashboard;