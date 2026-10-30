'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Incident } from '@/lib/types';

export default function VolunteerPortal() {
  const { user, incidents, assignVolunteer, updateIncidentStatus, selectedDistrict } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'my_tasks' | 'radio' | 'resources'>('requests');
  const [radioMessages, setRadioMessages] = useState<
    { id: string; sender: string; channel: string; text: string; time: string }[]
  >([
    {
      id: 'rad-1',
      sender: 'Kochi Naval Liaison',
      channel: 'VHF-CH 16',
      text: 'Heavy current reported under Aluva Railway bridge. Small country crafts avoid main channel.',
      time: '14 mins ago',
    },
    {
      id: 'rad-2',
      sender: 'Fishermen Lead Jaleel',
      channel: 'Team Alpha',
      text: 'Trawler #4 unloaded 18 persons safely at Aluva Manappuram camp landing point.',
      time: '8 mins ago',
    },
    {
      id: 'rad-3',
      sender: 'Collectorate EOC',
      channel: 'Disaster Cell',
      text: 'Priority dispatch requested for Chooralmala landslide sector: Oxygen cylinders needed.',
      time: '2 mins ago',
    },
  ]);
  const [newRadioText, setNewRadioText] = useState('');

  // Pending incidents nearby
  const nearbyIncidents = incidents.filter(
    (i) => i.status === 'pending' || i.status === 'verified'
  );

  // Accepted tasks
  const myTasks = incidents.filter(
    (i) => i.assignedVolunteerId === user.id || i.status === 'in_transit' || i.status === 'dispatched'
  );

  const handleAcceptTask = (incident: Incident) => {
    assignVolunteer(incident.id, user.id, user.name);
    setActiveTab('my_tasks');
  };

  const handleCompleteTask = (incidentId: string) => {
    updateIncidentStatus(incidentId, 'resolved', user.name);
  };

  const handleSendRadio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRadioText.trim()) return;
    setRadioMessages((prev) => [
      {
        id: `rad-${Date.now()}`,
        sender: user.name,
        channel: 'Field Patrol',
        text: newRadioText,
        time: 'Just now',
      },
      ...prev,
    ]);
    setNewRadioText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Volunteer Profile Banner */}
      <div className="w-full bg-gradient-to-r from-primary-container via-[#0e2747] to-primary-container text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
              <span className="material-symbols-outlined text-[36px]">sailing</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline text-xl sm:text-2xl font-black">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[11px] font-extrabold uppercase">
                  Verified Responder
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                {user.activeBadge || 'Fishermen Coastal Rescue Army · Motorized Trawler #14'}
              </p>
              <p className="text-xs text-white/70 mt-1">
                Active Zone: {selectedDistrict} Basin Sector · Emergency Radio Mesh Active
              </p>
            </div>
          </div>

          {/* Volunteer Telemetry Stats */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/70">Missions</span>
              <p className="font-headline text-xl font-black text-white">18</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/70">Rescued</span>
              <p className="font-headline text-xl font-black text-emerald-400">46</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/70">Hours Active</span>
              <p className="font-headline text-xl font-black text-white">32h</p>
            </div>
          </div>
        </div>

        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-white">
          <span className="material-symbols-outlined text-[180px]">volunteer_activism</span>
        </div>
      </div>

      {/* Portal Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-surface-container-high dark:border-command-border pb-3 mb-6">
        {[
          { id: 'requests', label: `Nearby Requests (${nearbyIncidents.length})`, icon: 'crisis_alert' },
          { id: 'my_tasks', label: `Accepted Tasks (${myTasks.length})`, icon: 'assignment' },
          { id: 'radio', label: 'Field Radio & Messages', icon: 'radio' },
          { id: 'resources', label: 'Equipment & Supplies', icon: 'inventory_2' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-secondary text-white shadow-md'
                : 'bg-white dark:bg-command-card text-on-surface-variant dark:text-command-subtle hover:bg-surface-container border border-surface-container-high dark:border-command-border'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Nearby Rescue Requests */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {nearbyIncidents.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-command-card rounded-2xl p-8 text-center border border-surface-container-high dark:border-command-border">
              <span className="material-symbols-outlined text-[48px] text-emerald-500">task_alt</span>
              <h3 className="font-headline text-lg font-bold text-on-surface dark:text-white mt-2">
                All Nearby Incidents Triaged!
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1">
                No unassigned distress calls currently pending in {selectedDistrict}.
              </p>
            </div>
          ) : (
            nearbyIncidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-white dark:bg-command-card rounded-2xl p-5 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col justify-between gap-4 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary"></div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-secondary">
                      {inc.trackingCode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-extrabold uppercase">
                      AI Priority {inc.aiPriorityScore}/100
                    </span>
                  </div>

                  <h3 className="font-headline text-base font-bold text-on-surface dark:text-white leading-tight">
                    {inc.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-secondary">pin_drop</span>
                    <span>{inc.locationDescription}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 my-3 py-2 bg-surface-container-low dark:bg-command-navy rounded-xl px-3 border border-surface-container-high dark:border-command-border text-xs">
                    <div>
                      <span className="text-[10px] text-on-surface-variant dark:text-command-subtle uppercase font-bold">
                        Trapped Count
                      </span>
                      <p className="font-bold text-on-surface dark:text-white">{inc.peopleAffected} People</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant dark:text-command-subtle uppercase font-bold">
                        Reported Time
                      </span>
                      <p className="font-bold text-on-surface dark:text-white">{inc.reportedAt}</p>
                    </div>
                  </div>

                  {inc.specialNeeds && inc.specialNeeds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {inc.specialNeeds.map((sn, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-surface-container dark:bg-command-card text-[10px] font-semibold text-on-surface dark:text-white"
                        >
                          {sn}
                        </span>
                      ))}
                    </div>
                  )}

                  {inc.notes && (
                    <p className="text-xs text-on-surface-variant dark:text-command-subtle italic mt-2 bg-surface-container-low dark:bg-command-navy p-2 rounded-lg">
                      &ldquo;{inc.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-surface-container dark:border-command-border">
                  <button
                    onClick={() => handleAcceptTask(inc)}
                    className="flex-1 py-2.5 bg-secondary hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Accept Rescue Task</span>
                  </button>
                  <a
                    href={`tel:${inc.contactPhone}`}
                    className="px-3.5 py-2.5 bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-secondary rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">call</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Accepted Tasks */}
      {activeTab === 'my_tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-command-card rounded-2xl p-6 shadow-sm border border-secondary/40 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-secondary">
                    {task.trackingCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-extrabold uppercase">
                    IN PROGRESS ({task.status.toUpperCase()})
                  </span>
                </div>

                <h3 className="font-headline text-lg font-bold text-on-surface dark:text-white">
                  {task.title}
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1">
                  {task.locationDescription}
                </p>

                <div className="bg-surface-container-low dark:bg-command-navy p-3.5 rounded-xl border border-surface-container-high dark:border-command-border my-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant dark:text-command-subtle">Caller Name:</span>
                    <span className="font-bold text-on-surface dark:text-white">{task.contactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant dark:text-command-subtle">Contact Number:</span>
                    <span className="font-mono font-bold text-secondary">{task.contactPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant dark:text-command-subtle">Victims Stranded:</span>
                    <span className="font-bold text-on-surface dark:text-white">{task.peopleAffected}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Mark Rescue Mission Resolved</span>
                </button>
                <a
                  href={`tel:${task.contactPhone}`}
                  className="py-3 px-4 bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>Direct Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Tactical Radio & Messages */}
      {activeTab === 'radio' && (
        <div className="bg-white dark:bg-command-card rounded-2xl p-6 shadow-sm border border-surface-container-high dark:border-command-border max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container dark:border-command-border">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">cell_tower</span>
              <h3 className="font-headline text-base font-bold text-on-surface dark:text-white">
                Disaster Response Tactical Field Radio
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
              BSNL K-SWAN Encrypted
            </span>
          </div>

          {/* Message Stream */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {radioMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-xl bg-surface-container-low dark:bg-command-navy border border-surface-container-high dark:border-command-border"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface dark:text-white">{msg.sender}</span>
                    <span className="px-1.5 py-0.2 rounded bg-surface-container dark:bg-command-card font-mono text-[10px] text-on-surface-variant">
                      {msg.channel}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant dark:text-command-subtle">{msg.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant dark:text-white leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendRadio} className="flex gap-2 pt-2 border-t border-surface-container dark:border-command-border">
            <input
              type="text"
              placeholder="Transmit SITREP or radio broadcast message..."
              value={newRadioText}
              onChange={(e) => setNewRadioText(e.target.value)}
              className="flex-1 bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-secondary hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Transmit</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Equipment & Supplies */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: 'Life Jackets (Adult/Child)', available: '42 units', status: 'In Boat Locker' },
            { name: 'Nylon Rescue Ropes (50m)', available: '8 bundles', status: 'Ready' },
            { name: 'Trauma First Aid & Tourniquets', available: '6 kits', status: 'Restocked' },
            { name: 'Outboard Motor Fuel (Petrol/Oil)', available: '60 Liters', status: 'Good' },
            { name: 'Chlorine Water Purification Tabs', available: '500 tabs', status: 'Adequate' },
            { name: 'High-Lumen Waterproof Torches', available: '12 units', status: 'Charged 100%' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-command-card rounded-2xl p-5 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant dark:text-command-subtle">
                  Field Logistics
                </span>
                <h4 className="font-headline text-base font-bold text-on-surface dark:text-white mt-0.5">
                  {item.name}
                </h4>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-surface-container dark:border-command-border text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.available}</span>
                <span className="text-on-surface-variant dark:text-command-subtle">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
