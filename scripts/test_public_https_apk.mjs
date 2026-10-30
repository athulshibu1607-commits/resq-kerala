import https from 'https';
import crypto from 'crypto';
import QRCode from 'qrcode';

const BASE_URL = 'https://kilometers-trusts-casual-belief.trycloudflare.com';

function fetchHttps(url, options = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          buffer,
          text: buffer.toString('utf8'),
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('\n======================================================');
  console.log('PUBLIC HTTPS DEPLOYMENT & APK VERIFICATION');
  console.log('Target Base URL:', BASE_URL);
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Verify Public Release API
  console.log('1. Testing /api/release over Public HTTPS...');
  const apiRes = await fetchHttps(`${BASE_URL}/api/release`);
  assert(apiRes.statusCode === 200, `API returns HTTP 200 (received: ${apiRes.statusCode})`);
  const meta = JSON.parse(apiRes.text);
  assert(meta.appId === 'in.resqkerala.app', `appId is in.resqkerala.app (received: ${meta.appId})`);
  assert(meta.version === '1.0.0', `version is 1.0.0 (received: ${meta.version})`);
  assert(meta.fileExistsOnServer === true, 'fileExistsOnServer is true');
  assert(
    meta.downloadUrl === `${BASE_URL}/downloads/resq-kerala-v1.0.0.apk`,
    `downloadUrl matches public HTTPS tunnel (${meta.downloadUrl})`
  );

  // 2. Verify APK Download over Public HTTPS
  console.log('\n2. Testing /downloads/resq-kerala-v1.0.0.apk Download...');
  const apkRes = await fetchHttps(`${BASE_URL}/downloads/resq-kerala-v1.0.0.apk`);
  assert(apkRes.statusCode === 200, `APK download returns HTTP 200 (received: ${apkRes.statusCode})`);
  assert(
    apkRes.headers['content-type'] === 'application/vnd.android.package-archive',
    `Content-Type is application/vnd.android.package-archive (received: ${apkRes.headers['content-type']})`
  );
  assert(
    apkRes.headers['content-disposition']?.includes('attachment'),
    `Content-Disposition is attachment (received: ${apkRes.headers['content-disposition']})`
  );
  assert(apkRes.buffer.length === 3412537, `Byte count is exact 3,412,537 bytes (received: ${apkRes.buffer.length})`);

  // Magic bytes check (ZIP format: 0x50 0x4B 0x03 0x04)
  const magic = apkRes.buffer.subarray(0, 4);
  const isZip = magic[0] === 0x50 && magic[1] === 0x4b && magic[2] === 0x03 && magic[3] === 0x04;
  assert(isZip, `APK magic bytes match standard Android ZIP/APK container (0x504B0304)`);

  // SHA-256 Checksum Verification
  const hash = crypto.createHash('sha256').update(apkRes.buffer).digest('hex');
  assert(
    hash === '2c07ff86d8aef41d892d11de74da56898442d14ad1d18f54d816e5e34c581f72',
    `SHA-256 checksum matches verified release (${hash})`
  );

  // 3. Verify Direct Alias /resq-kerala.apk
  console.log('\n3. Testing Root Alias /resq-kerala.apk...');
  const aliasRes = await fetchHttps(`${BASE_URL}/resq-kerala.apk`);
  assert(aliasRes.statusCode === 200, `Root alias returns HTTP 200 (received: ${aliasRes.statusCode})`);
  assert(
    aliasRes.headers['content-type'] === 'application/vnd.android.package-archive',
    `Content-Type is application/vnd.android.package-archive`
  );
  assert(aliasRes.buffer.length === 3412537, `Byte count matches release`);

  // 4. Verify QR Code Encoding for Public URL
  console.log('\n4. Testing QR Code Encoding on Public URL...');
  const qr = QRCode.create(meta.downloadUrl);
  const decoded = Buffer.from(qr.segments[0].data).toString('utf8');
  assert(decoded === meta.downloadUrl, `QR payload decodes exactly to ${meta.downloadUrl}`);

  // 5. Verify /install Page over Public HTTPS
  console.log('\n5. Testing /install Page over Public HTTPS...');
  const installRes = await fetchHttps(`${BASE_URL}/install`);
  assert(installRes.statusCode === 200, `Install page returns HTTP 200 OK`);
  assert(!installRes.text.includes('APK Not Published Yet'), 'Page displays active ready status');

  console.log('\n======================================================');
  console.log(`TOTAL PUBLIC CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

run();
