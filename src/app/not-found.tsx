import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-command-card rounded-2xl p-6 sm:p-8 border border-surface-container-high dark:border-command-border text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">travel_explore</span>
        </div>
        <h2 className="font-headline text-2xl font-bold text-on-surface dark:text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mb-6 leading-relaxed">
          The requested page could not be located. You can navigate back to the home portal or visit the dedicated download page.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-container text-white font-bold text-xs shadow-sm hover:bg-black transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/download"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs shadow-sm hover:bg-red-700 transition-colors"
          >
            Download App (APK)
          </Link>
        </div>
      </div>
    </div>
  );
}
