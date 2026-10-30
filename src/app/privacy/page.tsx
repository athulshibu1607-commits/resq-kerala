'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
      <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-10 shadow-sm border border-surface-container-high dark:border-command-border">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold mb-3">
          <span className="material-symbols-outlined text-[16px]">privacy_tip</span>
          <span>Data Protection &amp; Confidentiality Policy · സ്വകാര്യതാ നയം</span>
        </div>
        <h1 className="font-headline text-2xl sm:text-4xl font-extrabold text-on-surface dark:text-white">
          RESQ KERALA Privacy Notice
        </h1>
        <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1 mb-8">
          Last Updated: October 2026 · Compliant with Disaster Management Act (2005) &amp; Digital Personal Data Protection Norms
        </p>

        <div className="space-y-8 text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle leading-relaxed">
          <section>
            <h2 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white mb-2">
              1. Purpose of Life-Safety Data Processing
            </h2>
            <p>
              RESQ KERALA processes personal and location telemetry strictly for the legitimate use of humanitarian disaster response, rapid rescue dispatch, relief camp capacity tracking, and medical triage. We practice strict data minimization: we only request information essential for life-safety coordination.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white mb-2">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong>Account Information:</strong> Full name, verified email address, optional contact telephone number, and district of residence.
              </li>
              <li>
                <strong>Emergency Telemetry:</strong> Precise WGS84 GPS coordinates (±3m fix), roof status, number of trapped individuals, and critical medical needs (e.g., insulin, infant care, oxygen).
              </li>
              <li>
                <strong>Offline Drafts:</strong> Temporary local storage in your browser&apos;s IndexedDB to preserve SOS requests when cellular connections fail.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white mb-2">
              3. Protection of Location Data &amp; Public Maps
            </h2>
            <p>
              To protect citizens from unauthorized profiling and property crime during flood evacuations, <strong>precise house coordinates, names, and contact phone numbers are never exposed on public maps</strong>. Only authorized State EOC controllers, naval rescue coordinators, and verified rescue boat leads can view granular dispatch details. Public incident markers on the live hazard map are generalized to sector levels.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white mb-2">
              4. Data Retention &amp; Rights
            </h2>
            <p>
              Operational distress records are retained for the duration of the monsoon emergency and subsequent official review by District Disaster Management Authorities. Citizens possess the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Request an electronic export copy of their submitted reports via Account Settings.</li>
              <li>Request permanent account deletion subject to pending rescue verification audits.</li>
              <li>Revoke location consent at any time for non-emergency browsing.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-base sm:text-lg font-bold text-on-surface dark:text-white mb-2">
              5. Contacting the Data Protection Officer
            </h2>
            <p>
              For privacy inquiries or audit requests, contact the Disaster Data Governance desk at <code className="bg-surface-container dark:bg-command-navy px-1 py-0.5 rounded">privacy@resq-kerala.org</code> or visit the State Emergency Operations Centre (SEOC), Thiruvananthapuram.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-container dark:border-command-border flex items-center justify-between">
          <Link href="/terms" className="text-secondary dark:text-secondary-fixed text-xs font-bold hover:underline">
            View Terms of Use &rarr;
          </Link>
          <Link href="/" className="text-xs text-on-surface-variant dark:text-command-subtle hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
