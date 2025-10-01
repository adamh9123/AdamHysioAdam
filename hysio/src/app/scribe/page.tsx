'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PatientInfoForm } from '@/components/scribe/patient-info-form';
import { useScribeStore } from '@/lib/state/scribe-store';
import { useWorkflowNavigation } from '@/hooks/useWorkflowNavigation';
import { PatientInfo } from '@/types/api';

export default function ScribePage() {
  const router = useRouter();
  const setPatientInfo = useScribeStore(state => state.setPatientInfo);
  const setCurrentWorkflow = useScribeStore(state => state.setCurrentWorkflow);
  const { navigateToWorkflowSelection } = useWorkflowNavigation();

  const handlePatientInfoSubmit = (info: PatientInfo) => {
    // Store patient info in context
    console.log('Patient info submitted, navigating to workflow selection');
    setPatientInfo(info);

    // Navigate to workflow selection hub using state-aware navigation
    navigateToWorkflowSelection();
  };

  return (
    <PatientInfoForm
      onPatientInfoSubmit={handlePatientInfoSubmit}
      onBack={() => window.location.href = '/dashboard'}
      sessionType="intake"
    />
  );
}