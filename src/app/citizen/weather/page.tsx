'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import HydroGauge from '@/components/HydroGauge';

export default function WeatherHydroPage() {
  const { hydroStations, selectedDistrict } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high dark:bg-command-card text-on-surface-variant dark:text-command-subtle text-xs font-bold mb-2">
          <span className="material-symbols-outlined text-[16px] text-secondary">water_voc</span>
          <span>Kerala State Dam & River Hydro-Telemetry · ജലനിരപ്പ് വിവരങ്ങൾ</span>
        </div>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white">
          Real-Time River Gauges & Dam Spillway Status
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-1">
          Automated sensor feeds from Central Water Commission (CWC) and KSEB Dam Safety Directorate.
        </p>
      </div>

      {/* River Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hydroStations.map((station) => (
          <HydroGauge key={station.id} station={station} />
        ))}
      </div>
    </div>
  );
}
