'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner className="mr-3" />
    <span className="text-hysio-deep-green">Component laden...</span>
  </div>
);

export const LazyHysioAssistant = dynamic(
  () => import('./hysio-assistant').then(mod => ({ default: mod.HysioAssistant })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazyNewIntakeWorkflow = dynamic(
  () => import('./new-intake-workflow').then(mod => ({ default: mod.default })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazyStreamlinedIntakeWorkflow = dynamic(
  () => import('./streamlined-intake-workflow').then(mod => ({ default: mod.default })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazyConsultSummaryPage = dynamic(
  () => import('./consult-summary-page').then(mod => ({ default: mod.default })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazySOEPResultPage = dynamic(
  () => import('./soep-result-page').then(mod => ({ default: mod.default })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazyDiagnosisCodeFinder = dynamic(
  () => import('../diagnosecode/diagnosis-code-finder').then(mod => ({ default: mod.DiagnosisCodeFinder })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazyEduPackPanel = dynamic(
  () => import('../edupack/edupack-panel').then(mod => ({ default: mod.EduPackPanel })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazySmartMailInterface = dynamic(
  () => import('../smartmail/smartmail-interface').then(mod => ({ default: mod.default })),
  {
    loading: LoadingFallback,
    ssr: false
  }
);