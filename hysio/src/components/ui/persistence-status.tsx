'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  Save,
  RefreshCw
} from 'lucide-react';

interface PersistenceStatusProps {
  isInitialized: boolean;
  status: {
    isInitialized: boolean;
    lastSaveTime: string | null;
    queueLength: number;
    sessionId: string;
    clientId: string;
    dataSize: number;
  } | null;
  className?: string;
}

export function PersistenceStatus({ isInitialized, status, className = '' }: PersistenceStatusProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  // Show status briefly when changes occur
  React.useEffect(() => {
    if (status?.lastSaveTime) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status?.lastSaveTime]);

  if (!isInitialized || !status) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <RefreshCw size={12} className="animate-spin text-gray-400" />
        <span className="text-xs text-gray-500">Initialiseren...</span>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (!status.isInitialized) {
      return <AlertCircle size={12} className="text-red-500" />;
    }

    if (status.queueLength > 0) {
      return <RefreshCw size={12} className="animate-spin text-blue-500" />;
    }

    if (status.lastSaveTime) {
      const timeSinceLastSave = Date.now() - new Date(status.lastSaveTime).getTime();
      if (timeSinceLastSave < 30000) { // Less than 30 seconds
        return <CheckCircle size={12} className="text-green-500" />;
      } else if (timeSinceLastSave < 120000) { // Less than 2 minutes
        return <Clock size={12} className="text-yellow-500" />;
      } else {
        return <AlertCircle size={12} className="text-orange-500" />;
      }
    }

    return <Save size={12} className="text-gray-400" />;
  };

  const getStatusText = () => {
    if (!status.isInitialized) return 'Niet geïnitialiseerd';
    if (status.queueLength > 0) return 'Opslaan...';
    if (!status.lastSaveTime) return 'Nog niet opgeslagen';

    const timeSinceLastSave = Date.now() - new Date(status.lastSaveTime).getTime();
    const minutes = Math.floor(timeSinceLastSave / 60000);
    const seconds = Math.floor((timeSinceLastSave % 60000) / 1000);

    if (timeSinceLastSave < 60000) {
      return `${seconds}s geleden opgeslagen`;
    } else {
      return `${minutes}m ${seconds}s geleden opgeslagen`;
    }
  };

  const getStatusColor = () => {
    if (!status.isInitialized) return 'text-red-600 border-red-300';
    if (status.queueLength > 0) return 'text-blue-600 border-blue-300';

    if (status.lastSaveTime) {
      const timeSinceLastSave = Date.now() - new Date(status.lastSaveTime).getTime();
      if (timeSinceLastSave < 30000) {
        return 'text-green-600 border-green-300';
      } else if (timeSinceLastSave < 120000) {
        return 'text-yellow-600 border-yellow-300';
      } else {
        return 'text-orange-600 border-orange-300';
      }
    }

    return 'text-gray-600 border-gray-300';
  };

  const formatDataSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${className}`}>
            {getStatusIcon()}
            <span className={`text-xs ${getStatusColor().split(' ')[0]} transition-opacity ${
              isVisible ? 'opacity-100' : 'opacity-60'
            }`}>
              Auto-opslaan
            </span>
            {status.queueLength > 0 && (
              <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                {status.queueLength}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-semibold text-sm">Auto-opslaan Status</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={getStatusColor().split(' ')[0]}>{getStatusText()}</span>
              </div>
              {status.lastSaveTime && (
                <div className="flex justify-between">
                  <span>Laatst opgeslagen:</span>
                  <span>{new Date(status.lastSaveTime).toLocaleTimeString('nl-NL')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Data grootte:</span>
                <span>{formatDataSize(status.dataSize)}</span>
              </div>
              {status.queueLength > 0 && (
                <div className="flex justify-between">
                  <span>In wachtrij:</span>
                  <span>{status.queueLength} item(s)</span>
                </div>
              )}
              <div className="border-t pt-1 mt-1">
                <div className="flex justify-between">
                  <span>Sessie ID:</span>
                  <span className="font-mono text-xs">{status.sessionId.split('_')[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for tight spaces
export function PersistenceStatusCompact({ isInitialized, status, className = '' }: PersistenceStatusProps) {
  if (!isInitialized || !status) {
    return (
      <div className={`flex items-center ${className}`}>
        <RefreshCw size={10} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const getStatusIcon = () => {
    if (!status.isInitialized) {
      return <AlertCircle size={10} className="text-red-500" />;
    }

    if (status.queueLength > 0) {
      return <RefreshCw size={10} className="animate-spin text-blue-500" />;
    }

    if (status.lastSaveTime) {
      const timeSinceLastSave = Date.now() - new Date(status.lastSaveTime).getTime();
      if (timeSinceLastSave < 30000) {
        return <CheckCircle size={10} className="text-green-500" />;
      } else {
        return <Clock size={10} className="text-yellow-500" />;
      }
    }

    return <Save size={10} className="text-gray-400" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center ${className}`}>
            {getStatusIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-xs">
            {!status.isInitialized && 'Auto-opslaan niet actief'}
            {status.queueLength > 0 && 'Auto-opslaan actief...'}
            {status.isInitialized && status.queueLength === 0 && status.lastSaveTime &&
             `Opgeslagen om ${new Date(status.lastSaveTime).toLocaleTimeString('nl-NL')}`}
            {status.isInitialized && status.queueLength === 0 && !status.lastSaveTime &&
             'Nog niet opgeslagen'}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}