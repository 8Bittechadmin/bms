
import React from 'react';

interface ProgressBarProps {
  percent: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percent, 
  color = 'bg-cyan-500', 
  size = 'md',
  label
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1 text-sm">
          <span>{label}</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${color} ${sizeClasses[size]} rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
