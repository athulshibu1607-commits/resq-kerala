'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe bg-surface/95 dark:bg-[#060D17]/95 backdrop-blur-xl border-t border-surface-container-high dark:border-command-border shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center h-20 px-2 relative max-w-lg mx-auto">
        {/* Home */}
        <Link
          href="/citizen"
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] transition-colors ${
            pathname === '/citizen'
              ? 'text-secondary dark:text-secondary-fixed font-bold'
              : 'text-on-surface-variant dark:text-command-subtle'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">dashboard</span>
          <span className="text-[11px] font-medium mt-0.5">Home</span>
        </Link>

        {/* Live Map */}
        <Link
          href="/map"
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] transition-colors ${
            pathname === '/map'
              ? 'text-secondary dark:text-secondary-fixed font-bold'
              : 'text-on-surface-variant dark:text-command-subtle'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">explore</span>
          <span className="text-[11px] font-medium mt-0.5">Live Map</span>
        </Link>

        {/* Central Pulsing SOS Button (Direct from Stitch) */}
        <div className="relative -top-5 flex flex-col items-center justify-center">
          <Link
            href="/citizen/sos"
            aria-label="Send Distress SOS"
            className="w-14 h-14 rounded-full bg-secondary text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform animate-pulse-sos"
          >
            <span className="material-symbols-outlined text-[26px] leading-none">sos</span>
            <span className="text-[9px] tracking-tight leading-none uppercase font-extrabold mt-0.5">
              രക്ഷ
            </span>
          </Link>
          <span className="text-[11px] font-bold text-secondary dark:text-secondary-fixed mt-1 tracking-wide">
            SOS
          </span>
        </div>

        {/* Camps */}
        <Link
          href="/citizen/shelters"
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] transition-colors ${
            pathname?.startsWith('/citizen/shelters')
              ? 'text-secondary dark:text-secondary-fixed font-bold'
              : 'text-on-surface-variant dark:text-command-subtle'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">holiday_village</span>
          <span className="text-[11px] font-medium mt-0.5">Camps</span>
        </Link>

        {/* Emergency / More */}
        <Link
          href="/citizen/contacts"
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] transition-colors ${
            pathname?.startsWith('/citizen/contacts')
              ? 'text-secondary dark:text-secondary-fixed font-bold'
              : 'text-on-surface-variant dark:text-command-subtle'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">emergency</span>
          <span className="text-[11px] font-medium mt-0.5">Help/More</span>
        </Link>
      </div>
    </nav>
  );
}
