import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  unit = '',
  variant = 'default',
  size = 'md'
}) => {
  const variantStyles = {
    default: 'bg-gray-50 border-gray-200',
    danger: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    success: 'bg-green-50 border-green-200'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`border rounded p-3 ${variantStyles[variant]}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-semibold ${textSizes[size]} text-gray-900`}>
        {value} <span className="text-sm text-gray-500">{unit}</span>
      </p>
    </div>
  );
};