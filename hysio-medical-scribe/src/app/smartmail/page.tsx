// SmartMail standalone page
'use client';

import React from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { SmartMailInterface } from '@/components/smartmail/smartmail-interface';

export default function SmartMailPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <SmartMailInterface
          enableDocumentUpload={true}
          enableHistory={true}
          enableExport={true}
          showProgress={true}
        />
      </div>
    </DashboardLayout>
  );
}