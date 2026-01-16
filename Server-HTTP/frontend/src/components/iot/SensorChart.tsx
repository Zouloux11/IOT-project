import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorChartProps {
  data: Array<{ time: string; value: number }>;
  color: string;
  unit: string;
  height?: number;
  showLegend?: boolean;
}

const downsampleData = (data: Array<{ time: string; value: number }>, maxPoints: number = 100) => {
  if (data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
};

export const SensorChart: React.FC<SensorChartProps> = React.memo(({ 
  data, 
  color, 
  unit, 
  height = 180,
  showLegend = false 
}) => {
  // ✅ Mémoïser les données échantillonnées
  const sampledData = useMemo(() => downsampleData(data, 100), [data]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={sampledData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: '#6b7280', fontSize: 11 }}
          stroke="#9ca3af"
          interval="preserveStartEnd"
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 11 }}
          stroke="#9ca3af"
          width={45}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            fontSize: '12px'
          }}
          formatter={(value: number | undefined) => {
            if (value === undefined) return ['N/A', 'Value'];
            return [`${value.toFixed(2)} ${unit}`, 'Value'];
          }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

SensorChart.displayName = 'SensorChart';