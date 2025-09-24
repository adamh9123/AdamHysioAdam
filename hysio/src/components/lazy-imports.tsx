'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner className="mr-3" />
    <span className="text-hysio-deep-green">Laden...</span>
  </div>
);

export const LazyDiagnosisCodeFinder = dynamic(
  () => import('./diagnosecode/diagnosis-code-finder').then(mod => ({ default: mod.DiagnosisCodeFinder })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazyEduPackPanel = dynamic(
  () => import('./edupack/edupack-panel').then(mod => ({ default: mod.EduPackPanel })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazyAssistantIntegration = dynamic(
  () => import('./assistant/assistant-integration').then(mod => ({ default: mod.AssistantIntegration })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazyChatInterface = dynamic(
  () => import('./assistant/chat-interface').then(mod => ({ default: mod.ChatInterface })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);