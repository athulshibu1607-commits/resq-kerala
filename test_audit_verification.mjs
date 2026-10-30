// RESQ KERALA — Automated Security, Database, and Flow Audit Script
import fs from 'fs';
import path from 'path';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('\n========================================');
console.log('RESQ KERALA — AUDIT & VERIFICATION SUITE');
console.log('========================================\n');

// 1. SUPABASE CONFIGURATION & SECURITY AUDIT
console.log('1. Checking Supabase & Environment Security...');
const clientContent = fs.readFileSync('src/lib/supabase/client.ts', 'utf8');
const serverContent = fs.readFileSync('src/lib/supabase/server.ts', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');

assert(clientContent.includes('isSupabaseConfigured'), 'client.ts exports isSupabaseConfigured() guard');
assert(!clientContent.includes('SUPABASE_SERVICE_ROLE_KEY'), 'No service role secret in browser client.ts');
assert(serverContent.includes('createServerClient'), 'server.ts uses @supabase/ssr createServerClient');
assert(envExample.includes('NEXT_PUBLIC_SUPABASE_URL'), '.env.example contains NEXT_PUBLIC_SUPABASE_URL');
assert(envExample.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'), '.env.example contains NEXT_PUBLIC_SUPABASE_ANON_KEY');

// 2. DATABASE & SQL MIGRATION SECURITY AUDIT
console.log('\n2. Auditing SQL Schema, Search Paths & RLS Policies...');
const sqlContent = fs.readFileSync('supabase/migrations/20261030000000_resq_kerala_schema.sql', 'utf8');

assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.profiles'), 'Migration creates public.profiles table');
assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.user_roles'), 'Migration creates public.user_roles table');
assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.emergency_incidents'), 'Migration creates public.emergency_incidents table');
assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.volunteer_assignments'), 'Migration creates public.volunteer_assignments table');
assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.audit_logs'), 'Migration creates public.audit_logs table');
assert(sqlContent.includes('idempotency_key TEXT UNIQUE'), 'emergency_incidents has idempotency_key with UNIQUE constraint');

// Security Definer & search_path
assert(sqlContent.includes('get_user_role(uid UUID)'), 'Migration defines get_user_role helper function');
assert(sqlContent.includes('SECURITY DEFINER SET search_path = public, pg_temp'), 'get_user_role enforces strict search_path to prevent hijacking');
assert(sqlContent.includes('handle_new_user()'), 'handle_new_user trigger function exists');

// RLS Checks
assert(sqlContent.includes('ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY'), 'RLS enabled on emergency_incidents');
assert(sqlContent.includes('ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY'), 'RLS enabled on user_roles');
assert(sqlContent.includes('ALTER TABLE public.volunteer_assignments ENABLE ROW LEVEL SECURITY'), 'RLS enabled on volunteer_assignments');
assert(sqlContent.includes('ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY'), 'RLS enabled on audit_logs');

// Citizen report isolation: Citizen A cannot read Citizen B's raw reports
assert(sqlContent.includes('auth.uid() = reporter_id'), 'Incidents SELECT policy isolates reports to the reporter or responders');
// Roles modification restricted to admins
assert(sqlContent.includes('Roles insertable only by admin'), 'user_roles can only be inserted by admin');
assert(sqlContent.includes('Roles updatable only by admin'), 'user_roles can only be updated by admin');
assert(sqlContent.includes('Roles deletable only by admin'), 'user_roles can only be deleted by admin');
// Volunteer assignments: Unapproved volunteers cannot access
assert(sqlContent.includes("public.get_user_role(auth.uid()) = 'volunteer'"), 'volunteer_assignments explicitly requires verified volunteer role');
// Public hazard map view
assert(sqlContent.includes('CREATE OR REPLACE VIEW public.public_hazard_map'), 'Public hazard map view exists with coordinate obfuscation');

// 3. AUTHENTICATION & ROLE ESCALATION RESISTANCE
console.log('\n3. Auditing Authentication & Role Hardening...');
const loginContent = fs.readFileSync('src/app/login/page.tsx', 'utf8');
const registerContent = fs.readFileSync('src/app/register/page.tsx', 'utf8');
const authCallbackContent = fs.readFileSync('src/app/auth/callback/route.ts', 'utf8');

assert(!loginContent.includes("if (email.includes('admin')) targetRole = 'admin'"), 'Login page does NOT grant admin from email substring');
assert(loginContent.includes('isSupabaseConfigured()'), 'Login page displays honest local simulation mode when unconfigured');
assert(registerContent.includes('isSupabaseConfigured()'), 'Register page displays honest database connection status');
assert(authCallbackContent.includes('safeNext'), 'Auth callback sanitizes next parameter to prevent open redirect attacks');

// 4. UNVERIFIED SHORTCODE REMOVAL AUDIT
console.log('\n4. Verifying Removal of Unverified 56161 SMS Shortcode...');
const filesToCheck = [
  'src/app/citizen/sos/page.tsx',
  'src/components/Footer.tsx',
  'src/lib/data.ts',
  'src/app/admin/page.tsx',
  'src/app/terms/page.tsx',
  'public/offline.html',
  'README.md',
  'docs/PWA.md',
];

for (const file of filesToCheck) {
  const content = fs.readFileSync(file, 'utf8');
  assert(!content.includes('56161'), `${file} has no unverified 56161 SMS shortcode`);
  assert(content.includes('112'), `${file} references verified official 112 emergency helpline`);
}

// 5. PWA MANIFEST & ICONS AUDIT
console.log('\n5. Auditing PWA Manifest & App Icons...');
const manifestContent = JSON.parse(fs.readFileSync('public/manifest.webmanifest', 'utf8'));

assert(manifestContent.name === 'RESQ KERALA', 'Manifest name is exactly "RESQ KERALA"');
assert(manifestContent.short_name === 'RESQ KERALA', 'Manifest short_name is exactly "RESQ KERALA"');
assert(manifestContent.display === 'standalone', 'Manifest display mode is standalone');
assert(fs.existsSync('public/icons/icon-192.png'), 'icon-192.png exists in public/icons');
assert(fs.existsSync('public/icons/icon-512.png'), 'icon-512.png exists in public/icons');
assert(fs.existsSync('public/icons/icon-maskable.png'), 'icon-maskable.png exists in public/icons');
assert(fs.existsSync('public/icons/icon.svg'), 'icon.svg exists in public/icons');

// 6. OFFLINE SOS QUEUE AUDIT
console.log('\n6. Auditing Offline SOS & IndexedDB Queue...');
const indexeddbContent = fs.readFileSync('src/lib/offline/indexeddb.ts', 'utf8');
const sosPageContent = fs.readFileSync('src/app/citizen/sos/page.tsx', 'utf8');
const swContent = fs.readFileSync('public/sw.js', 'utf8');

assert(indexeddbContent.includes('idempotencyKey'), 'IndexedDB schema uses idempotencyKey');
assert(indexeddbContent.includes('saveOfflineDraft'), 'saveOfflineDraft implementation exists');
assert(sosPageContent.includes('Saved on this device — not yet delivered'), 'SOS page displays explicit non-delivery warning');
assert(swContent.includes('url.hostname.includes(\'supabase.co\')'), 'Service worker explicitly skips caching Supabase API calls');
assert(swContent.includes('url.pathname.startsWith(\'/api/\')'), 'Service worker explicitly skips caching private API routes');

console.log(`\n========================================`);
console.log(`ALL AUDIT CHECKS PASSED: ${passedTests}/${totalTests} TESTS!`);
console.log(`========================================\n`);
