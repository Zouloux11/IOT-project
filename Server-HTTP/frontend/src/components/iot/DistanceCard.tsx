import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { SensorChart } from './SensorChart';
import { MetricCard } from './MetricCard';
import type { DistanceHistory } from '../../lib/sensorAPI';

interface DistanceCardProps {
  deviceId: string;
  data: DistanceHistory[];
}

export const DistanceCard: React.FC<DistanceCardProps> = ({ 
  deviceId, 
  data
}) => {
  const latestValue = data[0]?.distanceCm || 0;

  // ✅ Pas de useMemo, recalcul à chaque render
  const reversed = [...data].reverse();
  const chartData = reversed.map((d, index) => ({
    time: `${index}`,
    value: d.distanceCm
  }));

  // ✅ Stats sans useMemo
  let avg = 0, max = 0, min = 0, variance = 0;
  
  if (data.length > 0) {
    const values = data.map(d => d.distanceCm);
    avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    max = Math.max(...values);
    min = Math.min(...values);
    variance = data.length > 1 
      ? Math.abs(data[0].distanceCm - data[data.length - 1].distanceCm)
      : 0;
  }

  const getVariant = (cm: number) => {
    if (cm < 20) return 'danger';
    if (cm < 50) return 'warning';
    return 'default';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Distance Sensor</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">{deviceId}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <MetricCard 
            label="Current" 
            value={latestValue.toFixed(1)} 
            unit="cm" 
            size="lg"
            variant={getVariant(latestValue)}
          />
          <MetricCard label="Average" value={avg.toFixed(1)} unit="cm" />
          <MetricCard label="Max" value={max.toFixed(1)} unit="cm" />
          <MetricCard label="Min" value={min.toFixed(1)} unit="cm" />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            Last 10 minutes ({data.length} samples)
          </p>
          <SensorChart data={chartData} color="#10b981" unit="cm" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <span className="text-gray-500">Samples:</span>
            <span className="ml-2 font-semibold">{data.length}</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <span className="text-gray-500">Variance:</span>
            <span className="ml-2 font-semibold">{variance.toFixed(1)} cm</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <span className="text-gray-500">Last Update:</span>
            <span className="ml-2 font-semibold">
              {data[0]?.recordedAt ? new Date(data[0].recordedAt).toLocaleTimeString('fr-FR') : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};