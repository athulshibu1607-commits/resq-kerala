'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import InstallAppButton from '@/components/InstallAppButton';
import { CURRENT_APP_RELEASE, AppReleaseMetadata } from '@/lib/releaseConfig';

export default function InstallPage() {
  const [release, setRelease] = useState<AppReleaseMetadata>(CURRENT_APP_RELEASE);
  const [apkPublished, setApkPublished] = useState<boolean>(true);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [apkDownloadUrl, setApkDownloadUrl] = useState<string>('');
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFailureHelp, setShowFailureHelp] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect platform or read query param
    const params = new URLSearchParams(window.location.search);
    const platformParam = params.get('platform');

    if (platformParam === 'ios' || platformParam === 'android' || platformParam === 'desktop') {
      setActivePlatform(platformParam);
    } else {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setActivePlatform('ios');
      } else if (/android/.test(ua)) {
        setActivePlatform('android');
      } else {
        setActivePlatform('desktop');
      }
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    setSiteUrl(origin);

    // Fetch live release metadata from /api/release
    fetch('/api/release')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load release metadata');
        return res.json();
      })
      .then((data: AppReleaseMetadata & { fileExistsOnServer?: boolean; downloadUrl?: string }) => {
        setRelease(data);
        const isPublished = data.isPublished && data.fileExistsOnServer !== false;
        setApkPublished(isPublished);

        const targetUrl = data.downloadUrl || `${origin}${data.apkDownloadPath}`;
        setApkDownloadUrl(targetUrl);

        if (isPublished) {
          // Generate real QR code for the genuine APK download URL
          QRCode.toString(targetUrl, {
            type: 'svg',
            margin: 1,
            color: {
              dark: '#0A192F',
              light: '#FFFFFF',
            },
          })
            .then((svg) => setQrSvg(svg))
            .catch((err) => {
              console.warn('QR SVG fallback:', err);
              QRCode.toDataURL(targetUrl, {
                width: 240,
                margin: 1,
                color: { dark: '#0A192F', light: '#FFFFFF' },
              }).then((url) => {
                setQrSvg(`<img src="${url}" alt="APK Download QR Code" class="w-full h-full object-contain" />`);
              });
            });
        }
      })
      .catch((err) => {
        console.warn('Could not reach release API, using static metadata:', err);
        const fallbackTarget = `${origin}${CURRENT_APP_RELEASE.apkDownloadPath}`;
        setApkDownloadUrl(fallbackTarget);
        QRCode.toString(fallbackTarget, {
          type: 'svg',
          margin: 1,
          color: { dark: '#0A192F', light: '#FFFFFF' },
        }).then((svg) => setQrSvg(svg));
      });
  }, []);

  const handleCopyApkUrl = async () => {
    if (!apkDownloadUrl) return;
    try {
      await navigator.clipboard.writeText(apkDownloadUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.warn('Copy link failed', e);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* Top Breadcrumb / Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant dark:text-command-subtle hover:text-secondary dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>APK v{release.version} Ready</span>
          </span>
          <span className="text-[11px] font-mono text-on-surface-variant/70 dark:text-command-subtle/70 hidden sm:inline">
            App ID: {release.appId}
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 rounded-2xl bg-[#0A192F] mx-auto mb-4 p-2 shadow-lg border border-slate-700 flex items-center justify-center">
          <img src="/icons/icon.svg" alt="RESQ KERALA Logo" className="w-full h-full object-contain" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high dark:bg-command-card text-on-surface-variant dark:text-command-subtle border border-surface-container-highest dark:border-command-border text-xs font-extrabold uppercase tracking-widest text-secondary dark:text-secondary-fixed mb-2">
          <span>OFFICIAL MOBILE CLIENT DISTRIBUTION</span>
          <span>·</span>
          <span>ഔദ്യോഗിക മൊബൈൽ ആപ്പ്</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-black text-on-surface dark:text-white mt-1">
          Install RESQ KERALA on Your Device
        </h1>
        <p className="text-sm text-on-surface-variant dark:text-command-subtle mt-2.5 leading-relaxed">
          Engineered for severe monsoon emergencies in Kerala. Download the official Android APK directly to your phone, or install via browser Progressive Web App (PWA).
        </p>
      </div>

      {/* PRIMARY SECTION 1: Real Android APK Release Card & QR Code */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">android</span>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface dark:text-white">
              Option 1: Official Android App (APK Download)
            </h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-secondary/10 text-secondary dark:text-red-400 font-bold border border-secondary/20">
            Recommended for Android
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: APK Details & Actions */}
          <div className="lg:col-span-7 bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-secondary/20 dark:border-secondary/30 flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>Official Signed Release</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-container dark:bg-command-navy text-on-surface dark:text-white text-xs font-mono font-semibold">
                  v{release.version} ({release.fileSizeFormatted})
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-container dark:bg-command-navy text-on-surface-variant dark:text-command-subtle text-xs font-mono">
                  {release.buildDate}
                </span>
              </div>

              <h3 className="font-headline text-2xl font-black text-on-surface dark:text-white">
                RESQ KERALA Android Application
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-2 leading-relaxed">
                Full native Android shell with hardware GPS access, emergency siren acoustic oscillation, offline SOS caching, and direct connection to the live disaster coordination network.
              </p>

              {/* Technical Spec Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5 p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy/60 border border-surface-container-high dark:border-command-border text-xs">
                <div>
                  <span className="text-[11px] text-on-surface-variant/70 dark:text-command-subtle/70 block">Package ID</span>
                  <span className="font-mono font-bold text-on-surface dark:text-white truncate block">
                    {release.appId}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-on-surface-variant/70 dark:text-command-subtle/70 block">File Size</span>
                  <span className="font-mono font-bold text-on-surface dark:text-white block">
                    {release.fileSizeFormatted}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-on-surface-variant/70 dark:text-command-subtle/70 block">Compatibility</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                    Android 7.0 to 14+
                  </span>
                </div>
              </div>

              {/* Verified APK Benefits */}
              <ul className="space-y-2.5 text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mb-6">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <strong className="text-on-surface dark:text-white">Direct APK Sideload:</strong> Installs directly without Google Play Store sign-in or payment account requirements.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <strong className="text-on-surface dark:text-white">Emergency Hardware Access:</strong> Native GPS position lock, acoustic alert siren, and vibration motors.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <strong className="text-on-surface dark:text-white">Offline SOS Storage:</strong> When cell towers fail, SOS requests are queued locally with cryptographic idempotency keys.
                  </div>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-surface-container dark:border-command-border space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {apkPublished ? (
                  <a
                    href={release.apkDownloadPath}
                    download="resq-kerala-v1.0.0.apk"
                    className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-secondary hover:bg-red-700 text-white font-black text-sm shadow-md transition-all text-center"
                    id="btn-download-apk"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span>Download Android App (APK)</span>
                    <span className="text-xs opacity-80 font-normal">({release.fileSizeFormatted})</span>
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                    <span><strong>Notice:</strong> APK release is compiling. Please refresh in a moment.</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCopyApkUrl}
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-container dark:bg-command-navy hover:bg-surface-container-high text-on-surface dark:text-white text-xs font-bold transition-colors"
                  id="btn-copy-apk-link"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedLink ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Download Link'}</span>
                </button>
              </div>

              {/* Android Sideloading Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[18px] shrink-0 mt-0.5">
                    warning
                  </span>
                  <div className="leading-relaxed">
                    <strong>Android Installation Notice:</strong> Because this emergency APK is downloaded directly from our servers instead of the Play Store, your browser may display: <em>&ldquo;File might be harmful&rdquo;</em> or <em>&ldquo;Install unknown apps&rdquo;</em>. Tap <strong>&ldquo;Download anyway&rdquo;</strong> &rarr; <strong>&ldquo;Settings&rdquo;</strong> &rarr; <strong>&ldquo;Allow from this source&rdquo;</strong> &rarr; <strong>&ldquo;Install&rdquo;</strong>.
                  </div>
                </div>
              </div>

              {/* Failure / Retry Helper */}
              <div className="text-left">
                <button
                  type="button"
                  onClick={() => setShowFailureHelp(!showFailureHelp)}
                  className="text-[11px] text-on-surface-variant dark:text-command-subtle hover:text-secondary dark:hover:text-white underline inline-flex items-center gap-1"
                >
                  <span>Trouble downloading? Tap for direct download mirrors and help</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {showFailureHelp ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showFailureHelp && (
                  <div className="mt-2 p-3 rounded-xl bg-surface-container-low dark:bg-command-navy border border-surface-container-high dark:border-command-border text-xs space-y-2">
                    <p className="text-on-surface-variant dark:text-command-subtle">
                      If your browser blocked the download or connection was interrupted:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="/resq-kerala.apk"
                        download="resq-kerala.apk"
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high dark:bg-command-card text-on-surface dark:text-white font-bold text-xs hover:bg-secondary hover:text-white transition-colors"
                      >
                        Mirror 1: /resq-kerala.apk
                      </a>
                      <a
                        href="/downloads/resq-kerala-v1.0.0-debug.apk"
                        download="resq-kerala-v1.0.0-debug.apk"
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high dark:bg-command-card text-on-surface dark:text-white font-bold text-xs hover:bg-secondary hover:text-white transition-colors"
                      >
                        Debug Build (Testing): /downloads/resq-kerala-v1.0.0-debug.apk
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Real Verified QR Code Card */}
          <div className="lg:col-span-5 bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-container-high dark:border-command-border flex flex-col items-center justify-between text-center">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold mb-2">
                <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                <span>Scan with Android Camera</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface dark:text-white">
                Scan to Download APK Directly
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1 mb-4">
                Point your phone camera to download the verified .apk package straight to your Android device
              </p>
            </div>

            <div className="my-auto py-2">
              {apkPublished && qrSvg ? (
                <div
                  className="p-3.5 bg-white rounded-2xl border-2 border-slate-200 shadow-md w-56 h-56 mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>img]:w-full [&>img]:h-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                  id="apk-qr-container"
                />
              ) : !apkPublished ? (
                <div className="w-56 h-56 bg-surface-container-low dark:bg-command-navy rounded-2xl flex flex-col items-center justify-center text-xs text-amber-500 gap-2 border border-dashed border-amber-400 p-4">
                  <span className="material-symbols-outlined text-[32px]">pending</span>
                  <span className="font-bold">APK Not Published Yet</span>
                  <span className="text-[11px] text-on-surface-variant dark:text-command-subtle text-center">
                    Release build is preparing. The QR code will activate once the verified release is ready.
                  </span>
                </div>
              ) : (
                <div className="w-56 h-56 bg-surface-container-low dark:bg-command-navy rounded-2xl flex flex-col items-center justify-center text-xs text-slate-400 gap-2 border border-surface-container-high dark:border-command-border">
                  <span className="material-symbols-outlined text-[32px] animate-spin">refresh</span>
                  <span>Encoding APK download URL...</span>
                </div>
              )}
            </div>

            <div className="w-full pt-4">
              <span className="text-[11px] font-mono text-on-surface-variant dark:text-command-subtle block mb-1.5 text-left font-bold">
                Encoded APK URL:
              </span>
              <div className="flex items-center justify-between gap-2 p-2 bg-surface-container-low dark:bg-command-navy rounded-xl border border-surface-container-high dark:border-command-border text-left">
                <span className="font-mono text-[11px] text-on-surface-variant dark:text-command-subtle truncate flex-1 pl-1" title={apkDownloadUrl}>
                  {apkDownloadUrl || `${siteUrl}/downloads/resq-kerala-v1.0.0.apk`}
                </span>
                <button
                  type="button"
                  onClick={handleCopyApkUrl}
                  className="px-2.5 py-1 rounded-lg bg-surface-container dark:bg-command-card text-on-surface dark:text-white text-[11px] font-bold hover:bg-surface-container-high transition-colors flex items-center gap-1 shrink-0"
                  title="Copy APK URL"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {copiedLink ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                <span>SHA-256 Verified</span>
                <span>Target: Android 14 (API 34)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY SECTION 2: Browser-Based Progressive Web App (PWA) */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[24px]">web</span>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface dark:text-white">
              Option 2: Browser Web App (PWA · iPhone &amp; Desktop)
            </h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
            Zero Storage · All Devices
          </span>
        </div>

        <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-container-high dark:border-command-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-surface-container dark:border-command-border">
            <div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface dark:text-white">
                Instant Access Without APK Installation
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-1 max-w-2xl leading-relaxed">
                Add RESQ KERALA directly to your home screen using web standards. Recommended for iPhone/iPad users (via Apple Safari) and desktop workstations.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <InstallAppButton variant="secondary" className="py-2.5 px-5 text-xs sm:text-sm" />
              <Link
                href="/citizen"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container dark:bg-command-navy text-on-surface dark:text-white text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                <span>Open Web App</span>
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </Link>
            </div>
          </div>

          {/* Platform Tabs for PWA */}
          <div className="pt-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => setActivePlatform('ios')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activePlatform === 'ios'
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-surface-container dark:bg-command-navy text-on-surface dark:text-white hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
                <span>iPhone / iPad (Apple Safari)</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePlatform('android')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activePlatform === 'android'
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-surface-container dark:bg-command-navy text-on-surface dark:text-white hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">android</span>
                <span>Android PWA (Chrome / Brave)</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePlatform('desktop')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activePlatform === 'desktop'
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-surface-container dark:bg-command-navy text-on-surface dark:text-white hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">laptop</span>
                <span>Desktop (Chrome / Edge / Safari)</span>
              </button>
            </div>

            {/* Tab: iOS Safari Instructions */}
            <div className={`space-y-4 ${activePlatform === 'ios' ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container dark:border-command-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-secondary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">Open in Safari</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                    Open this website in <strong>Apple Safari</strong> on your iPhone or iPad. (Apple restricts PWA home screen installation to Safari).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container dark:border-command-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-secondary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">Tap Share Button</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                    Tap the <strong>Share</strong> icon in the bottom Safari toolbar (the square icon with an arrow pointing upward).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container dark:border-command-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-secondary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">Add to Home Screen</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                    Scroll down the share sheet and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> (represented with a plus sign icon).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container dark:border-command-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-secondary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      4
                    </span>
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">Tap &ldquo;Add&rdquo;</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                    Tap <strong>&ldquo;Add&rdquo;</strong> in the top-right corner. The app opens in standalone full-screen mode without the Safari address bar!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span><strong>iOS Note:</strong> Apple does not support APK files (which are Android-only). iOS users use Safari&apos;s Share &rarr; Add to Home Screen for native PWA installation.</span>
              </div>
            </div>

            {/* Tab: Android Chrome Instructions */}
            <div className={`space-y-4 ${activePlatform === 'android' ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container dark:border-command-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-secondary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">Open in Chrome</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                    Open <strong>Google Chrome</strong> or <strong>Brave</strong> on your Android phone and navigate to this website.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container dark:border-command-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-secondary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">Tap Install App</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                    Tap the <strong>&ldquo;Install App&rdquo;</strong> button above, or tap the browser&apos;s menu icon (⋮ three vertical dots in the top-right corner).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container dark:border-command-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-secondary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">Confirm Installation</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                    Select <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>. The RESQ KERALA app icon will appear immediately on your home screen.
                  </p>
                </div>
              </div>
            </div>

            {/* Tab: Desktop Chrome / Edge */}
            <div className={`space-y-4 ${activePlatform === 'desktop' ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container dark:border-command-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-secondary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">Check Omnibox</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                    In <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>, look for the <strong>Install</strong> icon on the right side of the URL address bar.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container dark:border-command-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-secondary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">Browser Menu Option</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                    Alternatively, click the browser menu (⋮ three vertical dots) &rarr; <strong>&ldquo;Save and share&rdquo;</strong> &rarr; <strong>&ldquo;Install RESQ KERALA&rdquo;</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-command-navy border border-surface-container dark:border-command-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-secondary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">Standalone Window</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-command-subtle leading-relaxed">
                    Click <strong>&ldquo;Install&rdquo;</strong> when prompted. The platform opens in an independent command center application window.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Emergency Reliability & Offline Warning */}
      <div className="mb-14 p-6 rounded-3xl bg-surface-container-low dark:bg-command-navy border border-surface-container-high dark:border-command-border">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary text-[24px] shrink-0 mt-0.5">
            emergency_home
          </span>
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface dark:text-white">
              Critical Emergency Operation Notice
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1 leading-relaxed">
              <strong>Offline SOS Notice:</strong> If cellular connectivity is severed, an SOS request saved locally on your device remains queued in your offline database. Rescuers cannot see or act upon your signal until your device connects to a network and receives a server acknowledgment receipt.
            </p>
            <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-2 leading-relaxed">
              <strong>Public Prototype Advisory:</strong> RESQ KERALA is a digital coordination utility and prototype. It does not replace official state emergency dispatch lines. In life-threatening emergencies, always dial official authorities directly.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: FAQ & Diagnostics */}
      <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-container-high dark:border-command-border mb-12">
        <div className="mb-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-secondary dark:text-secondary-fixed">
            Help &amp; Diagnostics
          </span>
          <h3 className="font-headline text-xl sm:text-2xl font-bold text-on-surface dark:text-white mt-0.5">
            Installation FAQ &amp; Troubleshooting
          </h3>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "What is the difference between the Android APK and the PWA?",
              a: "The Android APK is a native application package (in.resqkerala.app) that installs directly on your Android phone, featuring deep OS integration, vibration alerts, and hardware GPS. The PWA is a browser-based application that runs through Chrome or Safari without taking up native storage space.",
            },
            {
              q: "Why does Android say 'File might be harmful' when downloading the APK?",
              a: "Android shows this security warning for any APK downloaded outside the Google Play Store (sideloading). RESQ KERALA's APK is signed with a verified 2048-bit RSA key and contains zero ad trackers or proprietary telemetry. It is completely safe to tap 'Download anyway'.",
            },
            {
              q: "Does the app replace dialing 112 or official rescue agencies?",
              a: "No. RESQ KERALA is a volunteer and citizen digital coordination platform. For immediate helicopter rescue, medical extraction, or life-or-death situations, always call 112 (Kerala Police ERSS) or 1077 (District Disaster Management Authority).",
            },
            {
              q: "How does the QR code work?",
              a: "The QR code on this page directly encodes the verified HTTPS download URL of the release APK. Scanning it with any Android phone camera or QR scanner will immediately trigger the download of resq-kerala-v1.0.0.apk.",
            },
            {
              q: "Can I install the APK on an iPhone or iPad?",
              a: "No. APK files are exclusively for the Android operating system. iPhone and iPad users can install RESQ KERALA by opening the website in Apple Safari, tapping the Share button, and choosing 'Add to Home Screen'.",
            },
          ].map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-surface-container dark:border-command-border rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 bg-surface-container-low dark:bg-command-navy hover:bg-surface-container transition-colors"
                >
                  <span className="font-bold text-xs sm:text-sm text-on-surface dark:text-white">
                    {item.q}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant dark:text-command-subtle shrink-0">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <div className="p-4 bg-white dark:bg-command-card text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle leading-relaxed border-t border-surface-container dark:border-command-border">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Hotline Banner & Link Back */}
      <div className="p-6 rounded-3xl bg-surface-container-low dark:bg-command-navy border border-surface-container-high dark:border-command-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-headline text-sm sm:text-base font-bold text-on-surface dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">emergency</span>
            <span>Immediate Life Threat?</span>
          </h4>
          <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-0.5">
            Digital tools assist coordination. In extreme distress, dial official disaster hotlines:
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-red-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">call</span>
              <span>112 (Kerala ERSS)</span>
            </a>
            <a
              href="tel:1077"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container dark:bg-command-card text-on-surface dark:text-white text-xs font-bold hover:bg-surface-container-high transition-colors border border-surface-container-high dark:border-command-border"
            >
              <span className="material-symbols-outlined text-[14px]">call</span>
              <span>1077 (DDMA Control Room)</span>
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-primary-container text-white text-xs font-bold hover:bg-black transition-colors"
          >
            Return to Homepage
          </Link>
          <Link
            href="/citizen/sos"
            className="px-4 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Open SOS Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
