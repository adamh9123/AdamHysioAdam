'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from './error-boundary';
import { toast } from 'sonner';

interface WorkflowErrorBoundaryProps {
  children: React.ReactNode;
  workflowName?: string;
  onError?: (error: Error) => void;
  redirectPath?: string;
}

export function WorkflowErrorBoundary({
  children,
  workflowName = 'workflow',
  onError,
  redirectPath = '/scribe'
}: WorkflowErrorBoundaryProps) {
  const router = useRouter();

  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`${workflowName} error:`, error, errorInfo);

    toast.error(`Fout in ${workflowName}`, {
      description: error.message || 'Er is een onverwachte fout opgetreden',
      duration: 5000,
    });

    if (onError) {
      onError(error);
    }
  }, [workflowName, onError]);

  const handleReset = React.useCallback(() => {
    router.push(redirectPath);
  }, [router, redirectPath]);

  return (
    <ErrorBoundary
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
}