'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-command-card border-t border-surface-container-high dark:border-command-border mt-16 pb-24 lg:pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Emergency mission */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary-container/10 flex items-center justify-center border border-secondary/20">
                <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  tsunami
                </span>
              </div>
              <span className="font-headline text-lg font-extrabold text-on-surface dark:text-white">
                RESQ KERALA
              </span>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
              Unified disaster response platform engineered for rapid life safety, real-time rescue dispatch, hydro-telemetry monitoring, and community relief coordination across Kerala.
            </p>
            <div className="mt-2 text-xs font-semibold text-secondary dark:text-secondary-fixed">
              അടിയന്തര ദുരന്ത നിവാരണ പോർട്ടൽ - കേരളം
            </div>
          </div>

          {/* Col 2: Life Safety Toll-Free Hotlines */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-headline text-sm font-bold text-on-surface dark:text-white uppercase tracking-wider">
              Emergency Hotlines
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between py-1 border-b border-surface-container dark:border-command-border">
                <span className="text-on-surface-variant dark:text-command-subtle">Unified Emergency</span>
                <span className="font-mono font-bold text-secondary text-sm">112</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-surface-container dark:border-command-border">
                <span className="text-on-surface-variant dark:text-command-subtle">State Disaster Cell (KSDMA)</span>
                <span className="font-mono font-bold text-on-surface dark:text-white">1070</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-surface-container dark:border-command-border">
                <span className="text-on-surface-variant dark:text-command-subtle">District Emergency Ops (DEOC)</span>
                <span className="font-mono font-bold text-on-surface dark:text-white">1077</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-surface-container dark:border-command-border">
                <span className="text-on-surface-variant dark:text-command-subtle">Fire & Rescue Force</span>
                <span className="font-mono font-bold text-on-surface dark:text-white">101</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-surface-container dark:border-command-border">
                <span className="text-on-surface-variant dark:text-command-subtle">KANIV 108 Ambulance</span>
                <span className="font-mono font-bold text-on-surface dark:text-white">108</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-headline text-sm font-bold text-on-surface dark:text-white uppercase tracking-wider">
              Network Portals
            </h4>
            <div className="flex flex-col space-y-2 text-xs text-on-surface-variant dark:text-command-subtle">
              <Link href="/citizen" className="hover:text-secondary dark:hover:text-white transition-colors">
                Citizen Relief Dashboard
              </Link>
              <Link href="/citizen/sos" className="hover:text-secondary dark:hover:text-white transition-colors font-bold text-secondary">
                1-Tap SOS Emergency Dispatch
              </Link>
              <Link href="/map" className="hover:text-secondary dark:hover:text-white transition-colors">
                GIS Live Hazard & Safe Zone Map
              </Link>
              <Link href="/citizen/shelters" className="hover:text-secondary dark:hover:text-white transition-colors">
                Verified Relief Camps Directory
              </Link>
              <Link href="/volunteer" className="hover:text-secondary dark:hover:text-white transition-colors">
                Fishermen & Volunteer Relief Mesh
              </Link>
              <Link href="/admin" className="hover:text-secondary dark:hover:text-white transition-colors">
                Admin Command Center
              </Link>
            </div>
          </div>

          {/* Col 4: SMS Fallback & Offline Capability */}
          <div className="flex flex-col gap-3">
            <h4 className="font-headline text-sm font-bold text-on-surface dark:text-white uppercase tracking-wider">
              Offline Mesh & 2G Fallback
            </h4>
            <div className="bg-surface-container-low dark:bg-command-navy p-3 rounded-xl border border-surface-container-high dark:border-command-border">
              <p className="text-xs text-on-surface dark:text-white font-medium">
                No internet connection? Dispatch your emergency coordinates via official Emergency SMS:
              </p>
              <div className="mt-2 p-1.5 bg-white dark:bg-command-card rounded font-mono text-xs font-bold text-secondary select-all text-center">
                SMS ➔ 112 (ERSS Kerala)
              </div>
              <p className="text-[10px] text-on-surface-variant dark:text-command-subtle mt-1.5">
                National Emergency Response Support System (ERSS) with 24/7 SMS triage.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer Banner */}
        <div className="border-t border-surface-container-high dark:border-command-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs text-on-surface-variant dark:text-command-subtle">
            ⚠️ <strong>RESQ KERALA Hackathon Prototype:</strong> Academic simulation only. In real distress, dial <strong>112</strong> or <strong>1077</strong> immediately.
          </p>
          <p className="text-xs text-on-surface-variant dark:text-command-subtle">
            &copy; 2026 RESQ KERALA Civic Initiative. Built with Next.js, React, Tailwind CSS & OpenStreetMap.
          </p>
        </div>
      </div>
    </footer>
  );
}
