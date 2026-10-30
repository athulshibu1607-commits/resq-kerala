'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { KERALA_DISTRICTS } from '@/lib/data';
import { IncidentCategory, IncidentSeverity } from '@/lib/types';

export default function ReportIncidentPage() {
  const router = useRouter();
  const { user, selectedDistrict, dispatchSOS } = useApp();

  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState(selectedDistrict);
  const [panchayat, setPanchayat] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('flood');
  const [severity, setSeverity] = useState<IncidentSeverity>('high');
  const [peopleAffected, setPeopleAffected] = useState(2);
  const [contactName, setContactName] = useState(user.name);
  const [contactPhone, setContactPhone] = useState(user.phone);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const categories: { id: IncidentCategory; label: string; icon: string }[] = [
    { id: 'flood', label: 'Flood / Water Inundation', icon: 'tsunami' },
    { id: 'boat_rescue', label: 'Rooftop Water Rescue Needed', icon: 'sailing' },
    { id: 'landslide', label: 'Landslide / Sludge Debris', icon: 'landslide' },
    { id: 'medical', label: 'Medical Emergency / Oxygen / Insulin', icon: 'medical_services' },
    { id: 'food_water', label: 'Food Rations & Baby Milk Exhausted', icon: 'water_bottle' },
    { id: 'structural', label: 'Structural Wall / Tree Fall Collapse', icon: 'home_repair_service' },
  ];

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatchSOS({
        title: title || `${category.replace('_', ' ').toUpperCase()} in ${district}`,
        titleMl: 'പുതിയ വിവര ശേഖരണം രജിസ്റ്റർ ചെയ്തു',
        district,
        panchayat: panchayat || 'Local Ward',
        locationDescription: locationDescription || 'Detailed GPS Landmark',
        category,
        severity,
        peopleAffected,
        contactName,
        contactPhone,
        notes,
        photoUrl: photoPreview || undefined,
        lat: 10.1076,
        lng: 76.3516,
      });

      setIsSubmitting(false);
      router.push('/citizen/requests');
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high dark:bg-command-card text-on-surface-variant dark:text-command-subtle text-xs font-bold mb-2">
          <span className="material-symbols-outlined text-[16px] text-secondary">report</span>
          <span>Public Incident & Distress Intake · ദുരന്ത വിവരം അറിയിക്കുക</span>
        </div>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white">
          Report Hazard, Stranded Citizens or Missing Person
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-1">
          Directly synchronizes with District Disaster Management Authority (DDMA) triage console.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-command-card rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col gap-5">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-2">
            Incident Category <span className="text-secondary">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all border ${
                  category === cat.id
                    ? 'bg-secondary-container text-white border-secondary font-bold shadow-xs'
                    : 'bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white border-transparent hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-2">
            Urgency / Severity Level <span className="text-secondary">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['critical', 'high', 'medium'] as IncidentSeverity[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSeverity(lvl)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  severity === lvl
                    ? lvl === 'critical'
                      ? 'bg-red-600 text-white border-red-700 shadow-xs'
                      : lvl === 'high'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white border-transparent'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
            Brief Summary / Title <span className="text-secondary">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="E.g., 4 elderly citizens stranded in Aluva Riverbank 2-storey house"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </div>

        {/* District and Panchayat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
              District <span className="text-secondary">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none"
            >
              {KERALA_DISTRICTS.filter((d) => d !== 'All Kerala').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
              Panchayat / Municipality / Taluk
            </label>
            <input
              type="text"
              placeholder="E.g., Aluva Municipality / Meppadi"
              value={panchayat}
              onChange={(e) => setPanchayat(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        </div>

        {/* Location Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
            Exact Location Landmark & Directions <span className="text-secondary">*</span>
          </label>
          <textarea
            rows={2}
            required
            placeholder="House name, near school/bridge, floor level, landmarks visible from air/boat..."
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary resize-none"
          />
        </div>

        {/* People Count and Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
              People Trapped
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={peopleAffected}
              onChange={(e) => setPeopleAffected(parseInt(e.target.value) || 1)}
              className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
              Contact Name <span className="text-secondary">*</span>
            </label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
              Contact Phone <span className="text-secondary">*</span>
            </label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-surface-container-high dark:border-command-border focus:outline-none"
            />
          </div>
        </div>

        {/* Photo Upload Attachment */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
            Attach Incident or Missing Person Photo
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2.5 bg-surface-container-low dark:bg-command-navy hover:bg-surface-container rounded-xl text-xs font-semibold text-on-surface dark:text-white flex items-center gap-2 border border-surface-container-high dark:border-command-border">
              <span className="material-symbols-outlined text-[18px] text-secondary">add_a_photo</span>
              <span>{photoPreview ? 'Change Photo' : 'Upload Image'}</span>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
            {photoPreview && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Photo ready for upload
              </span>
            )}
          </div>
          {photoPreview && (
            <div className="relative w-40 h-28 rounded-xl overflow-hidden mt-3 border border-secondary/30">
              <img src={photoPreview} alt="Upload preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-surface-container dark:border-command-border">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-secondary hover:bg-red-700 text-white rounded-xl font-headline text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            <span>{isSubmitting ? 'Registering with State EOC...' : 'Submit Incident to Rescue Network'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
