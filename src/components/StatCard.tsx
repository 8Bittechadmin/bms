
import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend,
  className,
  onClick
}) => {
  const cardClasses = cn(
    "card-stats",
    onClick && "cursor-pointer hover:shadow-md transition-shadow", 
    className
  );

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="card-stats-header">{title}</h3>
          <div className="card-stats-value">{value}</div>
          
          {trend && (
            <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-1 text-muted-foreground">from last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-cyan-600 text-2xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
