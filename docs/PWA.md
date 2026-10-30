# RESQ KERALA — Progressive Web App (PWA) & Offline Architecture

This document describes the Progressive Web App implementation, caching strategies, mobile installation flows, and offline emergency limitations for RESQ KERALA.

---

## 1. PWA Specification & Web App Manifest

RESQ KERALA adheres to modern W3C Progressive Web App standards to deliver an installable, standalone mobile application on iOS, Android, and Desktop.

### Manifest Configuration (`public/manifest.webmanifest`)
- **Name**: `RESQ KERALA`
- **Short Name**: `RESQ KERALA`
- **Theme Color**: `#0A192F` (Command Navy)
- **Background Color**: `#0A192F`
- **Display**: `standalone`
- **Orientation**: `portrait-primary`
- **Scope / Start URL**: `/`
- **Icons**:
  - `public/icons/icon-192.png` (192x192 standard icon)
  - `public/icons/icon-512.png` (512x512 high-resolution icon)
  - `public/icons/icon-maskable.png` (512x512 Android adaptive maskable icon with safe zone padding)
  - `public/icons/icon.svg` (Scalable vector master)

---

## 2. Service Worker & Caching Strategy (`public/sw.js`)

The service worker implements a targeted caching lifecycle designed to balance high-speed offline access with critical operational data privacy.

```
Incoming Request
       │
       ├─► Matches /api/, /auth/, or Supabase Endpoint?
       │        └──► ALWAYS Network Only (Bypass Cache, Never Cached)
       │
       ├─► Static Shell Asset (_next/static, icons, fonts)?
       │        └──► Cache First (Return Cached, Refresh in Background)
       │
       └─► Navigation / HTML Page?
                └──► Network First ──(On Failure)──► Cached Shell or /offline.html
```

### Critical Security Boundaries
> [!CAUTION]
> **No Sensitive Data in Shared Caches**:
> The service worker explicitly prevents caching of:
> - Requests containing `/api/` or `/auth/`
> - Third-party API calls to `*.supabase.co`
> - URLs containing auth tokens, OTPs, or session cookies
> - Confidential emergency coordinate feeds or victim phone numbers
> 
> Private user reports and active dispatch requests are stored exclusively in the user's private IndexedDB instance or fetched securely over HTTPS.

---

## 3. Installation Workflows

### 3.1 Android & Chromium (WebAPK)
1. Supported browsers emit the `beforeinstallprompt` event.
2. The `InstallAppButton` and `SmartInstallBanner` intercept this event and provide a native "Install App" button.
3. Clicking "Install App" triggers the system prompt: `event.prompt()`.
4. When confirmed, the browser creates a standalone WebAPK on the user's home screen and app drawer.

### 3.2 Apple iOS (Safari)
Apple iOS does not support programmatic `beforeinstallprompt` events. RESQ KERALA detects iOS devices via `navigator.userAgent` and provides clear 4-step visual guidance:
1. Open RESQ KERALA in Safari.
2. Tap the **Share** button (box with upward arrow) on the browser toolbar.
3. Scroll down and select **"Add to Home Screen"**.
4. Confirm by tapping **"Add"** in the top right corner.

### 3.3 Desktop (Chrome / Edge / Brave)
- On desktop browsers, an install icon appears in the browser's URL address bar.
- The `InstallAppButton` activates on desktop when the install event is captured.
- Users can access `/install` at any time to inspect device-specific installation guidance or scan the runtime QR code.

---

## 4. Smart Bottom App-Install Banner (`SmartInstallBanner.tsx`)

The website includes a lightweight, non-intrusive bottom banner on mobile screens:
- **Design**: Matches the Stitch design language with the RESQ KERALA badge, title, concise value proposition, and actionable buttons.
- **Rules & Filtering**:
  - Automatically hidden on `/install`, `/login`, and `/register` to prevent obstructing authentication and form interactions.
  - Automatically hidden if the app is already running in `display-mode: standalone`.
  - Includes a visible dismiss button ("Not now" / "X").
  - Persistent dismissal: Remembers dismissal in `localStorage` under `resq_install_banner_dismissed` for 7 days to avoid annoying users.
  - Never obscures the central floating SOS button or navigation bars.

---

## 5. Offline SOS Queue & Limitations

When network connectivity is unavailable:
1. **Local Validation**: Form fields (people count, situation, district) are validated on the device.
2. **IndexedDB Storage**: The payload is stored in `resq_kerala_offline_db` with a unique idempotency key.
3. **Explicit Warning**: The UI displays:
   > **"Saved on this device — not yet delivered."**
   > *This report is saved locally. It has NOT reached first responders yet.*
4. **Automatic Foreground Sync**: As soon as `window.addEventListener('online')` fires, the application attempts to deliver all queued drafts and deletes them from IndexedDB upon server confirmation.
5. **Idempotency Guarantee**: Retries reuse the same idempotency key, preventing duplicate records if network drops midway.

> [!WARNING]
> **Emergency Helpline Notice**: A web application or PWA can never replace emergency voice lines. Users in life-threatening situations are always advised to dial **112** (Police/Emergency) or **1077** (Disaster Control Room) or send SMS to **112** (ERSS).
