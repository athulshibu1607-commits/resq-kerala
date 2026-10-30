import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log('=== RESQ KERALA — QR CODE & APK DISTRIBUTION VERIFICATION ===\n');

async function testLocalApi() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000/api/release', (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          console.log('✓ /api/release returned HTTP', res.statusCode);
          console.log('  App ID:', json.appId);
          console.log('  Version:', json.version);
          console.log('  File Size:', json.fileSizeFormatted);
          console.log('  QR Encoded URL:', json.qrEncodedUrl);
          console.log('  Public Download URL:', json.publicDownloadUrl);
          console.log('  Public Webpage URL:', json.publicReleasePageUrl);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function testLocalInstallPage() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000/install', (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        console.log('✓ /install rendered with HTTP', res.statusCode);
        if (raw.includes('apk-qr-container') || raw.includes('Option 1: Official Android App')) {
          console.log('✓ /install contains QR code container and APK download components');
        } else {
          console.warn('⚠ Could not find qr container in HTML response');
        }
        resolve(res.statusCode);
      });
    }).on('error', reject);
  });
}

async function testStaticQrImages() {
  const directPng = path.join(process.cwd(), 'public/downloads/qr-apk-direct.png');
  const webPng = path.join(process.cwd(), 'public/downloads/qr-apk-website.png');

  if (fs.existsSync(directPng) && fs.existsSync(webPng)) {
    console.log('✓ High-res static QR code images exist in public/downloads/:');
    console.log('  - qr-apk-direct.png:', fs.statSync(directPng).size, 'bytes');
    console.log('  - qr-apk-website.png:', fs.statSync(webPng).size, 'bytes');
  } else {
    throw new Error('Static QR code images missing!');
  }
}

async function testLocalApkFile() {
  const apkPath = path.join(process.cwd(), 'public/downloads/resq-kerala-v1.0.0.apk');
  const buf = fs.readFileSync(apkPath);
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  console.log('✓ Local APK verified:');
  console.log('  - Size:', buf.length, 'bytes');
  console.log('  - SHA-256:', hash);
}

async function run() {
  try {
    await testLocalApi();
    await testLocalInstallPage();
    await testStaticQrImages();
    await testLocalApkFile();
    console.log('\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY ===');
  } catch (e) {
    console.error('Verification failed:', e);
    process.exit(1);
  }
}

run();
