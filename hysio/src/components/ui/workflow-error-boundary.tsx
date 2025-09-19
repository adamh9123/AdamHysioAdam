'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface WorkflowErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface WorkflowErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

class WorkflowErrorBoundary extends React.Component<
  WorkflowErrorBoundaryProps,
  WorkflowErrorBoundaryState
> {
  constructor(props: WorkflowErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): WorkflowErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Workflow Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log detailed error information for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'WorkflowErrorBoundary',
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.handleReset}
          />
        );
      }

      // Default error UI
      return (
        <div className="w-full max-w-4xl mx-auto p-6">
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-red-800">
                Workflow Error
              </CardTitle>
              <CardDescription className="text-red-700">
                Er is een onverwachte fout opgetreden in de workflow
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-white/50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">
                  Foutmelding:
                </h3>
                <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">
                  {this.state.error?.message || 'Onbekende fout'}
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="text-sm text-red-700">
                  <p>De workflow is onverwacht gestopt. U kunt:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Proberen de workflow opnieuw te starten</li>
                    <li>Teruggaan naar het dashboard</li>
                    <li>Contact opnemen met support als het probleem aanhoudt</li>
                  </ul>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={this.handleReset}
                    variant="default"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RefreshCw size={18} className="mr-2" />
                    Workflow Herstarten
                  </Button>

                  <Button
                    onClick={() => {
                      window.location.href = '/dashboard';
                    }}
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Home size={18} className="mr-2" />
                    Terug naar Dashboard
                  </Button>
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                    🔍 Developer Details (alleen in development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export { WorkflowErrorBoundary };