'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import HydroGauge from '@/components/HydroGauge';
import InteractiveMap from '@/components/InteractiveMap';

export default function CitizenDashboard() {
  const { user, selectedDistrict, language, toggleLanguage, hydroStations, camps, dispatchSOS } = useApp();
  const periyarStation = hydroStations.find((h) => h.district === selectedDistrict) || hydroStations[0];

  const [sosStatus, setSosStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleQuickSOS = async () => {
    setSosStatus('TRANSMITTING...');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    try {
      const inc = await dispatchSOS({
        title: `Water Rescue Requested: ${selectedDistrict} Sector`,
        titleMl: 'അടിയന്തര രക്ഷാദൗത്യം ആവശ്യപ്പെട്ടു',
        category: 'boat_rescue',
        severity: 'critical',
        peopleAffected: 4,
        specialNeeds: ['Water evacuation', 'Elderly assistance'],
        locationDescription: 'Auto-detected GPS fix (10.1076° N, 76.3516° E)',
      });

      setSosStatus('DISPATCH TRANSMITTED!');
      setToastMessage(`Simulated GPS Rescue Payload (${inc.trackingCode}) sent to ${selectedDistrict} Collectorate EOC! Help is mobilized.`);

      setTimeout(() => {
        setSosStatus(null);
      }, 4000);
    } catch (e) {
      setSosStatus(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-8 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-md z-50 bg-primary-container text-white p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 border border-secondary/40 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-[26px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <div>
              <p className="font-headline text-sm font-bold text-white">Distress Dispatch Queued!</p>
              <p className="text-xs text-white/90 mt-0.5 leading-relaxed">{toastMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Urgent Flash Alert Banner (Direct from Stitch Screen 2) */}
      <div className="relative overflow-hidden rounded-2xl bg-secondary p-4 sm:p-5 shadow-lg text-white mb-5">
        <div className="flex items-start gap-3.5">
          <span className="material-symbols-outlined text-[28px] text-white shrink-0 animate-bounce">
            warning
          </span>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                അടിയന്തിര മുന്നറിയിപ്പ് · IMD BULLETIN #42
              </span>
              <span className="text-xs opacity-90">Live Just Now</span>
            </div>
            <h2 className="font-headline text-base sm:text-lg font-bold mt-1 leading-snug">
              RED ALERT: Landslide & Flash Inundation Risk
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-0.5 line-clamp-2 sm:line-clamp-none">
              Wayanad, Idukki & Ernakulam under severe hazard notice. Low-lying river basin zones prepare for prompt evacuation. Keep emergency battery kits and valid ID documents packed.
            </p>
          </div>
        </div>
      </div>

      {/* Regional Context & Sector Strip (From Stitch Screen 2) */}
      <div className="flex items-center justify-between bg-white dark:bg-command-card rounded-xl px-4 py-2.5 mb-6 border border-surface-container-high dark:border-command-border shadow-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">my_location</span>
          <span className="font-headline text-sm font-bold text-on-surface dark:text-white">
            {selectedDistrict} (Aluva / Periyar Sector)
          </span>
          <span className="text-xs text-on-surface-variant dark:text-command-subtle hidden sm:inline">
            · GPS ±3m High Fix
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 bg-surface-container-low dark:bg-command-navy px-3 py-1 rounded-full text-on-surface dark:text-white text-xs font-semibold shadow-xs hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[14px] text-secondary">translate</span>
            <span>{language === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
      </div>

      {/* Desktop Responsive Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Primary Emergency Bento Grid */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Giant Distress / SOS Card (Direct Stitch Aesthetic) */}
          <div className="relative overflow-hidden rounded-2xl bg-secondary p-5 sm:p-6 shadow-xl text-white">
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                  CRITICAL EVACUATION · അടിയന്തിരം
                </span>
              </div>
              <span className="material-symbols-outlined text-[32px] text-white">sos</span>
            </div>

            <div className="mt-4">
              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight">
                Request Water & Medical Rescue
              </h2>
              <p className="text-xs sm:text-sm text-white/95 mt-1">
                Instant priority satellite dispatch to Kerala Fire Force, Indian Navy & NDRF Boats in {selectedDistrict} Sector.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handleQuickSOS}
                className="w-full min-h-[56px] bg-white text-secondary hover:bg-surface-container-low rounded-xl font-headline text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[24px] text-secondary animate-pulse">
                  crisis_alert
                </span>
                <span>{sosStatus || '1-TAP EMERGENCY DISPATCH'}</span>
              </button>
              <div className="flex items-center justify-between text-xs text-white/80 px-1">
                <span>അടിയന്തര രക്ഷാദൗത്യത്തിന് ഇവിടെ ടാപ്പ് ചെയ്യുക</span>
                <Link href="/citizen/sos" className="underline font-bold hover:text-white">
                  Full SOS Form &gt;
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Action Multi-Card Grid (From Stitch Screen 2) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Find Safe Shelters */}
            <Link
              href="/citizen/shelters"
              className="flex flex-col justify-between bg-white dark:bg-command-card rounded-2xl p-4 sm:p-5 shadow-sm border border-surface-container-high dark:border-command-border hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[22px]">holiday_village</span>
                </div>
                <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                  142 Open
                </span>
              </div>
              <div className="mt-4">
                <h3 className="font-headline text-base font-bold text-on-surface dark:text-white leading-tight">
                  Safe Shelters
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-0.5">
                  ദുരിതാശ്വാസ ക്യാമ്പുകൾ
                </p>
              </div>
              <div className="mt-4 w-full py-2 bg-surface-container dark:bg-command-navy text-on-surface dark:text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 group-hover:bg-surface-container-high transition-colors">
                <span>Find Nearby Camps</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </Link>

            {/* Report Missing Person */}
            <Link
              href="/citizen/report"
              className="flex flex-col justify-between bg-white dark:bg-command-card rounded-2xl p-4 sm:p-5 shadow-sm border border-surface-container-high dark:border-command-border hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-surface-container dark:bg-command-navy flex items-center justify-center text-primary-container dark:text-white group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[22px]">person_search</span>
                </div>
                <span className="text-xs font-semibold bg-surface-container dark:bg-command-navy text-on-surface-variant dark:text-command-subtle px-2.5 py-0.5 rounded-full">
                  Live Registry
                </span>
              </div>
              <div className="mt-4">
                <h3 className="font-headline text-base font-bold text-on-surface dark:text-white leading-tight">
                  Report Incident
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-0.5">
                  കാണാതായവർ / സഹായം
                </p>
              </div>
              <div className="mt-4 w-full py-2 bg-surface-container dark:bg-command-navy text-on-surface dark:text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 group-hover:bg-surface-container-high transition-colors">
                <span>Report Incident</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </Link>
          </div>

          {/* Full Width Volunteer Action (From Stitch Screen 2) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-primary-container text-white rounded-2xl p-4 sm:p-5 shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] text-emerald-400">
                  volunteer_activism
                </span>
              </div>
              <div>
                <span className="font-headline text-base font-bold block leading-tight">
                  Offer Aid or Boat Dispatch
                </span>
                <span className="text-xs text-white/70">
                  സന്നദ്ധസേവനം · Fishermen Boat Network & 4x4 Offroaders
                </span>
              </div>
            </div>
            <Link
              href="/volunteer"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-headline text-xs font-extrabold active:scale-95 transition-all shrink-0"
            >
              Volunteer Check-in
            </Link>
          </div>

          {/* Hydro Telemetry Gauge */}
          {periyarStation && <HydroGauge station={periyarStation} />}
        </div>

        {/* Right Column: Live Interactive GIS Map & Relief Camp Capacity Teaser */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Live GIS Map Preview */}
          <div className="bg-white dark:bg-command-card rounded-2xl p-4 shadow-sm border border-surface-container-high dark:border-command-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">explore</span>
                <h3 className="font-headline text-base font-bold text-on-surface dark:text-white">
                  Live GIS Hazard & Safe Zones
                </h3>
              </div>
              <Link href="/map" className="text-xs font-bold text-secondary hover:underline flex items-center gap-0.5">
                <span>Expand Map</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
            <InteractiveMap className="h-[340px]" />
          </div>

          {/* Nearest Camp Quick Telemetry */}
          <div className="bg-white dark:bg-command-card rounded-2xl p-5 shadow-sm border border-surface-container-high dark:border-command-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-on-surface-variant dark:text-command-subtle uppercase">
                Nearest Evacuation Camp
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                138 Beds Ready
              </span>
            </div>

            <h4 className="font-headline text-base font-bold text-on-surface dark:text-white">
              {camps[0]?.name}
            </h4>
            <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1">
              {camps[0]?.address}
            </p>

            {/* Capacity Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface-variant dark:text-command-subtle">Camp Occupancy</span>
                <span className="font-bold text-on-surface dark:text-white">312 / 450</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-container dark:bg-command-navy overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            {/* Amenities Chips */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="px-2 py-0.5 rounded-full bg-surface-container dark:bg-command-navy text-[11px] font-semibold text-on-surface dark:text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                Water & Hot Meals
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container dark:bg-command-navy text-[11px] font-semibold text-on-surface dark:text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                Generator Power
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container dark:bg-command-navy text-[11px] font-semibold text-on-surface dark:text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                Baby Food
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Link
                href="/citizen/shelters"
                className="flex-1 py-2.5 rounded-xl bg-primary-container text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-black transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">navigation</span>
                <span>Get Safe Route</span>
              </Link>
              <a
                href={`tel:${camps[0]?.coordinatorPhone}`}
                className="px-4 py-2.5 rounded-xl bg-surface-container dark:bg-command-navy text-secondary text-xs font-bold flex items-center justify-center hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
