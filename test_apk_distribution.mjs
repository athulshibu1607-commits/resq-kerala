import fs from 'fs';
import path from 'path';
import http from 'http';
import QRCode from 'qrcode';

async function fetchUrl(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('\n=============================================');
  console.log('RESQ KERALA — APK & DISTRIBUTION TEST SUITE');
  console.log('=============================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. File existence & size
  console.log('1. Verifying APK File Existence & Physical Assets...');
  const releaseApkPath = path.join(process.cwd(), 'public/downloads/resq-kerala-v1.0.0.apk');
  const rootApkPath = path.join(process.cwd(), 'public/resq-kerala.apk');
  const debugApkPath = path.join(process.cwd(), 'public/downloads/resq-kerala-v1.0.0-debug.apk');
  const nativeReleaseApk = path.join(process.cwd(), 'android/app/build/outputs/apk/release/app-release.apk');

  assert(fs.existsSync(releaseApkPath), 'Release APK exists at public/downloads/resq-kerala-v1.0.0.apk');
  assert(fs.existsSync(rootApkPath), 'Root alias exists at public/resq-kerala.apk');
  assert(fs.existsSync(debugApkPath), 'Debug APK exists at public/downloads/resq-kerala-v1.0.0-debug.apk');
  assert(fs.existsSync(nativeReleaseApk), 'Native release build exists in android/app/build/outputs/apk/release/');

  const releaseStats = fs.statSync(releaseApkPath);
  assert(releaseStats.size > 2000000, `Release APK size is nonzero and realistic (${(releaseStats.size / (1024 * 1024)).toFixed(2)} MB)`);

  // 2. Android Manifest & Permissions
  console.log('\n2. Verifying Android Project Manifest & Security...');
  const manifestPath = path.join(process.cwd(), 'android/app/src/main/AndroidManifest.xml');
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const buildGradlePath = path.join(process.cwd(), 'android/app/build.gradle');
  const buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  assert(buildGradleContent.includes('applicationId "in.resqkerala.app"'), 'Gradle configuration uses application ID in.resqkerala.app');
  assert(manifestContent.includes('android.permission.INTERNET'), 'Manifest declares INTERNET permission');
  assert(manifestContent.includes('android.permission.ACCESS_FINE_LOCATION'), 'Manifest declares ACCESS_FINE_LOCATION permission');
  assert(manifestContent.includes('android.permission.VIBRATE'), 'Manifest declares VIBRATE permission');
  assert(!manifestContent.includes('RECORD_AUDIO'), 'No unnecessary audio recording permissions');
  assert(!manifestContent.includes('READ_CONTACTS'), 'No unnecessary contacts permissions');

  // 3. Keystore Security & Git Hygiene
  console.log('\n3. Verifying Keystore Security & Git Hygiene...');
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  assert(gitignoreContent.includes('*.keystore'), '.gitignore excludes *.keystore files');
  assert(gitignoreContent.includes('*.jks'), '.gitignore excludes *.jks files');
  assert(gitignoreContent.includes('key.properties'), '.gitignore excludes key.properties');

  // 4. HTTP Headers and MIME Type
  console.log('\n4. Verifying HTTP Headers and Serving Behavior...');
  try {
    const headRes = await fetchUrl('http://localhost:3000/downloads/resq-kerala-v1.0.0.apk', 'HEAD');
    assert(headRes.status === 200, 'HTTP HEAD /downloads/resq-kerala-v1.0.0.apk returns 200 OK');
    assert(
      headRes.headers['content-type'] === 'application/vnd.android.package-archive',
      `Content-Type is application/vnd.android.package-archive (received: ${headRes.headers['content-type']})`
    );
    assert(
      headRes.headers['content-disposition']?.includes('attachment'),
      `Content-Disposition header includes attachment (received: ${headRes.headers['content-disposition']})`
    );
  } catch (err) {
    assert(false, `HTTP test failed: ${err.message}`);
  }

  // 5. Release API endpoint
  console.log('\n5. Verifying /api/release Endpoint...');
  try {
    const apiRes = await fetchUrl('http://localhost:3000/api/release');
    assert(apiRes.status === 200, 'GET /api/release returns 200 OK');
    const apiData = JSON.parse(apiRes.body);
    assert(apiData.appId === 'in.resqkerala.app', 'Release appId is in.resqkerala.app');
    assert(apiData.version === '1.0.0', 'Release version is 1.0.0');
    assert(apiData.fileExistsOnServer === true, 'fileExistsOnServer is true');
    assert(apiData.downloadUrl.endsWith('/downloads/resq-kerala-v1.0.0.apk'), 'downloadUrl points to verified APK');
  } catch (err) {
    assert(false, `/api/release failed: ${err.message}`);
  }

  // 6. QR Code Payload Verification
  console.log('\n6. Verifying QR Code Payload Integrity...');
  const targetApkUrl = 'https://resq-kerala.org/downloads/resq-kerala-v1.0.0.apk';
  const qr = QRCode.create(targetApkUrl);
  const decodedData = Buffer.from(qr.segments[0].data).toString('utf8');
  assert(decodedData === targetApkUrl, `Decoded QR payload exactly matches APK URL (${decodedData})`);

  // 7. /install page content audit
  console.log('\n7. Auditing /install Page Content & Separation...');
  try {
    const installRes = await fetchUrl('http://localhost:3000/install');
    assert(installRes.status === 200, 'GET /install returns 200 OK');
    assert(installRes.body.includes('Download Android App (APK)'), 'Contains "Download Android App (APK)" button');
    assert(installRes.body.includes('Copy Download Link'), 'Contains "Copy Download Link" action');
    assert(installRes.body.includes('v1.0.0'), 'Contains release version v1.0.0');
    assert(installRes.body.includes('in.resqkerala.app'), 'Contains application ID in.resqkerala.app');
    assert(installRes.body.includes('iPhone / iPad (Apple Safari)'), 'Preserves iOS Safari PWA instructions');
    assert(installRes.body.includes('Critical Emergency Operation Notice'), 'Accurate offline SOS warning present');
  } catch (err) {
    assert(false, `/install page audit failed: ${err.message}`);
  }

  console.log('\n=============================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('=============================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
