
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  type?: 'full' | 'icon';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  type = 'full', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`font-bold flex items-center ${sizeClasses[size]} ${className}`}>
      <span className="text-cyan-600">B</span>
      {type === 'full' && (
        <>
          <span className="text-cyan-500">anquet</span>
          <span className="text-cyan-600">MS</span>
        </>
      )}
    </div>
  );
};

export default Logo;
