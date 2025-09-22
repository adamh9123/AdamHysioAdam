'use client';

import * as React from 'react';

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Progress({
  value = 0,
  max = 100,
  className = '',
  size = 'md',
  variant = 'default'
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    default: 'bg-hysio-mint',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-full bg-hysio-mint/20 ${sizeClasses[size]} ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div
        className={`h-full w-full flex-1 transition-all duration-300 ease-in-out ${variantClasses[variant]}`}
        style={{
          transform: `translateX(-${100 - percentage}%)`
        }}
      />
    </div>
  );
}