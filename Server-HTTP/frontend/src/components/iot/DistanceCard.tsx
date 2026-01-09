import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Ruler, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SensorChart } from './SensorChart';

interface DistanceData {
  value: number;
  recordedAt: string;
}

interface DistanceCardProps {
  deviceId: string;
  data: DistanceData[];
  latestValue: number;
  alert?: boolean;
  alertMessage?: string;
}

export const DistanceCard: React.FC<DistanceCardProps> = ({ 
  deviceId, 
  data, 
  latestValue,
  alert,
  alertMessage
}) => {
  const getDistanceColor = (cm: number) => {
    if (cm > 100) return 'text-green-500';
    if (cm > 50) return 'text-yellow-500';
    if (cm > 20) return 'text-orange-500';
    return 'text-red-500';
  };

  const getDistanceStatus = (cm: number) => {
    if (cm > 100) return 'Clear';
    if (cm > 50) return 'Approaching';
    if (cm > 20) return 'Close';
    return 'Very Close';
  };

  const chartData = data.map(d => ({
    time: new Date(d.recordedAt).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    value: d.value
  }));

  return (
    <Card className={`border-2 transition-colors ${alert ? 'border-red-500 bg-red-500/5' : 'border-primary/20'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Distance Sensor
            <Badge variant="outline">{deviceId}</Badge>
          </CardTitle>
          {alert && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-red-500"
            >
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-semibold">Alert!</span>
            </motion.div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Distance</p>
            <p className={`text-4xl font-bold ${getDistanceColor(latestValue)}`}>
              {latestValue.toFixed(1)} cm
            </p>
            <p className="text-sm text-muted-foreground">{getDistanceStatus(latestValue)}</p>
          </div>
        </div>

        {alert && alertMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-500 font-semibold">{alertMessage}</p>
          </div>
        )}

        <SensorChart data={chartData} color="#10b981" unit="cm" />
      </CardContent>
    </Card>
  );
};