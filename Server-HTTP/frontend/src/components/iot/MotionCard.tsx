import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Activity, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MotionData {
  value: boolean;
  recordedAt: string;
}

interface MotionCardProps {
  deviceId: string;
  data: MotionData[];
  latestValue: boolean;
  alert?: boolean;
  alertMessage?: string;
}

export const MotionCard: React.FC<MotionCardProps> = ({ 
  deviceId, 
  data, 
  latestValue,
  alert,
  alertMessage
}) => {
  const recentDetections = data.filter(d => d.value).slice(0, 5);

  return (
    <Card className={`border-2 transition-colors ${alert ? 'border-red-500 bg-red-500/5' : 'border-primary/20'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Motion Detector
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
        <div className="flex items-center justify-center py-8">
          <AnimatePresence mode="wait">
            {latestValue ? (
              <motion.div
                key="detected"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-24 h-24 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                >
                  <Activity className="h-12 w-12 text-white" />
                </motion.div>
                <p className="text-2xl font-bold text-red-500">Motion Detected!</p>
              </motion.div>
            ) : (
              <motion.div
                key="clear"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-green-500">
                  <Activity className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-500">All Clear</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {alert && alertMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-500 font-semibold">{alertMessage}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-2">Recent Detections</p>
          <div className="space-y-2">
            {recentDetections.length > 0 ? (
              recentDetections.map((detection, index) => (
                <div key={index} className="text-sm bg-secondary/50 rounded p-2">
                  {new Date(detection.recordedAt).toLocaleString('fr-FR')}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent motion detected</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};