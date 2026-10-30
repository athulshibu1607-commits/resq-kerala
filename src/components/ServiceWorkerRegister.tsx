'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Register when ready
    const registerWorker = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('RESQ KERALA ServiceWorker active with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('RESQ KERALA ServiceWorker registration skipped:', err);
        });
    };

    if (document.readyState === 'complete') {
      registerWorker();
    } else {
      window.addEventListener('load', registerWorker);
      return () => window.removeEventListener('load', registerWorker);
    }
  }, []);

  return null;
}
