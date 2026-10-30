import { NextResponse } from 'next/server';
import { CURRENT_APP_RELEASE } from '@/lib/releaseConfig';
import fs from 'fs';
import path from 'path';

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
  // For phone QR scanners, always prefer the public CDN URL if the local origin isn't globally reachable
  const recommendedQrUrl = isLocalHost
    ? CURRENT_APP_RELEASE.publicDownloadUrl
    : absoluteApkUrl;

  return NextResponse.json({
    ...CURRENT_APP_RELEASE,
    fileSizeBytes,
    fileSizeFormatted: `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`,
    fileExistsOnServer: fileExists,
    downloadUrl: absoluteApkUrl,
    directUrl: directApkUrl,
    qrEncodedUrl: recommendedQrUrl,
    publicDownloadUrl: CURRENT_APP_RELEASE.publicDownloadUrl,
    publicReleasePageUrl: CURRENT_APP_RELEASE.publicReleasePageUrl,
    publicRepoUrl: CURRENT_APP_RELEASE.publicRepoUrl,
  });
}
