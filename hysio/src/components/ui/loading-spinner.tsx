'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Loader2
        className={`animate-spin text-hysio-deep-green ${sizeClasses[size]}`}
      />
      {text && (
        <span className="text-hysio-deep-green-900/70 text-sm">
          {text}
        </span>
      )}
    </div>
  );
}