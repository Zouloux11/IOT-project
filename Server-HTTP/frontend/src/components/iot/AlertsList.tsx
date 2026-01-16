import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

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

interface AlertsListProps {
  alerts: Alert[];
  onAcknowledge: (alertId: number) => void;
  onResolve: (alertId: number) => void;
}

export const AlertsList: React.FC<AlertsListProps> = ({ alerts, onAcknowledge, onResolve }) => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'destructive' | 'secondary' | 'outline'> = {
      active: 'destructive',
      acknowledged: 'secondary',
      resolved: 'outline'
    };
    return variants[status] || 'outline';
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      microphone: 'bg-blue-100 text-blue-800',
      distance: 'bg-green-100 text-green-800',
      motion: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No active alerts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          Active Alerts
          <Badge variant="destructive">{alerts.filter(a => a.status === 'active').length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex gap-2 flex-wrap">
                  <Badge className={getTypeBadge(alert.type)}>
                    {alert.type}
                  </Badge>
                  <Badge variant={getStatusBadge(alert.status)}>
                    {alert.status}
                  </Badge>
                  <span className="text-xs text-gray-500 font-mono">{alert.deviceId}</span>
                </div>
                {alert.status === 'active' && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Acknowledge alert"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-900 mb-1">{alert.message}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(alert.createdAt).toLocaleString('fr-FR')}</span>
                {alert.status === 'acknowledged' && (
                  <button
                    onClick={() => onResolve(alert.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};