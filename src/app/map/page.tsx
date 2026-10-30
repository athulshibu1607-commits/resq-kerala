'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import InteractiveMap from '@/components/InteractiveMap';
import { Incident, ReliefCamp } from '@/lib/types';
import Link from 'next/link';

export default function LiveMapPage() {
  const { selectedDistrict, incidents, camps, language } = useApp();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<ReliefCamp | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Top Floating Status & Offline Telemetry Pill (Direct from Stitch Screen 4) */}
      <div className="w-full flex items-center justify-between gap-2 px-1 mb-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest dark:bg-command-card text-xs font-semibold text-on-surface dark:text-white shadow-xs border border-surface-container-high dark:border-command-border">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span>Offline Pack Cached: 14.2 MB</span>
          <span className="material-symbols-outlined text-[14px] text-emerald-600">cloud_done</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high dark:bg-command-card text-xs font-semibold text-on-surface-variant dark:text-command-subtle shadow-xs border border-surface-container-high dark:border-command-border">
          <span className="material-symbols-outlined text-[14px] text-secondary">satellite_alt</span>
          <span>GPS: ±3m High Accuracy Fix</span>
        </div>
      </div>

      {/* Dynamic Location Anchor Bar (From Stitch Screen 4) */}
      <div className="w-full rounded-2xl bg-white dark:bg-command-card p-3.5 sm:p-4 shadow-sm border border-surface-container-high dark:border-command-border flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">explore_nearby</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-sm sm:text-base font-bold text-on-surface dark:text-white truncate">
                {selectedDistrict} Basin / Aluva Sector
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container dark:bg-command-navy text-on-surface-variant dark:text-command-subtle font-mono font-bold uppercase">
                EKM
              </span>
            </div>
            <span className="text-xs text-on-surface-variant dark:text-command-subtle truncate">
              River Discharge: 1,840 m³/s · High Tide Surge Alert
            </span>
          </div>
        </div>

        <Link
          href="/citizen/sos"
          className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-xl bg-secondary hover:bg-red-700 text-white font-headline text-xs font-bold shadow-md transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">emergency_heat</span>
          <span>Trigger SOS</span>
        </Link>
      </div>

      {/* Map and Side Panel Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Full Interactive Map */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <InteractiveMap
            className="h-[520px] sm:h-[620px]"
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              setSelectedCamp(null);
            }}
            onSelectCamp={(cmp) => {
              setSelectedCamp(cmp);
              setSelectedIncident(null);
            }}
          />

          {/* Map Legend */}
          <div className="bg-white dark:bg-command-card p-4 rounded-2xl border border-surface-container-high dark:border-command-border shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping"></span>
              <span className="font-semibold text-on-surface dark:text-white">Active Rescue SOS (Red Zone)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
              <span className="font-semibold text-on-surface dark:text-white">Landslide Risk Slope (Amber)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-on-surface dark:text-white">Safe Camp High Island</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500"></span>
              <span className="font-semibold text-on-surface dark:text-white">Rescue Boat Patrol</span>
            </div>
          </div>
        </div>

        {/* Right Telemetry Queue / Selected Item Details */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Selected Incident Drawer or Default Feed */}
          {selectedIncident ? (
            <div className="bg-white dark:bg-command-card rounded-2xl p-5 shadow-md border border-secondary/40 flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase">
                  {selectedIncident.severity} Alert
                </span>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div>
                <span className="font-mono text-xs font-bold text-secondary">
                  {selectedIncident.trackingCode}
                </span>
                <h3 className="font-headline text-base font-bold text-on-surface dark:text-white mt-0.5">
                  {selectedIncident.title}
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1">
                  {selectedIncident.locationDescription}
                </p>
              </div>

              <div className="bg-surface-container-low dark:bg-command-navy p-3 rounded-xl space-y-1.5 text-xs border border-surface-container-high dark:border-command-border">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant dark:text-command-subtle">People Stranded:</span>
                  <span className="font-bold text-on-surface dark:text-white">{selectedIncident.peopleAffected} persons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant dark:text-command-subtle">Status:</span>
                  <span className="font-bold text-secondary uppercase">{selectedIncident.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant dark:text-command-subtle">Contact:</span>
                  <span>{selectedIncident.contactName} ({selectedIncident.contactPhone})</span>
                </div>
              </div>

              <Link
                href={`/citizen/requests`}
                className="w-full py-2.5 bg-primary-container hover:bg-black text-white text-xs font-bold rounded-xl text-center shadow-xs transition-colors"
              >
                View Full Mission Timeline
              </Link>
            </div>
          ) : selectedCamp ? (
            <div className="bg-white dark:bg-command-card rounded-2xl p-5 shadow-md border border-emerald-500/40 flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  Safe Relief Camp
                </span>
                <button
                  onClick={() => setSelectedCamp(null)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div>
                <h3 className="font-headline text-base font-bold text-on-surface dark:text-white">
                  {selectedCamp.name}
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-0.5">
                  {selectedCamp.address}
                </p>
              </div>

              <div className="bg-surface-container-low dark:bg-command-navy p-3 rounded-xl space-y-1.5 text-xs border border-surface-container-high dark:border-command-border">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant dark:text-command-subtle">Available Beds:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedCamp.availableBeds} beds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant dark:text-command-subtle">Current Occupants:</span>
                  <span>{selectedCamp.currentOccupancy} / {selectedCamp.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant dark:text-command-subtle">Coordinator:</span>
                  <span>{selectedCamp.coordinatorName}</span>
                </div>
              </div>

              <a
                href={`tel:${selectedCamp.coordinatorPhone}`}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl text-center transition-colors shadow-xs"
              >
                Call Coordinator ({selectedCamp.coordinatorPhone})
              </a>
            </div>
          ) : (
            <div className="bg-white dark:bg-command-card rounded-2xl p-5 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle">
                  Active Distress Incidents ({incidents.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-command-subtle">
                Click any marker on the map to inspect live coordinates, trapped individuals, and volunteer team assignments.
              </p>

              <div className="space-y-2 mt-2 max-h-[380px] overflow-y-auto pr-1">
                {incidents.slice(0, 4).map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="p-3 rounded-xl bg-surface-container-low dark:bg-command-navy hover:bg-surface-container border border-surface-container-high dark:border-command-border cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-secondary">{inc.trackingCode}</span>
                      <span className="text-[10px] font-bold uppercase text-red-600">{inc.severity}</span>
                    </div>
                    <p className="text-xs font-semibold text-on-surface dark:text-white line-clamp-1">
                      {inc.title}
                    </p>
                    <span className="text-[11px] text-on-surface-variant dark:text-command-subtle block mt-0.5">
                      {inc.peopleAffected} persons · {inc.district}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* District Evacuation Quick Helpline */}
          <div className="bg-surface-container-low dark:bg-command-navy p-4 rounded-2xl border border-surface-container-high dark:border-command-border">
            <span className="text-[11px] uppercase font-bold text-on-surface-variant dark:text-command-subtle block mb-1">
              District EOC Control Room
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-headline text-base font-bold text-on-surface dark:text-white">
                  {selectedDistrict} DEOC: 1077
                </p>
                <p className="text-xs text-on-surface-variant dark:text-command-subtle">
                  Direct radio link to District Collectorate
                </p>
              </div>
              <a
                href="tel:1077"
                className="w-9 h-9 rounded-xl bg-secondary text-white flex items-center justify-center hover:bg-red-700"
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
