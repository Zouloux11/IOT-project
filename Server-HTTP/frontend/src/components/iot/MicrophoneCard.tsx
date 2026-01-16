import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { SensorChart } from './SensorChart';
import { MetricCard } from './MetricCard';
import type { MicrophoneHistory } from '../../lib/sensorAPI';

interface MicrophoneCardProps {
  deviceId: string;
  data: MicrophoneHistory[];
}

export const MicrophoneCard: React.FC<MicrophoneCardProps> = ({ 
  deviceId, 
  data
}) => {
  const latestValue = data[0]?.decibels || 0;

  const chartData = data.map(d => ({
    time: new Date(d.recordedAt).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }),
    value: d.decibels
  })).reverse(); // Reverse pour avoir l'ordre chronologique dans le graphique

  const avg = data.length > 0 
    ? data.reduce((sum, d) => sum + d.decibels, 0) / data.length 
    : 0;
  
  const max = data.length > 0 ? Math.max(...data.map(d => d.decibels)) : 0;
  const min = data.length > 0 ? Math.min(...data.map(d => d.decibels)) : 0;

  const getVariant = (db: number) => {
    if (db >= 100) return 'danger';
    if (db >= 80) return 'warning';
    return 'default';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Microphone</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">{deviceId}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <MetricCard 
            label="Current" 
            value={latestValue.toFixed(1)} 
            unit="dB" 
            size="lg"
            variant={getVariant(latestValue)}
          />
          <MetricCard label="Average" value={avg.toFixed(1)} unit="dB" />
          <MetricCard label="Max" value={max.toFixed(1)} unit="dB" />
          <MetricCard label="Min" value={min.toFixed(1)} unit="dB" />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Last {data.length} readings</p>
          <SensorChart data={chartData} color="#3b82f6" unit="dB" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <span className="text-gray-500">Samples:</span>
            <span className="ml-2 font-semibold">{data.length}</span>
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