import React from 'react';
import { createColorStyle } from '../../utils/colorUtils';

interface ColorBadgeProps {
  color?: string | null;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
}

const ColorBadge: React.FC<ColorBadgeProps> = ({ 
  color, 
  children, 
  className = '', 
  size = 'sm',
  variant = 'default'
}) => {
  const colorStyle = createColorStyle(color || '#6b7280');
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const baseClasses = `inline-flex items-center font-semibold rounded-full border transition-all duration-200 ${sizeClasses[size]}`;
  
  if (variant === 'outline') {
    return (
      <span 
        className={`${baseClasses} bg-transparent border-2 ${className}`}
        style={{
          color: colorStyle.color,
          borderColor: colorStyle.borderColor
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span 
      className={`${baseClasses} ${className}`}
      style={colorStyle}
    >
      {children}
    </span>
  );
};

export default ColorBadge;