'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/store';
import { KERALA_HISTORICAL_STATS } from '@/lib/data';
import HydroGauge from '@/components/HydroGauge';
import Footer from '@/components/Footer';
import InstallAppButton from '@/components/InstallAppButton';

export default function HomePage() {
  const { hydroStations, incidents, camps, language } = useApp();
  const periyarStation = hydroStations[0];

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Simulation Banner Notice (Direct from Stitch Screen 1) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-2 mb-4">
        <div className="w-full bg-error-container text-on-error-container rounded-xl p-3 sm:p-4 flex items-center gap-3 shadow-xs border border-error/20">
          <span className="material-symbols-outlined text-error text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            science
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-error">
              Simulation Portal — Academic Hackathon Prototype Only
            </p>
            <p className="text-xs opacity-90 truncate">
              അക്കാദമിക് പരീക്ഷണ പതിപ്പ് · അടിയന്തര ഘട്ടങ്ങളിൽ 112 / 1077 വിളിക്കുക (Not an official replacement for Emergency Services)
            </p>
          </div>
          <Link
            href="/citizen/sos"
            className="hidden sm:inline-flex px-3 py-1 bg-error text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shrink-0"
          >
            Simulate SOS
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading, Malayalam descriptors, SOS Callout */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high dark:bg-command-card text-on-surface-variant dark:text-command-subtle border border-surface-container-highest dark:border-command-border w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-secondary dark:text-secondary-fixed">
                RESQ KERALA CORE
              </span>
              <span className="text-xs">·</span>
              <span className="text-xs font-semibold">
                {language === 'ml' ? 'കേരള ദുരന്ത പ്രതികരണ ശൃംഖല' : 'State Disaster Response Mesh'}
              </span>
            </div>

            {/* Main Headline (Direct Stitch Brand Identity) */}
            <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-extrabold text-on-surface dark:text-white tracking-tight leading-tight">
              One Alert. One Network.{' '}
              <span className="text-secondary dark:text-secondary-fixed block sm:inline">
                Many Lives Saved.
              </span>
            </h1>

            {/* Bilingual Subtitle */}
            <p className="text-base sm:text-xl text-on-surface-variant dark:text-command-subtle font-medium max-w-2xl leading-relaxed">
              Unified command infrastructure for flash flood rescues, landslide evacuations, hydro-telemetry monitoring, and verified relief camp staging across Kerala.
            </p>
            <p className="text-sm font-semibold text-secondary dark:text-secondary-fixed">
              അടിയന്തര ദുരന്ത നിവാരണ പോർട്ടൽ - കേരളം
            </p>

            {/* Immediate SOS Trigger Box (From Stitch Screen 1) */}
            <div className="mt-2 w-full bg-secondary-container text-on-secondary-container rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-white">
                    അടിയന്തിര ഘട്ടം · Rapid Life Safety Dispatch
                  </span>
                </div>
                <h3 className="font-headline text-xl sm:text-2xl font-bold text-white leading-tight">
                  In immediate danger from floodwaters or landslides?
                </h3>
                <p className="text-xs sm:text-sm text-white/95">
                  Skip standard sign-in and trigger instant geo-tagged satellite dispatch with one tap.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href="/citizen/sos"
                    className="flex-1 bg-secondary text-white py-3 px-5 rounded-xl font-headline text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-red-700 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      fmd_bad
                    </span>
                    <span>TAP FOR 1-TAP EMERGENCY SOS</span>
                    <span className="text-xs opacity-90">(രക്ഷാ ദൗത്യം)</span>
                  </Link>

                  <Link
                    href="/citizen"
                    className="sm:w-auto bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-headline text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Citizen Dashboard</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </Link>
                </div>
              </div>

              <div className="absolute -right-4 -bottom-6 opacity-10 pointer-events-none text-white">
                <span className="material-symbols-outlined text-[160px]">emergency</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual, Telemetry Card & Quick Stats */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Visual Hero Card with Stitch Asset */}
            <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden shadow-xl border border-surface-container-high dark:border-command-border">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_zfFhFzm_i4Am3FgjDpCzs56mhHqv7xo0_z51XPYfhYPIVbzpEpS8X19dcNFN3P__X-dqPyOwaNKu4-b8lvOu8WwDfSU5WS2CBhcdExzd2TTjZRhHQOZJkhA_-WLInusrNrtWanhyUVxEC187ewcA7YHtYKFq4qXrDEVPsxVxsP6DsTD1FUfeQi620kXWIfMwpHs6fiGHHejMgciQsFhdaADMVAS2hnfUIcN6GA"
                alt="Kerala disaster response center volunteers"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-container/95 via-primary-container/40 to-transparent flex items-end p-4 sm:p-5">
                <div className="flex items-center gap-2 text-white">
                  <span className="material-symbols-outlined text-emerald-400 text-[20px]">
                    verified_user
                  </span>
                  <span className="text-xs sm:text-sm font-medium leading-snug">
                    Real-time Idukki, Wayanad & Coastal Alert Mesh Sync Active
                  </span>
                </div>
              </div>
            </div>

            {/* Live Hydro-telemetry Snapshot */}
            {periyarStation && <HydroGauge station={periyarStation} />}
          </div>
        </div>
      </section>

      {/* Live Statistics / Telemetry Banner */}
      <section className="w-full bg-white dark:bg-command-card border-y border-surface-container-high dark:border-command-border py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-surface-container-low dark:bg-command-navy p-4 rounded-xl border border-surface-container-high dark:border-command-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-on-surface-variant dark:text-command-subtle uppercase">
                  Active SOS Incidents
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
              </div>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-secondary dark:text-secondary-fixed">
                {incidents.filter((i) => i.status !== 'resolved').length}
              </p>
              <p className="text-[11px] text-on-surface-variant dark:text-command-subtle mt-0.5">
                Live rescue missions in progress
              </p>
            </div>

            <div className="bg-surface-container-low dark:bg-command-navy p-4 rounded-xl border border-surface-container-high dark:border-command-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-on-surface-variant dark:text-command-subtle uppercase">
                  Open Safe Camps
                </span>
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">
                  holiday_village
                </span>
              </div>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                142 Open
              </p>
              <p className="text-[11px] text-on-surface-variant dark:text-command-subtle mt-0.5">
                513 available beds ready
              </p>
            </div>

            <div className="bg-surface-container-low dark:bg-command-navy p-4 rounded-xl border border-surface-container-high dark:border-command-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-on-surface-variant dark:text-command-subtle uppercase">
                  Rescue Boats Mobilized
                </span>
                <span className="material-symbols-outlined text-blue-500 text-[18px]">
                  sailing
                </span>
              </div>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white">
                118 Vessels
              </p>
              <p className="text-[11px] text-on-surface-variant dark:text-command-subtle mt-0.5">
                Kerala Fishermen Coastal Army
              </p>
            </div>

            <div className="bg-surface-container-low dark:bg-command-navy p-4 rounded-xl border border-surface-container-high dark:border-command-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-on-surface-variant dark:text-command-subtle uppercase">
                  Avg. Response Time
                </span>
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  timer
                </span>
              </div>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white">
                8.4 mins
              </p>
              <p className="text-[11px] text-on-surface-variant dark:text-command-subtle mt-0.5">
                From satellite pin to boat triage
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Workflow Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-secondary dark:text-secondary-fixed">
            Mission-Critical Architecture
          </span>
          <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-on-surface dark:text-white mt-1">
            How RESQ KERALA Operates Under Duress
          </h2>
          <p className="text-sm text-on-surface-variant dark:text-command-subtle mt-2">
            Engineered specifically for low-light, wet touchscreen ergonomics, degraded 2G cell tower connectivity, and extreme weather.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Instant SOS & Offline Queue',
              titleMl: 'അടിയന്തര രക്ഷാസന്ദേശം',
              desc: 'Press-and-hold for 3 seconds transmits GPS coordinates (±3m) and victims count. If network drops, automatically queues in local IndexedDB storage.',
              icon: 'crisis_alert',
              color: 'text-secondary',
            },
            {
              step: '02',
              title: 'AI Priority Triage',
              titleMl: 'മുൻഗണനാ നിർണ്ണയം',
              desc: 'Automated assistant models rank distress calls by water level rise rate, vulnerable citizens (infants, elderly), and detect duplicate reports.',
              icon: 'auto_graph',
              color: 'text-amber-500',
            },
            {
              step: '03',
              title: 'Tactical Coastal & NDRF Dispatch',
              titleMl: 'രക്ഷാ ദൗത്യം',
              desc: 'Routes tasks directly to nearby country boats, off-road 4x4 squads, Fire Force, and Indian Navy units with turn-by-turn offline safe routes.',
              icon: 'sailing',
              color: 'text-blue-500',
            },
            {
              step: '04',
              title: 'Verified Relief Camp Staging',
              titleMl: 'ദുരിതാശ്വാസ ക്യാമ്പ്',
              desc: 'Evacuees are received at verified shelters equipped with power generators, infant formula, chlorine water filtration, and medical trauma teams.',
              icon: 'shield_with_heart',
              color: 'text-emerald-500',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white dark:bg-command-card rounded-2xl p-6 shadow-sm border border-surface-container-high dark:border-command-border relative flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="font-headline text-2xl font-extrabold text-on-surface-variant/40 dark:text-command-subtle/40">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-surface-container dark:bg-command-navy flex items-center justify-center">
                  <span className={`material-symbols-outlined text-[24px] ${item.color}`}>
                    {item.icon}
                  </span>
                </div>
              </div>
              <h3 className="font-headline text-base font-bold text-on-surface dark:text-white leading-tight">
                {item.title}
              </h3>
              <p className="text-[11px] font-semibold text-secondary dark:text-secondary-fixed -mt-1">
                {item.titleMl}
              </p>
              <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Disaster Learnings Section */}
      <section className="w-full bg-surface-container-low dark:bg-command-navy/50 py-12 border-t border-surface-container-high dark:border-command-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-secondary dark:text-secondary-fixed">
                Historical Context & Preparedness
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white mt-1">
                Lessons from Past Calamities in Kerala
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-command-subtle max-w-md">
              Data and community response patterns from 2018 to 2024 inform every feature in the RESQ KERALA architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KERALA_HISTORICAL_STATS.map((stat) => (
              <div
                key={stat.year}
                className="bg-white dark:bg-command-card rounded-2xl p-6 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
                    Year {stat.year}
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant dark:text-command-subtle">
                    {stat.eventMl}
                  </span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface dark:text-white">
                  {stat.event}
                </h3>
                <div className="grid grid-cols-2 gap-2 my-1 py-2 border-y border-surface-container dark:border-command-border">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-command-subtle">
                      People Rescued
                    </span>
                    <p className="font-headline text-base font-extrabold text-secondary">
                      {stat.peopleRescued}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-command-subtle">
                      Camps Activated
                    </span>
                    <p className="font-headline text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {stat.campsActivated}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant dark:text-command-subtle italic">
                  &ldquo;{stat.keyLesson}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Call to Action */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full bg-primary-container text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold mb-3">
              <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
              <span>സന്നദ്ധ പ്രവർത്തനം · Fishermen Coastal Army & Volunteers</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-4xl font-extrabold tracking-tight">
              Own a Boat, 4x4 Jeep or Medical Skill? Join the Response Network.
            </h2>
            <p className="text-sm sm:text-base text-white/80 mt-2">
              Kerala&apos;s greatest strength in every monsoon crisis has been community solidarity. Register your rescue vehicle, boat, or first-aid capability for automated dispatch.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/volunteer"
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-headline text-sm font-bold px-6 py-3 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                Enter Volunteer Portal
              </Link>
              <Link
                href="/login"
                className="bg-white/10 hover:bg-white/20 text-white font-headline text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                Responder Sign In
              </Link>
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-36 h-36 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[72px] text-emerald-400">
              sailing
            </span>
          </div>

          <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-secondary/20 blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* Dedicated App Installation Section (PWA) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-10 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-5 max-w-2xl">
            <div className="w-16 h-16 rounded-2xl bg-primary-container p-2 flex items-center justify-center shrink-0 border border-slate-700 shadow-md">
              <img src="/icons/icon.svg" alt="RESQ KERALA Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-secondary dark:text-secondary-fixed">
                Installable Progressive Web App (PWA)
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white mt-1">
                RESQ KERALA, Ready When You Need It
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-2 leading-relaxed">
                Install the app experience for quick access to emergency reporting, request tracking, and important coordination updates. Works offline during power outages and cell drops.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-5">
                <InstallAppButton variant="secondary" className="py-3 px-5 text-xs font-bold" />
                <Link
                  href="/download"
                  className="px-4 py-2.5 rounded-xl bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface dark:text-white text-xs font-bold border border-surface-container-high dark:border-command-border transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                  <span>Dedicated Download Page &amp; QR</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container-high dark:border-command-border text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Supported Platforms
            </span>
            <div className="flex items-center gap-4 text-xs font-bold text-on-surface dark:text-white my-1">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">android</span> Android</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">phone_iphone</span> iPhone</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">laptop</span> Desktop</span>
            </div>
            <span className="text-[10px] text-slate-400">Zero App Store download delay</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
