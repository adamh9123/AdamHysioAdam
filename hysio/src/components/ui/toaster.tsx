'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'bg-white border-hysio-mint/20',
          title: 'text-hysio-deep-green',
          description: 'text-hysio-deep-green-900/70',
          actionButton: 'bg-hysio-deep-green text-white',
          cancelButton: 'bg-hysio-mint text-hysio-deep-green',
          closeButton: 'bg-hysio-mint/20 text-hysio-deep-green',
        },
      }}
    />
  );
}