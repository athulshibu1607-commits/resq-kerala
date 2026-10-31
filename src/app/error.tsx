'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error Boundary caught error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-command-card rounded-2xl p-6 sm:p-8 border border-surface-container-high dark:border-command-border text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/80 text-secondary mx-auto flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>
        <h2 className="font-headline text-xl font-bold text-on-surface dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mb-6 leading-relaxed">
          An unexpected interface error occurred. You can retry loading this section or return to the main portal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-secondary hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface dark:text-white font-bold text-xs transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
