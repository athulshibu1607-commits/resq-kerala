'use client';

import React from 'react';
import { HydroStation } from '@/lib/types';

interface HydroGaugeProps {
  station: HydroStation;
  className?: string;
}

export default function HydroGauge({ station, className = '' }: HydroGaugeProps) {
  // Calculate percentage of danger level
  const percent = Math.min(Math.round((station.currentLevelM / station.dangerLevelM) * 100), 100);
  const isDanger = station.status === 'danger' || station.currentLevelM >= station.warningLevelM;

  return (
    <div className={`bg-white dark:bg-command-card rounded-2xl p-4 sm:p-5 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col gap-3 transition-colors ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface-container dark:bg-command-navy flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">water</span>
          </div>
          <div>
            <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface dark:text-white leading-tight">
              {station.riverName} Hydro-Telemetry
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-command-subtle">
              {station.locationName} · {station.district}
            </p>
          </div>
        </div>

        <span
          className={`font-headline text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
            isDanger
              ? 'bg-secondary-fixed text-on-secondary-fixed animate-pulse'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          }`}
        >
          {station.trend === 'rising' ? 'RISING RAPIDLY' : 'STEADY LEVEL'}
        </span>
      </div>

      {/* Level Numbers & Visual Meter */}
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex justify-between items-baseline">
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white tracking-tight">
              {station.currentLevelM}
            </span>
            <span className="text-sm font-semibold text-on-surface-variant dark:text-command-subtle">meters</span>
          </div>
          <span className="text-xs text-on-surface-variant dark:text-command-subtle font-medium">
            Danger Line: <strong>{station.dangerLevelM}m</strong> · Warning: {station.warningLevelM}m
          </span>
        </div>

        {/* Multi-segmented Gauge Bar (As in Stitch Screen 2) */}
        <div className="w-full h-3.5 bg-surface-container-high dark:bg-command-navy rounded-full overflow-hidden flex p-0.5 shadow-inner">
          <div
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
            style={{ width: `${Math.min(percent, 55)}%` }}
            title="Safe capacity"
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${percent > 55 ? Math.min(percent - 55, 25) : 0}%` }}
            title="Advisory band"
          />
          <div
            className="h-full bg-secondary animate-pulse rounded-r-full transition-all duration-500"
            style={{ width: `${percent > 80 ? Math.min(percent - 80, 20) : 0}%` }}
            title="Danger breach band"
          />
        </div>

        <div className="flex justify-between text-[11px] text-on-surface-variant dark:text-command-subtle font-medium mt-0.5">
          <span>Normal (0.0m)</span>
          <span className="font-bold text-secondary dark:text-secondary-fixed">
            {station.currentLevelM}m (Live Gauge)
          </span>
          <span className="text-red-600 font-bold">Danger ({station.dangerLevelM}m)</span>
        </div>
      </div>

      {/* Rainfall & Dam Shutters Micro-Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-surface-container dark:border-command-border">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-container-low dark:bg-command-navy">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant dark:text-command-subtle">
            rainy
          </span>
          <div>
            <p className="text-[10px] text-on-surface-variant dark:text-command-subtle uppercase font-bold">
              6-Hr Catchment Rain
            </p>
            <p className="font-headline text-sm font-bold text-on-surface dark:text-white">
              {station.rainfall6hMm} mm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-container-low dark:bg-command-navy">
          <span className="material-symbols-outlined text-[20px] text-secondary">
            gate
          </span>
          <div className="min-w-0">
            <p className="text-[10px] text-on-surface-variant dark:text-command-subtle uppercase font-bold">
              Spillway Shutters
            </p>
            <p className="text-xs font-semibold text-secondary dark:text-secondary-fixed truncate">
              {station.damShutterStatus || 'Regulated outflow'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
