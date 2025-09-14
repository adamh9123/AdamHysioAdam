'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SmartmailRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new SmartMail demo page
    router.replace('/smartmail-demo');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-hysio-cream/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hysio-deep-green mx-auto mb-4"></div>
        <p className="text-hysio-deep-green">Doorverwijzen naar SmartMail...</p>
      </div>
    </div>
  );
}