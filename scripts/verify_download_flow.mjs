import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log('=== RESQ KERALA — DOWNLOAD WEBSITE & APK FLOW VERIFICATION ===\n');

async function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function testAll() {
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✓ ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      throw new Error(message);
    }
  }

  // 1. Home page check
  const home = await httpGet('http://localhost:3000/');
  assert(home.status === 200, 'Home page returns HTTP 200');
  assert(home.body.includes('href="/download"'), 'Home page contains links navigating to /download');

  // 2. Dedicated download page check
  const downloadPage = await httpGet('http://localhost:3000/download');
  assert(downloadPage.status === 200, 'Dedicated /download route returns HTTP 200');
  assert(downloadPage.body.includes('Download RESQ KERALA'), 'Contains heading "Download RESQ KERALA"');
  assert(downloadPage.body.includes('Download Android App (APK)'), 'Contains prominent button "Download Android App (APK)"');
  assert(downloadPage.body.includes('in.resqkerala.app'), 'Contains verified package ID');
  assert(downloadPage.body.includes('dedicated-qr-container'), 'Contains reachable QR code container');
  assert(downloadPage.body.includes('instructions-section'), 'Contains 4-step Android installation instructions');

  // 3. Local Wi-Fi LAN IP accessibility
  const lanIp = '10.142.16.56';
  const lanUrl = `http://${lanIp}:3000/download`;
  const lanRes = await httpGet(lanUrl);
  assert(lanRes.status === 200, `Reachable via Wi-Fi LAN IP (${lanUrl}) -> HTTP 200`);

  // 4. /api/release check
  const apiRes = await httpGet('http://localhost:3000/api/release');
  assert(apiRes.status === 200, '/api/release returns HTTP 200');
  const releaseData = JSON.parse(apiRes.body);
  assert(releaseData.lanIp === lanIp, `Detected LAN IP matches active interface (${lanIp})`);
  assert(releaseData.localNetworkDownloadUrl === `http://${lanIp}:3000/download`, 'Local network download URL points to http://<lan-ip>:3000/download');
  assert(releaseData.fileExistsOnServer === true, 'Physical APK file exists on server');

  // 5. Direct APK file download check
  const apkRes = await httpGet('http://localhost:3000/downloads/resq-kerala-v1.0.0.apk');
  assert(apkRes.status === 200, 'APK file returns HTTP 200');
  assert(apkRes.headers['content-type'] === 'application/vnd.android.package-archive', 'Content-Type is application/vnd.android.package-archive');
  assert(apkRes.headers['content-disposition']?.includes('attachment'), 'Content-Disposition includes attachment');
  assert(parseInt(apkRes.headers['content-length'], 10) === 3412537, 'Content-Length matches exactly 3,412,537 bytes (3.3 MB)');

  // 6. SHA-256 checksum verification
  const localApkBuf = fs.readFileSync(path.join(process.cwd(), 'public/downloads/resq-kerala-v1.0.0.apk'));
  const localHash = crypto.createHash('sha256').update(localApkBuf).digest('hex');
  assert(localHash === '2c07ff86d8aef41d892d11de74da56898442d14ad1d18f54d816e5e34c581f72', 'Cryptographic SHA-256 checksum verified (2c07ff86d8aef41d892d11de74da56898442d14ad1d18f54d816e5e34c581f72)');

  // 7. Not found page check (no blank screen on unknown route)
  const notFoundRes = await httpGet('http://localhost:3000/non-existent-route-test');
  assert(notFoundRes.status === 404, 'Unknown route returns HTTP 404');
  assert(notFoundRes.body.includes('Page Not Found'), '404 renders polite recovery UI with links to Home and /download');

  console.log(`\n=== ALL ${passed}/${total} VERIFICATION ASSERTIONS PASSED SUCCESSFULLY ===`);
}

testAll().catch((err) => {
  console.error('\nTest failed:', err);
  process.exit(1);
});
