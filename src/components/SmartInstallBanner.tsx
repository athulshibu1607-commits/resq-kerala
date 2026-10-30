'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import InstallAppButton from './InstallAppButton';

export default function SmartInstallBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if dismissed previously
    const dismissedUntil = localStorage.getItem('resq_install_banner_dismissed_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setIsVisible(false);
      return;
    }

    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // Do not show on auth pages, install page, or active emergency SOS dispatch
    const forbiddenRoutes = [
      '/install',
      '/login',
      '/register',
      '/citizen/sos',
      '/forgot-password',
      '/reset-password',
    ];
    if (!pathname || forbiddenRoutes.some((route) => pathname.startsWith(route))) {
      setIsVisible(false);
      return;
    }

    // Small delay for non-intrusive appearance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Dismiss for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    try {
      localStorage.setItem('resq_install_banner_dismissed_until', nextWeek.toString());
    } catch (e) {}
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="App Installation Prompt"
      className="fixed bottom-24 sm:bottom-20 lg:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 dark:bg-command-card/95 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-surface-container-high dark:border-command-border flex items-center justify-between gap-3">
        {/* App Icon & Content */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-container p-1.5 flex items-center justify-center shrink-0 border border-slate-700 shadow-xs">
            <img src="/icons/icon.svg" alt="RESQ KERALA Icon" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="font-headline text-xs sm:text-sm font-bold text-on-surface dark:text-white leading-tight truncate">
              Get RESQ KERALA on your phone
            </h4>
            <p className="text-[11px] text-on-surface-variant dark:text-command-subtle leading-tight mt-0.5 truncate">
              Quick access to emergency SOS &amp; offline shelter maps
            </p>
          </div>
        </div>

        {/* Action & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <InstallAppButton
            variant="secondary"
            showInstructionsLink={false}
            className="text-xs py-2 px-3"
          />
          <button
            onClick={handleDismiss}
            aria-label="Dismiss app install banner"
            className="p-1 rounded-lg text-on-surface-variant dark:text-command-subtle hover:bg-surface-container dark:hover:bg-command-navy transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
