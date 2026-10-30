'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { KERALA_DISTRICTS } from '@/lib/data';

export default function ProfilePage() {
  const { user, setUser } = useApp();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [district, setDistrict] = useState(user.district);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      name,
      phone,
      district,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white">
          Responder Profile &amp; Identity
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-0.5">
          പ്രൊഫൈൽ വിവരങ്ങൾ · Your verified contact and location credentials
        </p>
      </div>

      {isSaved && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-500/30">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Profile credentials saved successfully.</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-container-high dark:border-command-border mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-surface-container dark:border-command-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-container text-white flex items-center justify-center font-headline text-2xl font-black shadow-md border border-slate-700">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-xl font-bold text-on-surface dark:text-white">
                  {user.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-0.5">
                {user.email || 'Citizen User'} · {user.district} District
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{user.activeBadge || 'Verified Resident'}</span>
              </div>
            </div>
          </div>

          <Link
            href="/settings"
            className="px-4 py-2 bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface dark:text-white text-xs font-bold rounded-xl border border-surface-container-high dark:border-command-border transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
            <span>Account Settings</span>
          </Link>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                Primary Contact Telephone
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
              Operating District
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-3.5 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none"
            >
              {KERALA_DISTRICTS.filter((d) => d !== 'All Kerala').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-secondary hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
