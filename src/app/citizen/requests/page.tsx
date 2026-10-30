'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Incident } from '@/lib/types';

export default function MyRequestsPage() {
  const { incidents } = useApp();
  const [searchTracking, setSearchTracking] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);

  const filtered = incidents.filter((i) =>
    searchTracking ? i.trackingCode.toLowerCase().includes(searchTracking.toLowerCase()) : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high dark:bg-command-card text-on-surface-variant dark:text-command-subtle text-xs font-bold mb-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">track_changes</span>
            <span>Live Rescue Dispatch Tracking · ട്രാക്കിംഗ്</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white">
            My Rescue Requests & Incident Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-1">
            Real-time verification timeline from Kerala State EOC, Navy, and Coastal Rescue Teams.
          </p>
        </div>

        <Link
          href="/citizen/sos"
          className="self-start sm:self-auto px-4 py-2 bg-secondary hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">emergency_heat</span>
          <span>Submit New SOS Alert</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search by Tracking Code (e.g., KL-EKM-8492)..."
            value={searchTracking}
            onChange={(e) => setSearchTracking(e.target.value)}
            className="w-full bg-white dark:bg-command-card text-on-surface dark:text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary shadow-xs"
          />
        </div>
      </div>

      {/* Master Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Requests */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filtered.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            const statusColors: Record<string, string> = {
              pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
              verified: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
              dispatched: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
              in_transit: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse',
              resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
            };

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-white dark:bg-command-card border-secondary shadow-md ring-1 ring-secondary'
                    : 'bg-white dark:bg-command-card border-surface-container-high dark:border-command-border hover:border-secondary/40 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-on-surface dark:text-white">
                    {inc.trackingCode}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${statusColors[inc.status] || ''}`}>
                    {inc.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-headline text-sm font-bold text-on-surface dark:text-white line-clamp-1">
                  {inc.title}
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1 line-clamp-1">
                  {inc.locationDescription}
                </p>

                <div className="flex items-center justify-between text-xs text-on-surface-variant dark:text-command-subtle mt-3 pt-2 border-t border-surface-container dark:border-command-border">
                  <span>Victims: <strong>{inc.peopleAffected}</strong></span>
                  <span>{inc.reportedAt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail & Timeline Panel */}
        {selectedIncident && (
          <div className="lg:col-span-7 bg-white dark:bg-command-card rounded-2xl p-6 shadow-sm border border-surface-container-high dark:border-command-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container dark:border-command-border">
              <div>
                <span className="font-mono text-xs font-bold text-secondary dark:text-secondary-fixed">
                  {selectedIncident.trackingCode}
                </span>
                <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface dark:text-white mt-0.5">
                  {selectedIncident.title}
                </h2>
                <p className="text-xs font-semibold text-secondary">
                  {selectedIncident.titleMl}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase">
                  {selectedIncident.severity}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary-container text-white text-xs font-bold uppercase">
                  Score: {selectedIncident.aiPriorityScore}/100
                </span>
              </div>
            </div>

            {/* Telemetry Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              <div className="bg-surface-container-low dark:bg-command-navy p-3 rounded-xl border border-surface-container-high dark:border-command-border">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-command-subtle">
                  People Affected
                </span>
                <p className="font-headline text-base font-bold text-on-surface dark:text-white mt-0.5">
                  {selectedIncident.peopleAffected} persons
                </p>
              </div>

              <div className="bg-surface-container-low dark:bg-command-navy p-3 rounded-xl border border-surface-container-high dark:border-command-border">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-command-subtle">
                  District / Sector
                </span>
                <p className="font-headline text-base font-bold text-on-surface dark:text-white mt-0.5 truncate">
                  {selectedIncident.district}
                </p>
              </div>

              <div className="bg-surface-container-low dark:bg-command-navy p-3 rounded-xl border border-surface-container-high dark:border-command-border col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-command-subtle">
                  Assigned Unit
                </span>
                <p className="font-headline text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  {selectedIncident.assignedVolunteerName || 'Assigning nearest team...'}
                </p>
              </div>
            </div>

            {/* Special Needs Chips */}
            {selectedIncident.specialNeeds && selectedIncident.specialNeeds.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-bold text-on-surface-variant dark:text-command-subtle block mb-1.5">
                  Reported Emergency Factors
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedIncident.specialNeeds.map((need, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-surface-container dark:bg-command-navy text-xs font-semibold text-on-surface dark:text-white flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px] text-secondary">crisis_alert</span>
                      <span>{need}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Timeline */}
            <div>
              <h3 className="font-headline text-sm font-bold text-on-surface dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">timeline</span>
                <span>Live Rescue Operation Timeline</span>
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high dark:before:bg-command-border">
                {selectedIncident.actionTimeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-white ring-4 ring-white dark:ring-command-card">
                      <span className="material-symbols-outlined text-[12px]">done</span>
                    </span>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-headline text-xs font-bold text-on-surface dark:text-white">
                          {step.label}
                        </span>
                        <span className="text-[10px] text-on-surface-variant dark:text-command-subtle">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-0.5">
                        Handled by: <strong>{step.actor}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
