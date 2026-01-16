import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MetricCard } from './MetricCard';
import type { MotionHistory } from '../../lib/sensorAPI';

interface MotionCardProps {
  deviceId: string;
  data: MotionHistory[];
}

export const MotionCard: React.FC<MotionCardProps> = ({ 
  deviceId, 
  data
}) => {
  const latestValue = data[0]?.motionDetected || false;
  
  const recentDetections = data.filter(d => d.motionDetected).slice(0, 10);
  const detectionRate = data.length > 0 
    ? (data.filter(d => d.motionDetected).length / data.length * 100).toFixed(1)
    : '0';

  const lastDetection = recentDetections[0]?.recordedAt 
    ? new Date(recentDetections[0].recordedAt)
    : null;

  const timeSinceLastDetection = lastDetection
    ? Math.floor((Date.now() - lastDetection.getTime()) / 1000)
    : null;

  const formatTimeSince = (seconds: number | null) => {
    if (seconds === null) return 'Never';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Motion Detector</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">{deviceId}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <MetricCard 
            label="Status" 
            value={latestValue ? 'DETECTED' : 'CLEAR'} 
            size="md"
            variant={latestValue ? 'danger' : 'success'}
          />
          <MetricCard 
            label="Detection Rate" 
            value={detectionRate} 
            unit="%" 
          />
          <MetricCard 
            label="Last Detection" 
            value={formatTimeSince(timeSinceLastDetection)}
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            Recent Detections ({recentDetections.length})
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-48 overflow-y-auto">
            {recentDetections.length > 0 ? (
              <div className="space-y-1">
                {recentDetections.map((detection, index) => (
                  <div key={detection.id || index} className="text-xs text-gray-700 font-mono border-b border-gray-200 pb-1 last:border-0">
                    {new Date(detection.recordedAt).toLocaleString('fr-FR')}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No detections recorded</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <span className="text-gray-500">Total Samples:</span>
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