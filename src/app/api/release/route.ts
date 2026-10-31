import { NextResponse } from 'next/server';
import { CURRENT_APP_RELEASE } from '@/lib/releaseConfig';
import fs from 'fs';
import path from 'path';
import os from 'os';

function getLocalLanIp(): string | null {
  try {
    const interfaces = os.networkInterfaces();
    // Prioritize Wi-Fi and Ethernet interfaces: en0, en1, wlan0, eth0
    const priorityNames = ['en0', 'wlan0', 'eth0', 'en1'];
    for (const name of priorityNames) {
      const iface = interfaces[name];
      if (iface) {
        for (const info of iface) {
          if (info.family === 'IPv4' && !info.internal && info.address) {
            return info.address;
          }
        }
      }
    }
    // Fallback: search all interfaces for non-internal IPv4
    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;
      for (const info of iface) {
        if (info.family === 'IPv4' && !info.internal && info.address) {
          return info.address;
        }
      }
    }
  } catch (e) {
    console.warn('Could not inspect network interfaces:', e);
  }
  return null;
}

export async function GET(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  let origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) {
    if (host) {
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      const proto = forwardedProto || (isLocal ? 'http' : 'https');
      origin = `${proto}://${host}`;
    } else {
      origin = 'https://resq-kerala.org';
    }
  }

  // Detect LAN IP for same Wi-Fi testing
  const lanIp = getLocalLanIp();
  let port = '3000';
  if (host && host.includes(':')) {
    port = host.split(':')[1];
  } else if (process.env.PORT) {
    port = process.env.PORT;
  }

  // Check if physical APK file exists in public/downloads
  const apkFilePath = path.join(process.cwd(), 'public', CURRENT_APP_RELEASE.apkDownloadPath);
  let fileExists = false;
  let fileSizeBytes = CURRENT_APP_RELEASE.fileSizeBytes;

  try {
    if (fs.existsSync(apkFilePath)) {
      const stats = fs.statSync(apkFilePath);
      fileExists = true;
      fileSizeBytes = stats.size;
    }
  } catch (err) {
    console.warn('Could not read local APK stats:', err);
  }

  const absoluteApkUrl = `${origin}${CURRENT_APP_RELEASE.apkDownloadPath}`;
  const directApkUrl = `${origin}${CURRENT_APP_RELEASE.apkDirectPath}`;
  const isLocalHost = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('resq-kerala.org');

  const localNetworkDownloadUrl = lanIp ? `http://${lanIp}:${port}/download` : `${origin}/download`;
  const localNetworkApkUrl = lanIp ? `http://${lanIp}:${port}${CURRENT_APP_RELEASE.apkDownloadPath}` : absoluteApkUrl;

  // Recommended QR URL:
  // In local development, if LAN IP is detected, scan opens http://<lan-ip>:3000/download
  // Otherwise, falls back to public release or origin download URL
  const recommendedQrUrl = isLocalHost && lanIp
    ? localNetworkDownloadUrl
    : (CURRENT_APP_RELEASE.publicReleasePageUrl || `${origin}/download`);

  return NextResponse.json({
    ...CURRENT_APP_RELEASE,
    fileSizeBytes,
    fileSizeFormatted: `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`,
    fileExistsOnServer: fileExists,
    downloadUrl: absoluteApkUrl,
    directUrl: directApkUrl,
    qrEncodedUrl: recommendedQrUrl,
    lanIp: lanIp || '127.0.0.1',
    port,
    localNetworkDownloadUrl,
    localNetworkApkUrl,
    productionDownloadUrl: `${origin}/download`,
    publicDownloadUrl: CURRENT_APP_RELEASE.publicDownloadUrl,
    publicReleasePageUrl: CURRENT_APP_RELEASE.publicReleasePageUrl,
    publicRepoUrl: CURRENT_APP_RELEASE.publicRepoUrl,
  });
}
