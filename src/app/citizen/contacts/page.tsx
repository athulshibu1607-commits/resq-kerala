'use client';

import React, { useState } from 'react';
import { EMERGENCY_CONTACTS, KERALA_DISTRICTS } from '@/lib/data';

export default function EmergencyContactsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Statewide', 'District Emergency', 'Marine & Navy', 'Medical'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high dark:bg-command-card text-on-surface-variant dark:text-command-subtle text-xs font-bold mb-2">
          <span className="material-symbols-outlined text-[16px] text-secondary">call</span>
          <span>Kerala State Emergency Directory · അടിയന്തര ഫോൺ നമ്പറുകൾ</span>
        </div>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white">
          Verified Emergency Helplines & Control Rooms
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-1">
          Tap any hotline for instant zero-delay dialing to state, district, or marine rescue services.
        </p>
      </div>

      {/* Primary 112 Call Banner */}
      <div className="w-full bg-secondary text-white rounded-2xl p-5 sm:p-6 shadow-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
            National Single Emergency Number
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold mt-1">
            Emergency Helpline: 112
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-0.5">
            Single toll-free dispatch for Police, Fire, Ambulance, and Marine emergency across all 14 districts in Kerala.
          </p>
        </div>
        <a
          href="tel:112"
          className="px-6 py-3 bg-white text-secondary hover:bg-surface-container-low rounded-xl font-headline text-base font-extrabold flex items-center gap-2 shadow-lg active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[24px]">call</span>
          <span>DIAL 112 NOW</span>
        </a>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EMERGENCY_CONTACTS.map((contact) => (
          <div
            key={contact.id}
            className="bg-white dark:bg-command-card rounded-2xl p-5 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-command-subtle">
                  {contact.category}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <h3 className="font-headline text-base font-bold text-on-surface dark:text-white leading-tight">
                {contact.name}
              </h3>
              <p className="text-xs font-semibold text-secondary dark:text-secondary-fixed mt-0.5">
                {contact.nameMl}
              </p>
              <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1.5 leading-relaxed">
                {contact.description}
              </p>
            </div>

            <div className="pt-3 border-t border-surface-container dark:border-command-border flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-command-subtle block">
                  Direct Line
                </span>
                <span className="font-mono text-base font-extrabold text-secondary dark:text-secondary-fixed">
                  {contact.phone}
                </span>
              </div>
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="px-4 py-2 bg-primary-container hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>Call Now</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
