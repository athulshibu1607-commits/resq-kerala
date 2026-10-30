'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { KERALA_DISTRICTS } from '@/lib/data';

export default function SettingsPage() {
  const router = useRouter();
  const { user, switchRole, incidents } = useApp();

  // Volunteer Application Form State
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [skills, setSkills] = useState('');
  const [volunteerDistrict, setVolunteerDistrict] = useState(user.district);
  const [vehicle, setVehicle] = useState('Motorized Country Boat / Dinghy');
  const [appSubmitted, setAppSubmitted] = useState(false);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleApplyVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    setAppSubmitted(true);
    setTimeout(() => {
      setShowVolunteerModal(false);
      setAppSubmitted(false);
      alert('Your Volunteer Application has been submitted to District Disaster Control. An EOC officer will verify your credentials.');
    }, 1200);
  };

  const handleExportData = () => {
    const userReports = incidents.filter((i) => i.contactName === user.name || i.contactPhone === user.phone);
    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      user: {
        name: user.name,
        role: user.role,
        district: user.district,
        phone: user.phone,
      },
      reportsSubmitted: userReports,
      disclaimer: 'Official electronic copy of disaster incident submissions.',
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resq-kerala-data-${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account removal.');
      return;
    }
    alert('Account removal request scheduled. You have been safely signed out.');
    switchRole('citizen');
    router.push('/login');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-28">
      <div className="mb-6">
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white">
          Account &amp; Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-0.5">
          ക്രമീകരണങ്ങൾ · Manage permissions, volunteer applications, and personal data rights
        </p>
      </div>

      <div className="space-y-6">
        {/* Volunteer Application Section */}
        <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-container-high dark:border-command-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">handshake</span>
                <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white">
                  Disaster Relief Volunteer Status
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1 leading-relaxed">
                Registered citizens can apply for verified responder credentials. Requires boat ownership, offroad 4x4 capability, first-aid training, or HAM radio proficiency.
              </p>
              <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Current Role: {user.role.toUpperCase()}
              </div>
            </div>

            <button
              onClick={() => setShowVolunteerModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
            >
              Apply as Volunteer
            </button>
          </div>
        </div>

        {/* Data Rights & Privacy Actions */}
        <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-container-high dark:border-command-border">
          <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary">database</span>
            <span>Personal Data Rights &amp; Export</span>
          </h3>
          <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed mb-4">
            Under Indian Digital Personal Data Protection standards, you have the right to obtain an electronic machine-readable copy of all your submitted incident reports, GPS breadcrumbs, and profile records.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface dark:text-white rounded-xl text-xs font-bold border border-surface-container-high dark:border-command-border flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export My Data (JSON)</span>
            </button>

            <Link
              href="/privacy"
              className="px-4 py-2.5 bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface dark:text-white rounded-xl text-xs font-bold border border-surface-container-high dark:border-command-border flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">policy</span>
              <span>Review Privacy Notice</span>
            </Link>
          </div>
        </div>

        {/* PWA & Mobile Installation Settings */}
        <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-container-high dark:border-command-border">
          <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary">install_mobile</span>
            <span>Mobile App &amp; Offline Storage</span>
          </h3>
          <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed mb-4">
            Install the progressive web app experience to ensure full offline cache and fast home-screen access during flood alerts.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/install"
              className="px-4 py-2.5 bg-primary-container text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <span>Installation Instructions &amp; QR</span>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('resq_install_banner_dismissed_until');
                alert('Install banner preference reset. It will appear on your next visit.');
              }}
              className="px-4 py-2.5 bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface dark:text-white rounded-xl text-xs font-bold border border-surface-container-high dark:border-command-border transition-colors"
            >
              Reset Install Banner Prompt
            </button>
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="bg-red-50 dark:bg-red-950/20 rounded-3xl p-6 sm:p-8 border border-red-200 dark:border-red-900/40">
          <h3 className="font-headline text-base sm:text-lg font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">delete_forever</span>
            <span>Account Deletion Request</span>
          </h3>
          <p className="text-xs text-red-900/80 dark:text-red-300/80 leading-relaxed mb-4">
            Permanently purges your login profile from our database. Active emergency rescue dispatches in progress will retain an anonymized incident log for official DDMA disaster audit obligations.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Request Account Deletion
          </button>
        </div>
      </div>

      {/* Volunteer Application Modal */}
      {showVolunteerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-command-card max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-surface-container-high dark:border-command-border flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                Volunteer Onboarding
              </span>
              <button
                onClick={() => setShowVolunteerModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <h3 className="font-headline text-xl font-bold text-on-surface dark:text-white">
              Apply for Volunteer Responder Credential
            </h3>

            <form onSubmit={handleApplyVolunteer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase text-on-surface-variant dark:text-command-subtle mb-1">
                  Skills &amp; Qualifications
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., CPR Certified, Trawler Boat Captain, HAM Radio, First Aid"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-3.5 py-2.5 rounded-xl border border-surface-container-high dark:border-command-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-on-surface-variant dark:text-command-subtle mb-1">
                  Operational Equipment / Vehicle
                </label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-3.5 py-2.5 rounded-xl border border-surface-container-high dark:border-command-border focus:outline-none"
                >
                  <option value="Motorized Country Boat / Dinghy">Motorized Country Boat / Dinghy</option>
                  <option value="Coastal Deep-Sea Trawler">Coastal Deep-Sea Trawler</option>
                  <option value="4x4 Offroad Rescue Jeep">4x4 Offroad Rescue Jeep</option>
                  <option value="Heavy Excavator / JCB">Heavy Excavator / JCB</option>
                  <option value="Medical First-Aid Field Clinic">Medical First-Aid Field Clinic</option>
                  <option value="Foot Patrol / Supply Logistics">Foot Patrol / Supply Logistics</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-on-surface-variant dark:text-command-subtle mb-1">
                  Primary Service District
                </label>
                <select
                  value={volunteerDistrict}
                  onChange={(e) => setVolunteerDistrict(e.target.value)}
                  className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-3.5 py-2.5 rounded-xl border border-surface-container-high dark:border-command-border focus:outline-none"
                >
                  {KERALA_DISTRICTS.filter((d) => d !== 'All Kerala').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={appSubmitted}
                  className="w-full py-3 bg-secondary hover:bg-red-700 text-white rounded-xl font-headline text-xs font-bold transition-colors"
                >
                  {appSubmitted ? 'Submitting to EOC...' : 'Submit Application to District EOC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-command-card max-w-md w-full rounded-3xl p-6 shadow-2xl border border-red-300 dark:border-red-900 flex flex-col gap-4 animate-in zoom-in-95">
            <h3 className="font-headline text-lg font-bold text-red-600 dark:text-red-400">
              Confirm Permanent Account Deletion
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
              This action cannot be undone. Type <strong>DELETE</strong> below to confirm.
            </p>
            <input
              type="text"
              placeholder="Type DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-3.5 py-2 rounded-xl text-xs border border-surface-container-high dark:border-command-border focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 bg-surface-container dark:bg-command-navy text-on-surface dark:text-white rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
