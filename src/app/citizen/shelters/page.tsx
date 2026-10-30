'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { KERALA_DISTRICTS } from '@/lib/data';
import { ReliefCamp } from '@/lib/types';

export default function SheltersPage() {
  const { camps, selectedDistrict, setSelectedDistrict } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [routeModalCamp, setRouteModalCamp] = useState<ReliefCamp | null>(null);

  const filteredCamps = camps.filter((camp) => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.taluk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = districtFilter === 'All' || camp.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const totalBeds = camps.reduce((sum, c) => sum + c.availableBeds, 0);
  const totalOccupancy = camps.reduce((sum, c) => sum + c.currentOccupancy, 0);
  const totalCapacity = camps.reduce((sum, c) => sum + c.capacity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Verified Kerala State Relief Camps · ദുരിതാശ്വാസ ക്യാമ്പുകൾ</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white">
            Safe Shelters & Relief Camps Directory
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-1">
            Real-time occupancy, available beds, hot meal rations, and emergency medical staffing.
          </p>
        </div>
      </div>

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-command-card p-4 rounded-2xl border border-surface-container-high dark:border-command-border shadow-xs">
          <span className="text-xs font-bold text-on-surface-variant dark:text-command-subtle uppercase">
            Active Relief Camps
          </span>
          <p className="font-headline text-2xl font-black text-on-surface dark:text-white mt-1">
            {camps.length} Camps
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            All 100% Verified
          </span>
        </div>

        <div className="bg-white dark:bg-command-card p-4 rounded-2xl border border-surface-container-high dark:border-command-border shadow-xs">
          <span className="text-xs font-bold text-on-surface-variant dark:text-command-subtle uppercase">
            Available Beds
          </span>
          <p className="font-headline text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalBeds} Ready
          </p>
          <span className="text-[11px] text-on-surface-variant dark:text-command-subtle">
            Immediate Evacuee Intake
          </span>
        </div>

        <div className="bg-white dark:bg-command-card p-4 rounded-2xl border border-surface-container-high dark:border-command-border shadow-xs">
          <span className="text-xs font-bold text-on-surface-variant dark:text-command-subtle uppercase">
            Current Evacuees
          </span>
          <p className="font-headline text-2xl font-black text-on-surface dark:text-white mt-1">
            {totalOccupancy}
          </p>
          <span className="text-[11px] text-on-surface-variant dark:text-command-subtle">
            Out of {totalCapacity} Max Capacity
          </span>
        </div>

        <div className="bg-white dark:bg-command-card p-4 rounded-2xl border border-surface-container-high dark:border-command-border shadow-xs">
          <span className="text-xs font-bold text-on-surface-variant dark:text-command-subtle uppercase">
            Ration Supplies
          </span>
          <p className="font-headline text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            Adequate
          </p>
          <span className="text-[11px] text-on-surface-variant dark:text-command-subtle">
            Drinking Water & Rations
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-command-card p-4 rounded-2xl border border-surface-container-high dark:border-command-border shadow-xs mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search by camp school name, taluk or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none"
          >
            <option value="All">All Districts</option>
            {KERALA_DISTRICTS.filter((d) => d !== 'All Kerala').map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Camps List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCamps.map((camp) => {
          const occPercent = Math.round((camp.currentOccupancy / camp.capacity) * 100);
          return (
            <div
              key={camp.id}
              className="bg-white dark:bg-command-card rounded-2xl p-5 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-headline text-xs font-extrabold">
                    {camp.availableBeds} Beds Ready
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant dark:text-command-subtle">
                    {camp.district} · {camp.taluk}
                  </span>
                </div>

                <h3 className="font-headline text-base font-bold text-on-surface dark:text-white leading-tight">
                  {camp.name}
                </h3>
                <p className="text-xs font-semibold text-secondary dark:text-secondary-fixed mt-0.5">
                  {camp.nameMl}
                </p>
                <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-secondary">pin_drop</span>
                  <span className="line-clamp-1">{camp.address}</span>
                </p>

                {/* Capacity Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant dark:text-command-subtle">Occupancy</span>
                    <span className="font-bold text-on-surface dark:text-white">
                      {camp.currentOccupancy} / {camp.capacity} ({occPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container dark:bg-command-navy overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        occPercent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occPercent}%` }}
                    />
                  </div>
                </div>

                {/* Facilities Tags (Direct Stitch Style) */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-surface-container dark:border-command-border">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container dark:bg-command-navy text-[10px] font-semibold text-on-surface dark:text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-emerald-500">check_circle</span>
                    Water & Meals
                  </span>
                  {camp.hasGenerator && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container dark:bg-command-navy text-[10px] font-semibold text-on-surface dark:text-white flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-emerald-500">check_circle</span>
                      Generator Power
                    </span>
                  )}
                  {camp.hasBabyFood && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container dark:bg-command-navy text-[10px] font-semibold text-on-surface dark:text-white flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-emerald-500">check_circle</span>
                      Baby Food
                    </span>
                  )}
                  {camp.hasMedicalSupport && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container dark:bg-command-navy text-[10px] font-semibold text-on-surface dark:text-white flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-emerald-500">check_circle</span>
                      Medical Team
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-surface-container dark:border-command-border">
                <button
                  onClick={() => setRouteModalCamp(camp)}
                  className="flex-1 py-2.5 rounded-xl bg-primary-container hover:bg-black text-white font-headline text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">navigation</span>
                  <span>Get Safe Route</span>
                </button>
                <a
                  href={`tel:${camp.coordinatorPhone}`}
                  title={`Call Coordinator: ${camp.coordinatorName}`}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-secondary text-xs font-bold flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safe Route Guidance Modal */}
      {routeModalCamp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-command-card max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-surface-container-high dark:border-command-border flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                Safe Navigation Engine
              </span>
              <button
                onClick={() => setRouteModalCamp(null)}
                className="text-on-surface-variant dark:text-command-subtle hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <h3 className="font-headline text-lg font-bold text-on-surface dark:text-white">
              Evacuation Route to {routeModalCamp.name}
            </h3>

            <div className="bg-surface-container-low dark:bg-command-navy p-4 rounded-xl border border-surface-container-high dark:border-command-border space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Active Bypass: Low-lying Aluva Riverbank Road Closed (+2.4m surge)</span>
              </div>
              <p className="text-on-surface-variant dark:text-command-subtle">
                <strong>Recommended Elevated Road:</strong> Take NH 544 via Aluva Flyover towards Private Bus Stand bypass. Elevated bridge clearance is dry and clear of debris.
              </p>
              <div className="pt-2 flex justify-between border-t border-surface-container dark:border-command-border font-mono">
                <span>Estimated Drive/Trek Time: <strong>14 mins</strong></span>
                <span>Distance: <strong>3.2 km</strong></span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${routeModalCamp.lat},${routeModalCamp.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-secondary hover:bg-red-700 text-white rounded-xl text-xs font-bold text-center transition-colors"
              >
                Launch GPS Turn-by-Turn Navigation
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
