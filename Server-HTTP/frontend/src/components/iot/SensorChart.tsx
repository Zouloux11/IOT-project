import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorChartProps {
  data: Array<{ time: string; value: number }>;
  color: string;
  unit: string;
  height?: number;
}

export const SensorChart: React.FC<SensorChartProps> = React.memo(({ 
  data, 
  color, 
  unit, 
  height = 180
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: '#6b7280', fontSize: 11 }}
          stroke="#9ca3af"
          interval={Math.floor(data.length / 10)}
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
          type="linear"
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}, (prev, next) => {
  // ✅ Ne re-render que si la longueur ou la dernière valeur change
  return prev.data.length === next.data.length && 
         prev.data[prev.data.length - 1]?.value === next.data[next.data.length - 1]?.value;
});

SensorChart.displayName = 'SensorChart';