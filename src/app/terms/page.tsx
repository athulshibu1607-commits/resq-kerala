'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
      <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-10 shadow-sm border border-surface-container-high dark:border-command-border">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold mb-3">
          <span className="material-symbols-outlined text-[16px]">gavel</span>
          <span>Terms of Use &amp; Operational Disclaimers · വ്യവസ്ഥകൾ</span>
        </div>
        <h1 className="font-headline text-2xl sm:text-4xl font-extrabold text-on-surface dark:text-white">
          Terms of Service &amp; Emergency Disclaimer
        </h1>
        <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1 mb-8">
          Last Updated: October 2026 · Academic Simulation &amp; Community Coordination Agreement
        </p>

        <div className="space-y-8 text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle leading-relaxed">
          <section className="p-4 rounded-2xl bg-secondary/10 dark:bg-secondary/20 border border-secondary/30">
            <h2 className="font-headline text-base font-bold text-secondary dark:text-secondary-fixed mb-1.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <span>Critical Emergency Notice</span>
            </h2>
            <p className="text-xs text-on-surface dark:text-white">
              RESQ KERALA provides supplementary coordination tools for civic volunteers, relief camp leads, and affected residents. <strong>This web platform does not replace official government emergency voice helplines</strong>. In an active, life-threatening situation, always attempt to call <strong>112</strong> (National Single Emergency) or <strong>1077</strong> (District Collectorate EOC) immediately.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white mb-2">
              1. User Responsibilities &amp; Truthful Reporting
            </h2>
            <p>
              Users agree to provide accurate, truthful descriptions of emergency conditions. Intentionally submitting false distress reports, simulated coordinates during real crises, or hoax survivor counts places actual human lives at risk and is punishable under Section 54 of the Disaster Management Act, 2005.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white mb-2">
              2. Offline SOS &amp; Synchronization Limitations
            </h2>
            <p>
              When network connectivity is unavailable, the application stores distress drafts locally on the user&apos;s device (IndexedDB). Users acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Offline drafts have <strong>not</strong> reached rescue dispatchers until the device reconnects to a data network and the server acknowledges transmission.</li>
              <li>Clearing browser storage or uninstalling the PWA will delete unsynced drafts.</li>
              <li>Emergency SMS dispatch (<code>112 ERSS</code>) should be used whenever broadband data fails.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white mb-2">
              3. Volunteer Roles &amp; Operational Safety
            </h2>
            <p>
              Volunteers operate on a good-faith humanitarian basis. Rescue boat leads and off-road drivers must obey instructions issued by the Indian Navy, NDRF commanders, and District Collectors. Under no circumstances should unverified volunteers navigate submerged spillway channels without appropriate lifejackets and authorized deployment orders.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-container dark:border-command-border flex items-center justify-between">
          <Link href="/privacy" className="text-secondary dark:text-secondary-fixed text-xs font-bold hover:underline">
            &larr; View Privacy Notice
          </Link>
          <Link href="/" className="text-xs text-on-surface-variant dark:text-command-subtle hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
