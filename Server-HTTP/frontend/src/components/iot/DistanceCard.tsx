import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { SensorChart } from './SensorChart';
import { MetricCard } from './MetricCard';
import type { DistanceHistory } from '../../lib/sensorAPI';

interface DistanceCardProps {
  deviceId: string;
  data: DistanceHistory[];
}

export const DistanceCard: React.FC<DistanceCardProps> = React.memo(({ 
  deviceId, 
  data
}) => {
  const latestValue = data[0]?.distanceCm || 0;

  // ✅ Utiliser l'index au lieu du timestamp pour éviter le recalcul
  const chartData = useMemo(() => {
    const reversed = [...data].reverse();
    return reversed.map((d, index) => ({
      time: `${index}`, // Juste l'index
      value: d.distanceCm
    }));
  }, [data.length, data[0]?.id]); // Ne recalcule que si la longueur ou le premier ID change

  const stats = useMemo(() => {
    if (data.length === 0) return { avg: 0, max: 0, min: 0, variance: 0 };
    
    const values = data.map(d => d.distanceCm);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const variance = data.length > 1 
      ? Math.abs(data[0].distanceCm - data[data.length - 1].distanceCm)
      : 0;
    
    return { avg, max, min, variance };
  }, [data]);

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
          <MetricCard label="Average" value={stats.avg.toFixed(1)} unit="cm" />
          <MetricCard label="Max" value={stats.max.toFixed(1)} unit="cm" />
          <MetricCard label="Min" value={stats.min.toFixed(1)} unit="cm" />
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
            <span className="ml-2 font-semibold">{stats.variance.toFixed(1)} cm</span>
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
}, (prev, next) => {
  // ✅ Ne re-render que si les données changent vraiment
  return prev.data.length === next.data.length && 
         prev.data[0]?.id === next.data[0]?.id;
});

DistanceCard.displayName = 'DistanceCard';