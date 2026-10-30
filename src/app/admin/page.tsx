'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import InteractiveMap from '@/components/InteractiveMap';
import { Incident, ResourceItem, ReliefCamp } from '@/lib/types';

export default function AdminCommandCenter() {
  const {
    incidents,
    camps,
    resources,
    selectedDistrict,
    setSelectedDistrict,
    updateIncidentStatus,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'incidents' | 'resources' | 'camps' | 'ai_assistant' | 'audit'>(
    'overview'
  );
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);
  const [reportGenerated, setReportGenerated] = useState<string | null>(null);

  // Statistics
  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const inTransitCount = incidents.filter((i) => i.status === 'in_transit' || i.status === 'dispatched').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;
  const totalVictims = incidents.reduce((sum, i) => sum + i.peopleAffected, 0);

  const handleApproveIncident = (id: string) => {
    updateIncidentStatus(id, 'verified', 'District Collectorate DDMA');
  };

  const handleDispatchUnits = (id: string) => {
    updateIncidentStatus(id, 'dispatched', 'Naval & Fishermen Liaison');
  };

  const handleGenerateReport = (type: string) => {
    setReportGenerated(`Kerala State Disaster SITREP (${type.toUpperCase()}) exported successfully. Downloaded to Command Logs.`);
    setTimeout(() => setReportGenerated(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#060D17] text-white">
      {/* Top Operations Room Command Bar */}
      <div className="bg-[#0B1526] border-b border-[#172A45] px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-white shadow-lg animate-pulse">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline text-base sm:text-lg font-black tracking-tight">
                  KERALA DISASTER COMMAND CENTER
                </h1>
                <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase">
                  OPS ROOM LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                State Emergency Operations Centre (SEOC) · Unified Telemetry Triage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerateReport('daily')}
              className="px-3 py-1.5 rounded-lg bg-[#172A45] hover:bg-[#203a5e] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Export SITREP</span>
            </button>
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 rounded-lg bg-[#172A45] flex items-center justify-center text-slate-300 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {reportGenerated && (
        <div className="bg-emerald-900/60 border-b border-emerald-500/40 px-4 py-2 text-center text-xs text-emerald-300 font-bold">
          {reportGenerated}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
          <div className="bg-[#0B1526] p-4 rounded-2xl border border-[#172A45] shadow-sm">
            <span className="text-[11px] uppercase font-bold text-slate-400">Total Alerts</span>
            <p className="font-headline text-2xl sm:text-3xl font-black text-white mt-1">
              {totalIncidents}
            </p>
            <span className="text-[11px] text-slate-400">Across 14 Districts</span>
          </div>

          <div className="bg-[#0B1526] p-4 rounded-2xl border border-red-900/50 shadow-sm">
            <span className="text-[11px] uppercase font-bold text-red-400">Critical Priority</span>
            <p className="font-headline text-2xl sm:text-3xl font-black text-red-500 mt-1">
              {criticalCount}
            </p>
            <span className="text-[11px] text-red-400/80">Immediate Boat Triage</span>
          </div>

          <div className="bg-[#0B1526] p-4 rounded-2xl border border-[#172A45] shadow-sm">
            <span className="text-[11px] uppercase font-bold text-slate-400">Units In Transit</span>
            <p className="font-headline text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              {inTransitCount}
            </p>
            <span className="text-[11px] text-amber-400/80">Boats & 4x4 Offroad</span>
          </div>

          <div className="bg-[#0B1526] p-4 rounded-2xl border border-[#172A45] shadow-sm">
            <span className="text-[11px] uppercase font-bold text-slate-400">People Trapped</span>
            <p className="font-headline text-2xl sm:text-3xl font-black text-white mt-1">
              {totalVictims}
            </p>
            <span className="text-[11px] text-slate-400">Citizens Telemetry</span>
          </div>

          <div className="bg-[#0B1526] p-4 rounded-2xl border border-emerald-900/50 shadow-sm col-span-2 lg:col-span-1">
            <span className="text-[11px] uppercase font-bold text-emerald-400">Resolved Missions</span>
            <p className="font-headline text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {resolvedCount}
            </p>
            <span className="text-[11px] text-emerald-400/80">Safely in Relief Camps</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#172A45] pb-3 mb-6">
          {[
            { id: 'overview', label: 'Command Overview & Map', icon: 'dashboard' },
            { id: 'incidents', label: `Incident Approvals (${incidents.length})`, icon: 'crisis_alert' },
            { id: 'resources', label: 'Resource Logistics', icon: 'inventory' },
            { id: 'camps', label: 'Camp Capacities', icon: 'holiday_village' },
            { id: 'ai_assistant', label: 'AI Assistant & Duplicate Detection', icon: 'smart_toy' },
            { id: 'audit', label: 'Audit Logs & Reports', icon: 'analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-secondary text-white shadow-lg'
                  : 'bg-[#0B1526] text-slate-400 hover:text-white border border-[#172A45]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Overview & Live Map Telemetry */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <InteractiveMap className="h-[500px] sm:h-[580px]" />
            </div>

            {/* Right Live Triage Queue */}
            <div className="lg:col-span-4 bg-[#0B1526] rounded-2xl p-5 border border-[#172A45] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live Dispatch Queue
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-xl bg-[#060D17] border border-[#172A45] hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-secondary">{inc.trackingCode}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-950 text-red-400">
                        Score {inc.aiPriorityScore}
                      </span>
                    </div>

                    <h4 className="font-headline text-sm font-bold text-white line-clamp-1">{inc.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{inc.locationDescription}</p>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5 pt-2 border-t border-[#172A45]">
                      <span>Victims: <strong className="text-white">{inc.peopleAffected}</strong></span>
                      <span className="font-bold uppercase text-amber-400">{inc.status}</span>
                    </div>

                    {inc.status === 'pending' && (
                      <div className="flex gap-2 mt-2.5">
                        <button
                          onClick={() => handleApproveIncident(inc.id)}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDispatchUnits(inc.id)}
                          className="flex-1 py-1.5 bg-secondary hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                        >
                          Mobilize Boat
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Incident Approvals */}
        {activeTab === 'incidents' && (
          <div className="bg-[#0B1526] rounded-2xl border border-[#172A45] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#060D17] text-slate-400 uppercase tracking-wider text-[11px] border-b border-[#172A45]">
                  <tr>
                    <th className="p-4">Tracking Code</th>
                    <th className="p-4">Incident Title</th>
                    <th className="p-4">District / Sector</th>
                    <th className="p-4">Victims</th>
                    <th className="p-4">AI Score</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172A45]">
                  {incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-[#060D17]/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-secondary">{inc.trackingCode}</td>
                      <td className="p-4 font-semibold text-white max-w-xs truncate">{inc.title}</td>
                      <td className="p-4 text-slate-300">{inc.district}</td>
                      <td className="p-4 font-bold text-white">{inc.peopleAffected}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-red-400 bg-red-950/80">
                          {inc.aiPriorityScore}/100
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 text-slate-300">
                          {inc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {inc.status !== 'resolved' && (
                          <button
                            onClick={() => updateIncidentStatus(inc.id, 'resolved', 'Command Room')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => handleDispatchUnits(inc.id)}
                          className="px-3 py-1 bg-secondary hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                        >
                          Dispatch Team
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Resource Logistics */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((res) => {
              const allocatedPercent = Math.round((res.allocated / res.available) * 100);
              return (
                <div
                  key={res.id}
                  className="bg-[#0B1526] rounded-2xl p-5 border border-[#172A45] flex flex-col justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Category: {res.category.replace('_', ' ')}
                    </span>
                    <h3 className="font-headline text-base font-bold text-white mt-1">
                      {res.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Target Deployment: <strong>{res.targetDistrict}</strong>
                    </p>

                    <div className="grid grid-cols-3 gap-2 my-4 py-2 bg-[#060D17] rounded-xl px-3 border border-[#172A45] text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Total Stock</span>
                        <p className="font-bold text-white">{res.available}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Allocated</span>
                        <p className="font-bold text-amber-400">{res.allocated}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Delivered</span>
                        <p className="font-bold text-emerald-400">{res.delivered}</p>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#172A45] overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${allocatedPercent}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[#172A45]">
                    <button
                      onClick={() => alert(`Allocated +50 units of ${res.name}`)}
                      className="flex-1 py-2 bg-secondary hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                    >
                      Allocate Supplies
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Camp Capacities */}
        {activeTab === 'camps' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {camps.map((camp) => (
              <div
                key={camp.id}
                className="bg-[#0B1526] rounded-2xl p-5 border border-[#172A45] flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-emerald-400">
                      {camp.availableBeds} Beds Ready
                    </span>
                    <span className="text-xs text-slate-400">{camp.district}</span>
                  </div>
                  <h4 className="font-headline text-base font-bold text-white mt-1">{camp.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{camp.address}</p>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Occupancy:</span>
                      <span>{camp.currentOccupancy} / {camp.capacity}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#172A45] overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(camp.currentOccupancy / camp.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#172A45] flex justify-between items-center text-xs text-slate-400">
                  <span>Coord: {camp.coordinatorName}</span>
                  <a href={`tel:${camp.coordinatorPhone}`} className="text-secondary font-bold hover:underline">
                    {camp.coordinatorPhone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: AI Assistant Features */}
        {activeTab === 'ai_assistant' && (
          <div className="bg-[#0B1526] rounded-2xl p-6 sm:p-8 border border-[#172A45] max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <span className="material-symbols-outlined text-[24px]">smart_toy</span>
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-white">
                  AI Emergency Assistant Engine (Decision Support Only)
                </h3>
                <p className="text-xs text-slate-400">
                  ⚠️ Assistant models triage distress data. They do NOT replace emergency service personnel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#060D17] p-5 rounded-2xl border border-[#172A45]">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-2">
                  <span className="material-symbols-outlined text-[18px]">find_replace</span>
                  <span>Duplicate Distress Detection</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cluster analysis flagged <strong>2 distress calls</strong> from Aluva Manappuram Bridge (Within 45 meters, reported 3 mins apart).
                </p>
                <div className="mt-3 p-3 bg-[#0B1526] rounded-xl text-xs space-y-1 font-mono">
                  <p className="text-slate-400">KL-EKM-8492 &lt;➔&gt; KL-EKM-8495</p>
                  <p className="text-emerald-400">Merged into Single Boat Dispatch Incident</p>
                </div>
              </div>

              <div className="bg-[#060D17] p-5 rounded-2xl border border-[#172A45]">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-2">
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                  <span>Priority Scoring Weight Factors</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>Rapid Water Surge Rate: <strong>+35 pts</strong></li>
                  <li>Infants / Pregnant / Elderly: <strong>+25 pts</strong></li>
                  <li>Oxygen / Insulin / Dialysis: <strong>+20 pts</strong></li>
                  <li>Night Evacuation / Cut-off Bridge: <strong>+20 pts</strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-[#060D17] p-5 rounded-2xl border border-[#172A45]">
              <span className="text-xs font-bold uppercase text-emerald-400 block mb-2">
                Automated Resource Allocation Recommendations
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Based on rising Periyar hydro-telemetry (+2.4m surge predicted in next 4 hours), the AI assistant recommends staging <strong>12 additional trawler boats</strong> at Aluva Manappuram and dispatching <strong>4,000 potable water cans</strong> to Kainakary Polder, Alappuzha.
              </p>
              <button
                onClick={() => alert('AI Resource recommendations approved and queued for dispatch dispatchers.')}
                className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Approve Resource Deployment Plan</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 6: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-[#0B1526] rounded-2xl p-6 border border-[#172A45] max-w-4xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172A45]">
              <h3 className="font-headline text-base font-bold text-white">
                Immutable Operation Room Audit Logs
              </h3>
              <span className="text-xs text-slate-400">Recorded with WGS84 Geostamp</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                { time: '21:18:04', actor: 'Collectorate EOC', event: 'Approved Boat Rescue KL-EKM-8492' },
                { time: '21:14:12', actor: 'Naval Liaison', event: 'Dispatched Gemini Boat #14 to Aluva Bridge' },
                { time: '21:05:40', actor: 'Health Inspector Amina', event: 'Updated Meppadi Camp Occupancy to 540' },
                { time: '20:54:19', actor: 'Citizen Portal', event: 'SOS Distress Ingestion via SMS Gateway 112' },
                { time: '20:42:01', actor: 'DDMA System', event: 'IMD Red Alert Broadcast Bulletin #42 Triggered' },
              ].map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#060D17] border border-[#172A45] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{log.time}</span>
                    <span className="text-secondary font-bold">{log.actor}</span>
                    <span className="text-slate-300">{log.event}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">VERIFIED</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
