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

  const chartData = data.map(d => ({
    time: new Date(d.recordedAt).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }),
    value: d.distanceCm
  })).reverse();

  const avg = data.length > 0 
    ? data.reduce((sum, d) => sum + d.distanceCm, 0) / data.length 
    : 0;
  
  const max = data.length > 0 ? Math.max(...data.map(d => d.distanceCm)) : 0;
  const min = data.length > 0 ? Math.min(...data.map(d => d.distanceCm)) : 0;

  // Calculate variance (variation) over last readings
  const variance = data.length > 1
    ? Math.abs(data[0].distanceCm - data[data.length - 1].distanceCm)
    : 0;

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
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Last {data.length} readings</p>
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