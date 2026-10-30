'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Incident } from '@/lib/types';
import {
  saveOfflineDraft,
  getOfflineDrafts,
  deleteOfflineDraft,
  updateDraftStatus,
  OfflineSOSDraft,
} from '@/lib/offline/indexeddb';

export default function SOSDispatchPage() {
  const { user, selectedDistrict, dispatchSOS, sirenActive, toggleSiren, isOnline } = useApp();
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineSOSDraft[]>([]);
  const [lastOfflineDraft, setLastOfflineDraft] = useState<OfflineSOSDraft | null>(null);
  const [isOfflineModal, setIsOfflineModal] = useState<boolean>(false);
  const [syncingKey, setSyncingKey] = useState<string | null>(null);

  const loadDrafts = async () => {
    try {
      const drafts = await getOfflineDrafts();
      setOfflineDrafts(drafts);
    } catch (e) {
      // IndexedDB fallback
    }
  };

  useEffect(() => {
    loadDrafts();
  }, [isOnline]);

  // SOS Hold state
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [instructionText, setInstructionText] = useState('Hold for 3s to Transmit');
  const holdIntervalRef = useRef<any>(null);

  // Form State
  const [selectedSituations, setSelectedSituations] = useState<string[]>([
    'Injured / Elderly / Infant with Us',
  ]);
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [notes, setNotes] = useState('2 senior citizens, need boat evacuation, floor level 2');
  const [gpsCoords] = useState('10.1076° N, 76.3516° E');
  const [locationName] = useState('Near Aluva Manappuram Bridge, Ernakulam District');
  const [copiedGps, setCopiedGps] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  // Submission result / confirmation modal
  const [submittedIncident, setSubmittedIncident] = useState<Incident | null>(null);

  const situations = [
    { id: 'rooftop', label: 'Trapped on Rooftop / Upper Floor', icon: 'roofing' },
    { id: 'water_surge', label: 'Rising Water Inside House (>4 ft)', icon: 'waves' },
    { id: 'vulnerable', label: 'Injured / Elderly / Infant with Us', icon: 'accessible' },
    { id: 'landslide', label: 'Landslide Debris Blocked Exit', icon: 'landslide' },
    { id: 'insulin', label: 'Food / Insulin Running Out', icon: 'medication' },
    { id: 'medical_trauma', label: 'Severe Bleeding / Trauma', icon: 'emergency' },
  ];

  const toggleSituation = (label: string) => {
    setSelectedSituations((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleCopyGPS = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${gpsCoords} (${locationName})`).catch(() => {});
    }
    setCopiedGps(true);
    setTimeout(() => setCopiedGps(false), 2000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync a single offline draft when online
  const handleSyncDraft = async (draft: OfflineSOSDraft) => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please connect to internet or cellular data.');
      return;
    }
    setSyncingKey(draft.idempotencyKey);
    try {
      await updateDraftStatus(draft.idempotencyKey, 'syncing');
      const inc = await dispatchSOS(draft.payload);
      await deleteOfflineDraft(draft.idempotencyKey);
      await loadDrafts();
      setSubmittedIncident(inc);
      setIsOfflineModal(false);
    } catch (err: any) {
      await updateDraftStatus(draft.idempotencyKey, 'failed', err?.message || 'Sync failed');
      await loadDrafts();
      alert('Sync failed: Could not reach operations center. We will retry automatically.');
    } finally {
      setSyncingKey(null);
    }
  };

  const handleDeleteDraft = async (key: string) => {
    await deleteOfflineDraft(key);
    await loadDrafts();
  };

  // Trigger SOS dispatch
  const submitSOS = async (channel: 'live' | 'sms' = 'live') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }

    const payload = {
      title: `Critical SOS: ${selectedSituations[0] || 'Water Inundation'} (${peopleCount} People)`,
      titleMl: 'അടിയന്തര രക്ഷാസന്ദേശം പ്രക്ഷേപണം ചെയ്തു',
      district: selectedDistrict,
      panchayat: 'Aluva Municipality',
      locationDescription: locationName,
      lat: 10.1076,
      lng: 76.3516,
      category: 'boat_rescue' as const,
      severity: 'critical' as const,
      peopleAffected: peopleCount,
      specialNeeds: selectedSituations,
      notes,
      photoUrl: uploadedPhoto || undefined,
      contactName: user.name,
      contactPhone: user.phone,
    };

    if (!isOnline) {
      try {
        const draft = await saveOfflineDraft(payload);
        setLastOfflineDraft(draft);
        await loadDrafts();
        setIsOfflineModal(true);
      } catch (e) {
        alert('Could not save offline draft. Please dial 112 directly.');
      }
      return;
    }

    try {
      const inc = await dispatchSOS(payload);
      setSubmittedIncident(inc);
      setIsOfflineModal(false);
    } catch (e) {
      // Fallback to offline draft on network failure
      const draft = await saveOfflineDraft(payload);
      setLastOfflineDraft(draft);
      await loadDrafts();
      setIsOfflineModal(true);
    }
  };

  // 3s Press and hold logic matching Stitch Screen 5
  const startHolding = (e: React.MouseEvent | React.TouchEvent) => {
    setIsHolding(true);
    setInstructionText('Hold firmly... Transmitting');

    const stepInterval = 30;
    const totalTime = 3000;
    const stepIncrement = (stepInterval / totalTime) * 100;

    let currentProgress = 0;
    holdIntervalRef.current = setInterval(() => {
      currentProgress += stepIncrement;
      if (currentProgress >= 100) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        setHoldProgress(100);
        setIsHolding(false);
        setInstructionText('SOS Transmitted!');
        submitSOS('live');
        setTimeout(() => {
          setHoldProgress(0);
          setInstructionText('Hold for 3s to Transmit');
        }, 2500);
      } else {
        setHoldProgress(currentProgress);
      }
    }, stepInterval);
  };

  const endHolding = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
    setInstructionText('Hold for 3s to Transmit');
  };

  const totalCircumference = 289;
  const strokeOffset = totalCircumference - (holdProgress / 100) * totalCircumference;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Simulation Warning Banner (From Stitch) */}
      <div className="w-full bg-secondary text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-md mb-4">
        <span className="material-symbols-outlined shrink-0 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          warning
        </span>
        <p className="text-xs font-semibold leading-snug flex-1">
          SIMULATION ONLY: Academic hackathon prototype. In a real life emergency, dial <strong>112</strong> or <strong>1077</strong> immediately.
        </p>
      </div>

      {/* Mesh Status Strip (From Stitch) */}
      <div className="flex items-center justify-between bg-white dark:bg-command-card px-4 py-2.5 rounded-xl border border-surface-container-high dark:border-command-border mb-6 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
          </span>
          <span className="font-headline text-sm font-bold text-on-surface dark:text-white">
            അടിയന്തര രക്ഷാസന്ദേശം · SOS Dispatch
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-low dark:bg-command-navy px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant dark:text-command-subtle border border-surface-container-high dark:border-command-border">
          <span className="material-symbols-outlined text-[15px] text-emerald-500">cell_tower</span>
          <span>{isOnline ? 'Mesh Sync Online' : 'Offline Cache Mode'}</span>
        </div>
      </div>

      {/* Big 3-Second Hold SOS Interactive Button */}
      <div className="relative flex flex-col items-center justify-center py-6 sm:py-8 my-2">
        {/* Pulsing Aura Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-secondary/15 animate-ping"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full bg-secondary-container/20 animate-pulse"></div>
        </div>

        {/* Circular Button with Progress SVG */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-52 h-52 select-none touch-none">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="stroke-surface-container dark:stroke-command-border fill-none"
                cx="50"
                cy="50"
                r="46"
                strokeWidth="7"
              />
              <circle
                className="stroke-secondary fill-none transition-all duration-75"
                cx="50"
                cy="50"
                r="46"
                strokeWidth="7"
                strokeDasharray={totalCircumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
            </svg>

            <button
              onMouseDown={startHolding}
              onMouseUp={endHolding}
              onMouseLeave={endHolding}
              onTouchStart={startHolding}
              onTouchEnd={endHolding}
              onTouchCancel={endHolding}
              className="absolute inset-3 rounded-full bg-secondary hover:bg-red-700 active:scale-95 transition-transform flex flex-col items-center justify-center text-white shadow-2xl focus:outline-none cursor-pointer overflow-hidden group select-none"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/20 pointer-events-none"></div>
              <span
                className="material-symbols-outlined text-[48px] animate-bounce mb-1"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                emergency_heat
              </span>
              <span className="font-headline text-3xl font-black tracking-tight leading-none">
                SOS
              </span>
              <span className="text-xs text-white/90 font-bold mt-1">
                അടിയന്തിരം
              </span>
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-secondary dark:text-secondary-fixed font-headline text-xs sm:text-sm font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">touch_app</span>
              <span>{instructionText}</span>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-0.5">
              Dual-band rescue packet auto-broadcasts with high accuracy GPS
            </p>
          </div>
        </div>
      </div>

      {/* Auto-Detected Telemetry Card (Direct Stitch Screen 5) */}
      <div className="w-full bg-white dark:bg-command-card rounded-2xl p-5 mb-5 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">my_location</span>
            <span className="font-headline text-sm font-bold text-on-surface dark:text-white">
              Auto-Detected Telemetry
            </span>
          </div>
          <button
            onClick={handleCopyGPS}
            className="flex items-center gap-1 px-3 py-1 bg-surface-container dark:bg-command-navy rounded-lg text-xs font-semibold text-on-surface dark:text-white hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
            <span>{copiedGps ? 'Copied!' : 'Copy GPS'}</span>
          </button>
        </div>

        <div className="bg-surface-container-low dark:bg-command-navy p-3.5 rounded-xl flex flex-col gap-1 border border-surface-container-high dark:border-command-border">
          <div className="flex items-center justify-between text-xs text-on-surface-variant dark:text-command-subtle">
            <span>Live GPS Coordinates (WGS84)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">High Accuracy (±3m)</span>
          </div>
          <div className="font-mono text-base sm:text-lg font-bold text-on-surface dark:text-white">
            {gpsCoords}
          </div>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant dark:text-command-subtle mt-0.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">pin_drop</span>
            <span>{locationName}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="bg-surface-container-low dark:bg-command-navy p-3 rounded-xl flex items-center gap-2.5 border border-surface-container-high dark:border-command-border">
            <div className="w-9 h-9 rounded-lg bg-surface-container dark:bg-command-card flex items-center justify-center text-on-surface dark:text-white">
              <span className="material-symbols-outlined text-[20px]">battery_charging_80</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-command-subtle">
                Battery Level
              </span>
              <p className="font-headline text-xs font-bold text-on-surface dark:text-white">84% (Good)</p>
            </div>
          </div>

          <div className="bg-surface-container-low dark:bg-command-navy p-3 rounded-xl flex items-center gap-2.5 border border-surface-container-high dark:border-command-border">
            <div className="w-9 h-9 rounded-lg bg-surface-container dark:bg-command-card flex items-center justify-center text-on-surface dark:text-white">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-command-subtle">
                Network Carrier
              </span>
              <p className="font-headline text-xs font-bold text-on-surface dark:text-white">Cellular + Mesh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Situation / സാഹചര്യം (From Stitch Screen 5) */}
      <div className="w-full bg-white dark:bg-command-card rounded-2xl p-5 mb-5 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="font-headline text-sm font-bold text-on-surface dark:text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-secondary">crisis_alert</span>
            <span>Emergency Situation / സാഹചര്യം</span>
          </label>
          <span className="text-xs text-on-surface-variant dark:text-command-subtle">
            Select all that apply
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {situations.map((sit) => {
            const isSelected = selectedSituations.includes(sit.label);
            return (
              <button
                key={sit.id}
                type="button"
                onClick={() => toggleSituation(sit.label)}
                className={`p-3 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all border active:scale-98 ${
                  isSelected
                    ? 'bg-secondary-container text-white border-secondary font-bold shadow-xs'
                    : 'bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white border-transparent hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{sit.icon}</span>
                <span className="flex-1">{sit.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stranded Individuals Counter (From Stitch Screen 5) */}
      <div className="w-full bg-white dark:bg-command-card rounded-2xl p-5 mb-5 shadow-sm border border-surface-container-high dark:border-command-border flex items-center justify-between">
        <div>
          <span className="font-headline text-sm font-bold text-on-surface dark:text-white block">
            Stranded Individuals
          </span>
          <span className="text-xs text-on-surface-variant dark:text-command-subtle">
            ആളുകളുടെ എണ്ണം (മുതിർന്നവർ / കുട്ടികൾ)
          </span>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-low dark:bg-command-navy px-3 py-1.5 rounded-xl border border-surface-container-high dark:border-command-border">
          <button
            onClick={() => peopleCount > 1 && setPeopleCount(peopleCount - 1)}
            aria-label="Decrease persons count"
            className="w-8 h-8 rounded-lg bg-surface-container dark:bg-command-card text-on-surface dark:text-white flex items-center justify-center font-bold active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <div className="w-14 text-center">
            <span className="font-headline text-xl font-extrabold text-on-surface dark:text-white">
              {peopleCount}
            </span>
            <span className="text-[10px] text-on-surface-variant dark:text-command-subtle block">
              Persons
            </span>
          </div>
          <button
            onClick={() => setPeopleCount(peopleCount + 1)}
            aria-label="Increase persons count"
            className="w-8 h-8 rounded-lg bg-primary dark:bg-white text-white dark:text-black flex items-center justify-center font-bold active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>
      </div>

      {/* Additional Notes & Photo Upload */}
      <div className="w-full bg-white dark:bg-command-card rounded-2xl p-5 mb-5 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col gap-3">
        <label className="font-headline text-sm font-bold text-on-surface dark:text-white flex items-center justify-between">
          <span>Special Medical Needs or Landmarks (കുറിപ്പുകൾ)</span>
          <span className="text-xs text-on-surface-variant dark:text-command-subtle font-normal">Optional</span>
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="E.g., 2 senior citizens, need oxygen cylinder, water level waist high..."
          className="w-full bg-surface-container-low dark:bg-command-navy rounded-xl p-3 text-xs sm:text-sm text-on-surface dark:text-white border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary resize-none"
        />

        {/* Photo Upload Attachment */}
        <div className="pt-2 border-t border-surface-container dark:border-command-border flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface dark:text-white block">
              Attach Flood / Inundation Photo
            </span>
            <span className="text-[11px] text-on-surface-variant dark:text-command-subtle">
              Helps boat crew assess roof height & water speed
            </span>
          </div>
          <label className="cursor-pointer px-3 py-1.5 bg-surface-container dark:bg-command-navy hover:bg-surface-container-high rounded-xl text-xs font-semibold text-on-surface dark:text-white flex items-center gap-1.5 border border-surface-container-high dark:border-command-border transition-colors">
            <span className="material-symbols-outlined text-[16px] text-secondary">photo_camera</span>
            <span>{uploadedPhoto ? 'Photo Attached' : 'Take Photo'}</span>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>

        {uploadedPhoto && (
          <div className="relative w-full h-32 rounded-xl overflow-hidden mt-2 border border-secondary/30">
            <img src={uploadedPhoto} alt="Disaster upload preview" className="w-full h-full object-cover" />
            <button
              onClick={() => setUploadedPhoto(null)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}
      </div>

      {/* Loud Audio Beacon / Whistle (Direct Stitch Audio Synthesizer) */}
      <div className="w-full bg-white dark:bg-command-card rounded-2xl p-5 mb-6 shadow-sm border border-surface-container-high dark:border-command-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              sirenActive
                ? 'bg-secondary-container text-white animate-pulse'
                : 'bg-surface-container dark:bg-command-navy text-on-surface dark:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">volume_up</span>
          </div>
          <div>
            <span className="font-headline text-sm font-bold text-on-surface dark:text-white block">
              Loud Audio Beacon / Whistle
            </span>
            <span className="text-xs text-on-surface-variant dark:text-command-subtle">
              Continuous pitch oscillator for acoustic night search
            </span>
          </div>
        </div>

        <button
          onClick={toggleSiren}
          className={`px-5 py-2.5 rounded-xl font-headline text-xs font-bold transition-all active:scale-95 shadow-xs ${
            sirenActive
              ? 'bg-secondary text-white ring-2 ring-red-400'
              : 'bg-surface-container dark:bg-command-navy text-on-surface dark:text-white hover:bg-surface-container-high'
          }`}
        >
          {sirenActive ? 'SIREN ON' : 'TEST SIREN'}
        </button>
      </div>

      {/* Offline Queue Section (Visible whenever there are pending drafts) */}
      {offlineDrafts.length > 0 && (
        <div className="w-full bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[26px] shrink-0 mt-0.5">
              cloud_off
            </span>
            <div className="flex-1">
              <h3 className="font-headline text-sm font-extrabold text-amber-900 dark:text-amber-200">
                Saved on this device — not yet delivered ({offlineDrafts.length})
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                The following distress reports are stored safely in local IndexedDB. <strong>They have not reached rescue teams or the EOC yet.</strong> They will auto-sync when connectivity returns, or you can force a retry below.
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-3">
            {offlineDrafts.map((draft) => (
              <div
                key={draft.idempotencyKey}
                className="bg-white dark:bg-command-card p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-secondary">
                      {draft.trackingCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        draft.status === 'syncing'
                          ? 'bg-blue-100 text-blue-700 animate-pulse'
                          : draft.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {draft.status === 'syncing'
                        ? 'Syncing to Server...'
                        : draft.status === 'failed'
                        ? 'Sync Failed - Ready to Retry'
                        : 'Saved Locally — Not Delivered'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface dark:text-white font-medium">
                    {draft.payload.title} · {draft.payload.peopleAffected} Stranded
                  </p>
                  <p className="text-[10px] text-on-surface-variant dark:text-command-subtle font-mono">
                    Idempotency: {draft.idempotencyKey.substring(0, 16)}... · Saved: {new Date(draft.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleSyncDraft(draft)}
                    disabled={syncingKey === draft.idempotencyKey}
                    className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-secondary hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">sync</span>
                    <span>{syncingKey === draft.idempotencyKey ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(draft.idempotencyKey)}
                    className="px-2.5 py-1.5 bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface-variant dark:text-command-subtle rounded-lg text-xs transition-colors"
                    title="Discard Draft"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => submitSOS('live')}
          className="w-full min-h-[56px] bg-secondary hover:bg-red-700 text-white rounded-2xl font-headline text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">send</span>
          <span>Transmit Immediate SOS with Live GPS (Simulation)</span>
        </button>

        <button
          onClick={() => submitSOS('sms')}
          className="w-full py-3.5 bg-primary-container hover:bg-black text-white rounded-2xl font-headline text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">sms</span>
          <span>Send Emergency SMS Broadcast (2G / No Internet)</span>
        </button>
      </div>

      {/* OFFLINE MODAL: Explicit "Saved on this device — not yet delivered" */}
      {isOfflineModal && lastOfflineDraft && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-command-card max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/70 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-mono text-xs font-bold">
                {lastOfflineDraft.trackingCode}
              </span>
            </div>

            <div>
              <h3 className="font-headline text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                Saved on this device — not yet delivered.
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1.5 leading-relaxed">
                Your distress report was validated and saved into local device storage (IndexedDB) with a unique idempotency key. <strong>It has NOT reached first responders or emergency services yet.</strong>
              </p>
            </div>

            {/* Critical Voice Alert Box */}
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-300 dark:border-red-900 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400">
                <span className="material-symbols-outlined text-[18px]">call</span>
                <span>CRITICAL TELEPHONE FALLBACK</span>
              </div>
              <p className="text-red-800 dark:text-red-300 leading-normal text-[11px]">
                RESQ KERALA PWA is not an alternative to emergency phone helplines. If cellular voice service is available, immediately dial <strong>112</strong> or State Disaster Control <strong>1077</strong>.
              </p>
            </div>

            {/* Offline Telemetry Summary */}
            <div className="bg-surface-container-low dark:bg-command-navy p-4 rounded-2xl border border-surface-container-high dark:border-command-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant dark:text-command-subtle">Delivery Status:</span>
                <span className="font-bold text-amber-600">Pending Network Connectivity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant dark:text-command-subtle">Idempotency Key:</span>
                <span className="font-mono text-[10px] text-on-surface dark:text-white truncate max-w-[200px]">
                  {lastOfflineDraft.idempotencyKey}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant dark:text-command-subtle">Stranded Count:</span>
                <span className="font-bold text-on-surface dark:text-white">{lastOfflineDraft.payload.peopleAffected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant dark:text-command-subtle">Saved GPS:</span>
                <span className="font-mono font-bold text-on-surface dark:text-white">{gpsCoords}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <a
                href={`sms:112?body=SOS%20RESQKERALA%20${lastOfflineDraft.trackingCode}%20${gpsCoords}%20PEOPLE:${lastOfflineDraft.payload.peopleAffected}`}
                className="flex-1 py-3 bg-secondary hover:bg-red-700 text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">sms</span>
                <span>Send Emergency SMS (112 ERSS)</span>
              </a>
              <button
                onClick={() => {
                  setIsOfflineModal(false);
                  setLastOfflineDraft(null);
                }}
                className="py-3 px-5 bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface dark:text-white rounded-xl text-xs font-bold transition-colors"
              >
                Keep in Queue & Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CONFIRMATION MODAL: (Only displayed after confirmed server acknowledgment) */}
      {submittedIncident && !isOfflineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-command-card max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-secondary/30 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-secondary text-white font-mono text-xs font-bold">
                {submittedIncident.trackingCode}
              </span>
            </div>

            <div>
              <h3 className="font-headline text-xl sm:text-2xl font-extrabold text-on-surface dark:text-white">
                Distress Dispatch Confirmed!
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1">
                Your emergency payload has been queued to {selectedDistrict} Collectorate Emergency Operations Centre (EOC) and Naval/Fishermen boat networks.
              </p>
            </div>

            {/* Telemetry Summary */}
            <div className="bg-surface-container-low dark:bg-command-navy p-4 rounded-2xl border border-surface-container-high dark:border-command-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant dark:text-command-subtle">Tracking Number:</span>
                <span className="font-mono font-bold text-secondary">{submittedIncident.trackingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant dark:text-command-subtle">People Stranded:</span>
                <span className="font-bold text-on-surface dark:text-white">{submittedIncident.peopleAffected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant dark:text-command-subtle">AI Priority Score:</span>
                <span className="font-bold text-red-600">{submittedIncident.aiPriorityScore} / 100 (Critical)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant dark:text-command-subtle">GPS Coordinates:</span>
                <span className="font-mono font-bold text-on-surface dark:text-white">{gpsCoords}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Link
                href="/citizen/requests"
                className="flex-1 py-3 bg-secondary hover:bg-red-700 text-white rounded-xl text-xs font-bold text-center transition-colors"
              >
                Track Live Rescue Status
              </Link>
              <button
                onClick={() => setSubmittedIncident(null)}
                className="py-3 px-5 bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface dark:text-white rounded-xl text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
