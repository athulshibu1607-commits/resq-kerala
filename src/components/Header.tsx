'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { KERALA_DISTRICTS } from '@/lib/data';
import { UserRole } from '@/lib/types';

export default function Header() {
  const pathname = usePathname();
  const {
    user,
    switchRole,
    selectedDistrict,
    setSelectedDistrict,
    language,
    toggleLanguage,
    isOnline,
    isDatabaseConnected,
    offlineQueue,
    syncOfflineQueue,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: { id: UserRole; label: string; labelMl: string; path: string }[] = [
    { id: 'citizen', label: 'Affected Citizen', labelMl: 'തദ്ദേശവാസി', path: '/citizen' },
    { id: 'volunteer', label: 'Disaster Volunteer', labelMl: 'സന്നദ്ധ പ്രവർത്തകൻ', path: '/volunteer' },
    { id: 'admin', label: 'Civil Admin Officer', labelMl: 'റവന്യൂ കൺട്രോൾ', path: '/admin' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#060D17]/95 backdrop-blur-xl border-b border-surface-container-high dark:border-command-border shadow-xs pt-safe transition-colors">
      {/* Top Banner for Offline Status */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-1 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">cloud_off</span>
            <span>Offline Mesh Mode Active · Cached Pack 14.2 MB · {offlineQueue.length} SOS Queued</span>
          </div>
          <button
            onClick={syncOfflineQueue}
            className="bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded text-[11px] underline"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Top Banner for Local Demo Storage Notice (When Supabase is not configured) */}
      {isOnline && !isDatabaseConnected && (
        <div className="bg-slate-800 text-slate-200 px-4 py-0.5 text-[11px] font-medium flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
            <span className="truncate">Local Demo Mode: Supabase not configured in .env.local. Records stored in browser storage only.</span>
          </div>
          <span className="text-[10px] text-amber-400 uppercase tracking-wider shrink-0 font-bold ml-2">Demo Mode</span>
        </div>
      )}

      {/* Main Topbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary-container/10 flex items-center justify-center border border-secondary/20 group-hover:scale-105 transition-transform">
              <span
                className="material-symbols-outlined text-secondary text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                tsunami
              </span>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-black animate-pulse"></span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline text-lg sm:text-xl font-extrabold text-on-surface dark:text-white tracking-tight leading-none">
                  RESQ KERALA
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-wider">
                  SIMULATION
                </span>
              </div>
              <span className="text-[11px] font-semibold text-on-surface-variant dark:text-command-subtle leading-tight">
                {language === 'ml' ? 'കേരള ഡിസാസ്റ്റർ നെറ്റ്വർക്ക്' : 'State Disaster Management Network'}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/'
                ? 'bg-surface-container dark:bg-command-card text-secondary dark:text-secondary-fixed font-bold'
                : 'text-on-surface-variant dark:text-command-subtle hover:text-on-surface dark:hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            href="/citizen"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              pathname?.startsWith('/citizen') && pathname !== '/citizen/sos'
                ? 'bg-surface-container dark:bg-command-card text-secondary dark:text-secondary-fixed font-bold'
                : 'text-on-surface-variant dark:text-command-subtle hover:text-on-surface dark:hover:text-white'
            }`}
          >
            Citizen Portal
          </Link>
          <Link
            href="/map"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/map'
                ? 'bg-surface-container dark:bg-command-card text-secondary dark:text-secondary-fixed font-bold'
                : 'text-on-surface-variant dark:text-command-subtle hover:text-on-surface dark:hover:text-white'
            }`}
          >
            Live Hazard Map
          </Link>
          <Link
            href="/volunteer"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              pathname?.startsWith('/volunteer')
                ? 'bg-surface-container dark:bg-command-card text-secondary dark:text-secondary-fixed font-bold'
                : 'text-on-surface-variant dark:text-command-subtle hover:text-on-surface dark:hover:text-white'
            }`}
          >
            Volunteer Portal
          </Link>
          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              pathname?.startsWith('/admin')
                ? 'bg-primary-container text-white font-bold shadow-xs'
                : 'text-on-surface-variant dark:text-command-subtle hover:text-on-surface dark:hover:text-white'
            }`}
          >
            Command Center
          </Link>
        </nav>

        {/* Right: Controls & Selectors */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* SOS Quick Button for Desktop */}
          <Link
            href="/citizen/sos"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-secondary hover:bg-secondary-container text-white font-headline text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all animate-pulse-sos"
          >
            <span className="material-symbols-outlined text-[18px]">emergency_heat</span>
            <span>SOS DISPATCH</span>
            <span className="text-[10px] opacity-80">(രക്ഷ)</span>
          </Link>

          {/* District Selector Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setDistrictDropdownOpen(!districtDropdownOpen);
                setRoleDropdownOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-surface-container-high dark:bg-command-card text-on-surface dark:text-white text-xs sm:text-sm font-medium hover:bg-surface-container-highest transition-colors border border-transparent dark:border-command-border"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span className="max-w-[70px] sm:max-w-[100px] truncate">{selectedDistrict}</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {districtDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 max-h-64 overflow-y-auto bg-white dark:bg-command-card rounded-xl shadow-xl border border-surface-container-highest dark:border-command-border py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-on-surface-variant dark:text-command-subtle uppercase tracking-wider border-b border-surface-container dark:border-command-border">
                  Select Kerala District
                </div>
                {KERALA_DISTRICTS.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => {
                      setSelectedDistrict(dist);
                      setDistrictDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm hover:bg-surface-container dark:hover:bg-command-navy flex items-center justify-between ${
                      selectedDistrict === dist
                        ? 'font-bold text-secondary dark:text-secondary-fixed bg-surface-container-low dark:bg-command-border'
                        : 'text-on-surface dark:text-white'
                    }`}
                  >
                    <span>{dist}</span>
                    {selectedDistrict === dist && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Toggle (Malayalam / English) */}
          <button
            onClick={toggleLanguage}
            title="Toggle Malayalam / English Language"
            className="flex items-center gap-1 bg-surface-container-lowest dark:bg-command-card px-2.5 py-1 rounded-full text-on-surface dark:text-white text-xs font-semibold shadow-xs border border-surface-container-high dark:border-command-border active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[14px] text-secondary">translate</span>
            <span>{language === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={toggleDarkMode}
            title="Toggle Dark / Light Mode"
            className="w-8 h-8 rounded-full bg-surface-container-low dark:bg-command-card flex items-center justify-center text-on-surface dark:text-white border border-surface-container-high dark:border-command-border hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Role Switcher Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setDistrictDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs ${
                  user.role === 'admin'
                    ? 'bg-primary-container ring-2 ring-secondary'
                    : user.role === 'volunteer'
                    ? 'bg-emerald-700'
                    : 'bg-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {user.role === 'admin' ? 'admin_panel_settings' : user.role === 'volunteer' ? 'handshake' : 'person'}
                </span>
              </div>
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-command-card rounded-xl shadow-2xl border border-surface-container-highest dark:border-command-border p-2 z-50">
                <div className="px-2.5 py-1.5 mb-1.5 bg-surface-container-low dark:bg-command-navy rounded-lg">
                  <p className="text-xs font-bold text-on-surface dark:text-white">{user.name}</p>
                  <p className="text-[11px] text-on-surface-variant dark:text-command-subtle flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Role: {user.role.toUpperCase()}</span>
                  </p>
                </div>

                <div className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant dark:text-command-subtle px-2 py-1">
                  Switch Active Portal
                </div>

                {roles.map((r) => (
                  <Link
                    key={r.id}
                    href={r.path}
                    onClick={() => {
                      switchRole(r.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex flex-col transition-colors ${
                      user.role === r.id
                        ? 'bg-surface-container-high dark:bg-command-border font-bold text-secondary dark:text-secondary-fixed'
                        : 'hover:bg-surface-container dark:hover:bg-command-navy text-on-surface dark:text-white'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] opacity-75">{r.labelMl}</span>
                  </Link>
                ))}

                <div className="border-t border-surface-container-high dark:border-command-border mt-1.5 pt-1.5">
                  <Link
                    href="/login"
                    onClick={() => setRoleDropdownOpen(false)}
                    className="w-full text-left p-1.5 text-xs text-on-surface-variant dark:text-command-subtle hover:text-secondary flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                    <span>Auth & Verification Center</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Alert Banner Strip (As in Stitch Screen 2 & 4) */}
      <div className="w-full bg-secondary/10 dark:bg-secondary/20 border-t border-secondary/15 py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping shrink-0"></span>
            <span className="text-xs font-bold text-secondary tracking-tight truncate">
              FLOOD & LANDSLIDE ALERT: RED | WAYANAD, IDUKKI & ERNAKULAM (ALUVA SECTOR)
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              {language === 'ml' ? 'അടിയന്തിരം' : 'STATE EMERGENCY'}
            </span>
            <Link
              href="/citizen/sos"
              className="text-xs font-semibold text-secondary hover:underline flex items-center gap-0.5"
            >
              <span>Quick SOS</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
