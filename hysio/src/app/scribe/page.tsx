'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PatientInfoForm } from '@/components/scribe/patient-info-form';
import { useWorkflowContext } from './layout';
import { PatientInfo } from '@/lib/types';

export default function ScribePage() {
  const router = useRouter();
  const { setPatientInfo, setCurrentWorkflow } = useWorkflowContext();

  const handlePatientInfoSubmit = (info: PatientInfo) => {
    // Store patient info in context
    setPatientInfo(info);

    // Navigate to workflow selection hub
    router.push('/scribe/workflow');
  };

  return (
    <PatientInfoForm
      onPatientInfoSubmit={handlePatientInfoSubmit}
      onBack={() => window.location.href = '/dashboard'}
      sessionType="intake"
    />
  );
}