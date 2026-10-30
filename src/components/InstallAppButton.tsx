'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface InstallAppButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'minimal';
  showInstructionsLink?: boolean;
}

export default function InstallAppButton({
  className = '',
  variant = 'primary',
  showInstructionsLink = true,
}: InstallAppButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chrome / Edge / Android PWA prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
      setDeferredPrompt(null);
      return;
    }

    const isOnInstallPage = pathname === '/install';

    if (isOnInstallPage) {
      const targetId = isIOS ? 'ios-instructions' : 'device-instructions';
      const el = document.getElementById(targetId) || document.getElementById('device-instructions');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      router.push(isIOS ? '/install?platform=ios' : '/install');
    }
  };

  if (isInstalled) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 ${className}`}>
        <span className="material-symbols-outlined text-[16px]">check_circle</span>
        <span>App Installed on Device</span>
      </div>
    );
  }

  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-sm cursor-pointer';
  const variants = {
    primary: 'bg-primary-container hover:bg-black text-white px-4 py-2.5',
    secondary: 'bg-secondary hover:bg-red-700 text-white px-4 py-2.5',
    outline: 'border border-surface-container-high dark:border-command-border text-on-surface dark:text-white hover:bg-surface-container px-3.5 py-2',
    minimal: 'text-secondary dark:text-secondary-fixed hover:underline text-xs p-1',
  };

  const isOnInstallPage = pathname === '/install';

  const buttonLabel = deferredPrompt
    ? 'Install App Now'
    : isIOS
    ? 'Add to Home Screen (Guide)'
    : isOnInstallPage
    ? 'View Installation Steps'
    : 'Install App';

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleInstallClick}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        title="Install RESQ KERALA to Home Screen"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isIOS ? 'ios_share' : 'install_mobile'}
        </span>
        <span>{buttonLabel}</span>
      </button>

      {showInstructionsLink && !deferredPrompt && !isOnInstallPage && (
        <Link
          href="/install"
          className="text-xs text-on-surface-variant dark:text-command-subtle hover:text-secondary dark:hover:text-white underline"
        >
          How to install
        </Link>
      )}
    </div>
  );
}
