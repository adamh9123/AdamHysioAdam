'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-hysio-cream/30 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-red-200 bg-red-50/50">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-800">Er is een fout opgetreden</CardTitle>
              <CardDescription className="text-red-600">
                De applicatie heeft een onverwachte fout gedetecteerd
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-white/50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-mono text-red-800 break-all">
                {error.message || 'Onbekende fout'}
              </p>
            </div>
          )}

          <div className="bg-hysio-mint/10 border border-hysio-mint rounded-lg p-4">
            <h4 className="font-semibold text-hysio-deep-green mb-2">Wat u kunt doen:</h4>
            <ul className="text-sm text-hysio-deep-green-900/80 space-y-1 list-disc list-inside">
              <li>Probeer de pagina te herladen</li>
              <li>Controleer uw internetverbinding</li>
              <li>Keer terug naar het dashboard</li>
              <li>Neem contact op met support als het probleem aanhoudt</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onReset}
              className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
            >
              <RotateCcw size={16} className="mr-2" />
              Probeer Opnieuw
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="text-hysio-deep-green border-hysio-mint"
            >
              <Home size={16} className="mr-2" />
              Terug naar Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}