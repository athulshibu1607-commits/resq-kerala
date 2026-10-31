'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { CURRENT_APP_RELEASE, AppReleaseMetadata } from '@/lib/releaseConfig';

export default function DownloadPage() {
  const [release, setRelease] = useState<AppReleaseMetadata>(CURRENT_APP_RELEASE);
  const [activeTab, setActiveTab] = useState<'wifi' | 'production' | 'direct'>('wifi');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [encodedUrl, setEncodedUrl] = useState<string>('');
  const [customIp, setCustomIp] = useState<string>('10.142.16.56');
  const [customPort, setCustomPort] = useState<string>('3000');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showChecksums, setShowChecksums] = useState<boolean>(false);

  // Helper to safely render QR SVG
  const generateQrSvg = (url: string) => {
    QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0A192F',
        light: '#FFFFFF',
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => {
        console.warn('QR SVG generation fallback:', err);
        QRCode.toDataURL(url, {
          width: 250,
          margin: 1,
          color: { dark: '#0A192F', light: '#FFFFFF' },
        }).then((dataUrl) => {
          setQrSvg(`<img src="${dataUrl}" alt="RESQ KERALA QR Code" class="w-full h-full object-contain" />`);
        });
      });
  };

  useEffect(() => {
    // Check if opened via specific host on LAN
    let detectedHost = '10.142.16.56';
    let detectedPort = '3000';
    if (typeof window !== 'undefined') {
      if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        detectedHost = window.location.hostname;
      }
      if (window.location.port) {
        detectedPort = window.location.port;
      }
    }
    setCustomIp(detectedHost);
    setCustomPort(detectedPort);

    // Initial QR render with local Wi-Fi target
    const initialUrl = `http://${detectedHost}:${detectedPort}/download`;
    setEncodedUrl(initialUrl);
    generateQrSvg(initialUrl);

    // Fetch live network IP and release data from server
    fetch('/api/release')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch release metadata');
        return res.json();
      })
      .then((data: AppReleaseMetadata & { lanIp?: string; port?: string; localNetworkDownloadUrl?: string; localNetworkApkUrl?: string }) => {
        setRelease(data);
        const resolvedIp = (data.lanIp && data.lanIp !== '127.0.0.1') ? data.lanIp : detectedHost;
        const resolvedPort = data.port || detectedPort;

        setCustomIp(resolvedIp);
        setCustomPort(resolvedPort);

        // Determine initial target based on activeTab
        const lanUrl = `http://${resolvedIp}:${resolvedPort}/download`;
        setEncodedUrl(lanUrl);
        generateQrSvg(lanUrl);
      })
      .catch((err) => {
        console.warn('Could not reach /api/release, using fallback config:', err);
      });
  }, []);

  // Update target URL and QR whenever tab or IP changes
  const handleTabChange = (tab: 'wifi' | 'production' | 'direct') => {
    setActiveTab(tab);
    let target = '';
    if (tab === 'wifi') {
      target = `http://${customIp}:${customPort}/download`;
    } else if (tab === 'production') {
      target = release.publicReleasePageUrl || 'https://github.com/athulshibu1607-commits/resq-kerala/releases/tag/v1.0.0';
    } else {
      // Direct APK auto-download link
      target = release.publicDownloadUrl || CURRENT_APP_RELEASE.publicDownloadUrl;
    }
    setEncodedUrl(target);
    generateQrSvg(target);
  };

  const handleIpChange = (newIp: string) => {
    setCustomIp(newIp);
    if (activeTab === 'wifi') {
      const target = `http://${newIp}:${customPort}/download`;
      setEncodedUrl(target);
      generateQrSvg(target);
    }
  };

  const handleCopyLink = async () => {
    if (!encodedUrl) return;
    try {
      await navigator.clipboard.writeText(encodedUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.warn('Copy link error:', e);
    }
  };

  const handleDownloadClick = () => {
    setIsDownloading(true);
    setDownloadError(null);
    setTimeout(() => {
      setIsDownloading(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-[#07111E] text-on-surface dark:text-white pb-24">
      {/* Top Standalone Navigation Bar */}
      <header className="border-b border-surface-container-high dark:border-slate-800 bg-white/80 dark:bg-[#0A192F]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#0A192F] p-1.5 flex items-center justify-center border border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                <img src="/icons/icon.svg" alt="RESQ KERALA Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-headline font-black text-base sm:text-lg tracking-tight text-on-surface dark:text-white block leading-none">
                  RESQ KERALA
                </span>
                <span className="text-[10px] font-mono text-on-surface-variant dark:text-slate-400 block mt-0.5">
                  Official Android App Distribution
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-on-surface-variant dark:text-slate-300 hover:text-secondary dark:hover:text-white transition-colors hidden sm:inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Main Portal</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>v{release.version} Ready</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Download Content Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Page Heading & Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high dark:bg-[#0D2137] text-secondary dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3 border border-secondary/20">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>VERIFIED DISASTER RELIEF CLIENT</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-on-surface dark:text-white tracking-tight">
            Download RESQ KERALA
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant dark:text-slate-300 mt-3 leading-relaxed">
            Official Android APK installer for severe monsoon emergencies, SOS geolocation alerts, offline shelter directories, and relief coordination across Kerala.
          </p>
        </div>

        {/* Primary Download & QR Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* LEFT COLUMN: APK Download Card */}
          <div
            id="download-apk-card"
            className="lg:col-span-7 bg-white dark:bg-[#0D2137] rounded-3xl p-6 sm:p-8 border-2 border-secondary/20 dark:border-secondary/30 shadow-xl flex flex-col justify-between gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              {/* Release Version Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold shadow-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">android</span>
                  <span>Android App (APK)</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-container dark:bg-[#07111E] text-on-surface dark:text-slate-200 text-xs font-mono font-semibold">
                  v{release.version}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-container dark:bg-[#07111E] text-on-surface-variant dark:text-slate-400 text-xs font-mono">
                  {release.fileSizeFormatted}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20">
                  Signed v2
                </span>
              </div>

              <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface dark:text-white leading-tight">
                Install Official Android App
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-slate-300 mt-2 leading-relaxed">
                Direct installation package. Runs independently without Google Play Store dependencies and functions during severe telecom disruptions.
              </p>

              {/* Verified Metadata Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5 p-4 rounded-2xl bg-surface-container-low dark:bg-[#07111E]/80 border border-surface-container-high dark:border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase text-on-surface-variant/70 dark:text-slate-400 block font-sans">
                    Package Name
                  </span>
                  <span className="font-bold text-on-surface dark:text-white truncate block" title={release.appId}>
                    {release.appId}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-on-surface-variant/70 dark:text-slate-400 block font-sans">
                    Exact Size
                  </span>
                  <span className="font-bold text-on-surface dark:text-white block">
                    {release.fileSizeFormatted} ({release.fileSizeBytes?.toLocaleString()} B)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-on-surface-variant/70 dark:text-slate-400 block font-sans">
                    Compatibility
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                    Android 7.0 &rarr; 14+
                  </span>
                </div>
              </div>

              {/* Hardware & Offline Benefits */}
              <ul className="space-y-2 text-xs sm:text-sm text-on-surface-variant dark:text-slate-300 mb-6">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Native GPS Lock:</strong> High-precision location coordinates transmitted with SOS broadcasts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Acoustic Siren:</strong> High-decibel alert tone to assist rescue teams in locating you.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Offline Cache:</strong> Emergency contacts, shelter locations, and first aid guides stored on device.</span>
                </li>
              </ul>
            </div>

            {/* Download Buttons Section */}
            <div className="pt-4 border-t border-surface-container dark:border-slate-800 space-y-3">
              {downloadError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/70 border border-red-500/30 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{downloadError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Primary Download Button */}
                <a
                  href={release.apkDownloadPath}
                  download="resq-kerala-v1.0.0.apk"
                  onClick={handleDownloadClick}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-secondary hover:bg-red-700 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-red-900/30 transition-all text-center group active:scale-98"
                  id="btn-primary-download-apk"
                >
                  <span className="material-symbols-outlined text-[24px] group-hover:translate-y-0.5 transition-transform">
                    download
                  </span>
                  <span>Download Android App (APK)</span>
                </a>

                {/* CDN Mirror Fallback Button */}
                <a
                  href={release.publicDownloadUrl}
                  download="resq-kerala-v1.0.0.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-4 px-4 rounded-2xl bg-surface-container dark:bg-[#07111E] hover:bg-surface-container-high text-on-surface dark:text-white text-xs font-bold transition-colors border border-surface-container-high dark:border-slate-700 text-center"
                  title="Global Fastly/AWS CDN Mirror"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                  <span>CDN Mirror</span>
                </a>
              </div>

              {isDownloading && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5 animate-pulse">
                  <span className="material-symbols-outlined text-[14px]">sync</span>
                  <span>Download initiated! Check your browser notification bar...</span>
                </p>
              )}

              {/* Sideload Security Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/50 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[18px] shrink-0 mt-0.5">
                    info
                  </span>
                  <div className="leading-relaxed">
                    <strong>Android Notice:</strong> When downloading directly, Chrome may prompt: <em>&ldquo;File might be harmful&rdquo;</em>. Tap <strong>&ldquo;Download anyway&rdquo;</strong> &rarr; Open file &rarr; <strong>&ldquo;Allow from this source&rdquo;</strong> &rarr; <strong>&ldquo;Install&rdquo;</strong>.
                  </div>
                </div>
              </div>

              {/* Checksum / Hash Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowChecksums(!showChecksums)}
                  className="text-[11px] text-on-surface-variant dark:text-slate-400 hover:text-secondary dark:hover:text-white underline inline-flex items-center gap-1"
                >
                  <span>{showChecksums ? 'Hide' : 'Verify'} cryptographic SHA-256 checksum</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {showChecksums ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {showChecksums && (
                  <div className="mt-2 p-3 rounded-xl bg-surface-container-low dark:bg-[#07111E] border border-surface-container-high dark:border-slate-800 text-[11px] font-mono break-all space-y-1">
                    <span className="text-slate-400 block font-sans">SHA-256 Digest:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 select-all block">
                      {release.sha256Checksum || CURRENT_APP_RELEASE.sha256Checksum}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Reachable QR Code Card */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0D2137] rounded-3xl p-6 sm:p-8 border border-surface-container-high dark:border-slate-800 shadow-xl flex flex-col justify-between items-center text-center relative">
            <div className="w-full">
              {/* Mode Selector Tabs */}
              <div className="inline-flex p-1 bg-surface-container dark:bg-[#07111E] rounded-2xl w-full text-xs font-bold mb-4 border border-surface-container-high dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleTabChange('wifi')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'wifi'
                      ? 'bg-secondary text-white shadow-xs'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                  }`}
                  id="tab-mode-wifi"
                >
                  <span className="material-symbols-outlined text-[16px]">wifi</span>
                  <span>Same Wi-Fi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('production')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'production'
                      ? 'bg-secondary text-white shadow-xs'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                  }`}
                  id="tab-mode-production"
                >
                  <span className="material-symbols-outlined text-[16px]">public</span>
                  <span>Web Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('direct')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'direct'
                      ? 'bg-secondary text-white shadow-xs'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                  }`}
                  id="tab-mode-direct"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Auto-APK</span>
                </button>
              </div>

              <h3 className="font-headline text-lg font-bold text-on-surface dark:text-white">
                {activeTab === 'wifi' && 'Scan to Open on Same Wi-Fi'}
                {activeTab === 'production' && 'Scan for Official Release Portal'}
                {activeTab === 'direct' && 'Scan to Download APK Directly'}
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-300 mt-1 mb-4 leading-relaxed">
                {activeTab === 'wifi' && 'Opens this download website on your Android phone while connected to the same Wi-Fi.'}
                {activeTab === 'production' && 'Opens the verified release page with full release notes and verification assets.'}
                {activeTab === 'direct' && 'Triggers immediate file download of resq-kerala-v1.0.0.apk onto your phone.'}
              </p>
            </div>

            {/* QR Code Graphic Frame */}
            <div className="my-auto py-2" id="dedicated-qr-container">
              {qrSvg ? (
                <div className="relative group">
                  <div
                    className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md w-60 h-60 mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>img]:w-full [&>img]:h-full"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                  <div className="absolute inset-0 bg-slate-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-bold">
                      Point Phone Camera Here
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md w-60 h-60 mx-auto flex items-center justify-center">
                    <img src="/downloads/qr-apk-direct.png" alt="RESQ KERALA QR Code" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute inset-0 bg-slate-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-bold">
                      Point Phone Camera Here
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Reachable URL Display & Actions */}
            <div className="w-full pt-4 space-y-2.5">
              {/* Wi-Fi LAN IP Input Override if in wifi mode */}
              {activeTab === 'wifi' && (
                <div className="p-2.5 bg-surface-container-low dark:bg-[#07111E] rounded-xl border border-surface-container-high dark:border-slate-800 text-left space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-on-surface dark:text-slate-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Detected MacBook LAN IP:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Port: {customPort}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customIp}
                      onChange={(e) => handleIpChange(e.target.value)}
                      placeholder="e.g. 192.168.1.25"
                      className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-white dark:bg-[#0D2137] border border-surface-container-highest dark:border-slate-700 text-on-surface dark:text-white focus:outline-none focus:border-secondary"
                    />
                    <span className="text-[11px] font-mono text-slate-400">:{customPort}/download</span>
                  </div>
                </div>
              )}

              {/* Target URL with Copy */}
              <div className="flex items-center justify-between gap-2 p-2 bg-surface-container-low dark:bg-[#07111E] rounded-xl border border-surface-container-high dark:border-slate-800 text-left">
                <span className="font-mono text-[11px] text-on-surface-variant dark:text-slate-300 truncate flex-1 pl-1" title={encodedUrl}>
                  {encodedUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-surface-container dark:bg-[#0D2137] text-on-surface dark:text-white text-[11px] font-bold hover:bg-surface-container-high transition-colors flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {copiedLink ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Quick Action Links: Test in New Tab & Save Image */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <a
                  href={encodedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-surface-container dark:bg-[#07111E] hover:bg-surface-container-high text-on-surface dark:text-white transition-colors border border-surface-container-high dark:border-slate-800"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  <span>Test Link</span>
                </a>
                <a
                  href={activeTab === 'direct' ? '/downloads/qr-apk-direct.png' : '/downloads/qr-apk-website.png'}
                  download={`resq-kerala-qr-${activeTab}.png`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-surface-container dark:bg-[#07111E] hover:bg-surface-container-high text-on-surface dark:text-white transition-colors border border-surface-container-high dark:border-slate-800"
                >
                  <span className="material-symbols-outlined text-[14px]">image</span>
                  <span>Save QR (.png)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: 4-Step Android Installation Guide */}
        <section id="instructions-section" className="mb-14">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="font-headline text-2xl font-bold text-on-surface dark:text-white">
              How to Install on Android Phone
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant dark:text-slate-400 mt-1">
              Follow these simple steps after downloading the APK package
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-white dark:bg-[#0D2137] p-5 rounded-2xl border border-surface-container-high dark:border-slate-800 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-secondary text-white font-black text-sm flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="font-headline font-bold text-sm text-on-surface dark:text-white mb-1">
                Download the APK
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                Tap the &ldquo;Download Android App (APK)&rdquo; button above. The package will download directly to your phone.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-[#0D2137] p-5 rounded-2xl border border-surface-container-high dark:border-slate-800 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-secondary text-white font-black text-sm flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="font-headline font-bold text-sm text-on-surface dark:text-white mb-1">
                Accept Browser Prompt
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                If Chrome displays &ldquo;File might be harmful&rdquo;, tap <strong>&ldquo;Download anyway&rdquo;</strong> to proceed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-[#0D2137] p-5 rounded-2xl border border-surface-container-high dark:border-slate-800 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-secondary text-white font-black text-sm flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="font-headline font-bold text-sm text-on-surface dark:text-white mb-1">
                Allow Installation
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                Tap the downloaded file. When prompted, tap <strong>Settings</strong> and enable <strong>&ldquo;Allow from this source&rdquo;</strong>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-[#0D2137] p-5 rounded-2xl border border-surface-container-high dark:border-slate-800 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-3">
                4
              </div>
              <h3 className="font-headline font-bold text-sm text-on-surface dark:text-white mb-1">
                Install &amp; Launch
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                Tap <strong>&ldquo;Install&rdquo;</strong>. Once completed, tap <strong>&ldquo;Open&rdquo;</strong> and grant Location access for SOS coordinate routing.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: Secondary Option — Web App / PWA */}
        <section className="bg-white dark:bg-[#0D2137] rounded-3xl p-6 sm:p-8 border border-surface-container-high dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold mb-2 inline-block">
                Alternative: Zero Download
              </span>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface dark:text-white">
                Prefer Not to Install an APK? Use the Web App (PWA)
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                You can run RESQ KERALA directly in your mobile browser or add it to your home screen using web standards. Recommended for iPhones (Apple Safari) and desktop workstations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/"
                className="py-3 px-5 rounded-xl bg-surface-container dark:bg-[#07111E] hover:bg-surface-container-high text-on-surface dark:text-white text-xs font-bold transition-colors border border-surface-container-high dark:border-slate-700 inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span>Open Main Website</span>
              </Link>
              <Link
                href="/citizen"
                className="py-3 px-5 rounded-xl bg-primary-container text-white text-xs font-bold hover:bg-black transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">emergency</span>
                <span>Citizen Portal</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
