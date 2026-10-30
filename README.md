# RESQ KERALA — Civic Disaster Management & Life Safety Platform

> **"One Alert. One Network. Many Lives Saved."**  
> **അടിയന്തര ദുരന്ത നിവാരണ പോർട്ടൽ - കേരളം**

**RESQ KERALA** is a production-grade, life-critical disaster management and emergency coordination platform engineered for the state of Kerala. Built upon Google Stitch mobile-first design specifications, the platform combines real-time GIS hazard mapping, offline mesh queueing, Supabase authentication & PostgreSQL database with Row Level Security (RLS), and an installable Progressive Web App (PWA) experience across iOS, Android, and Desktop.

---

## 💎 Design System & Stitch Identity Preservation

The visual direction preserves and extends the authentic Stitch design specifications:
* **Color Palette**: Deep Navy (`#0A192F` / `#0B1526`), Emergency Signal Red (`#DC2626` / `#BB0112`), Safety Emerald (`#16A34A`), Advisory Amber (`#D97706`), and Crisp Slate Base (`#F8F9FF`).
* **Tactical Command Center Dark Mode**: Low eye-fatigue slate/navy operational palette engineered for 24/7 EOC war rooms.
* **Typography**: Plus Jakarta Sans for operational headlines; Inter for high-density telemetry, coordinates, and data grids.
* **Bilingual Localization**: English and Malayalam (`അടിയന്തിരം`, `രക്ഷ`, `സന്നദ്ധസേവനം`) micro-labeling with balanced script typography.
* **Emergency Ergonomics**: 56px minimum touch targets, 3-second hold-to-transmit SOS progress ring, Web Audio API acoustic whistle beacon, and haptic feedback (`navigator.vibrate`).

---

## 🚀 Key Modules & Architecture

### 1. Authentication & Account Management (`/login`, `/register`)
* **Production Authentication**: Backed by Supabase Auth (GoTrue engine).
* **Role Separation**: Server-enforced roles (`citizen`, `volunteer`, `admin`). All new accounts receive `citizen` by default via PostgreSQL database triggers.
* **Password Management**: `/forgot-password`, `/reset-password`, and `/auth/callback` PKCE exchange.
* **Account Rights**: `/profile` management, `/settings` with volunteer application, personal data export (JSON), and account deletion.

### 2. Emergency SOS Dispatch & Offline Queue (`/citizen/sos`)
* **3-Second Hold SOS Trigger**: Interactive circular SVG progress ring with pulsing aura rings to prevent false dispatches.
* **Telemetry & Situation Tags**: GPS coordinates, stranded counter, situation toggles, and photo upload.
* **Offline IndexedDB Queue**: Submissions without connectivity are saved locally with a UUID idempotency key, displaying **"Saved on this device — not yet delivered."**
* **Automatic Sync**: Foreground retry and automatic sync when network connectivity is restored.
* **2G SMS Fallback**: 1-click fallback dispatching via Kerala ERSS Emergency SMS (`112`).

### 3. Progressive Web App (PWA) & Mobile Installation (`/install`)
* **W3C Web App Manifest**: Full standalone PWA specification (`manifest.webmanifest`).
* **Service Worker**: Cache-first for static shell assets; network-only for private APIs and Supabase endpoints; offline fallback to `/offline.html`.
* **Smart Bottom App-Install Banner**: Compact mobile banner with 7-day persistent dismissal and route filtering.
* **Dedicated `/install` Route**: Device-aware installation instructions (Android Chrome, iOS Safari Share menu, Desktop) with runtime QR code generated from site origin.

### 4. Interactive GIS Hazard & Safe Zone Map (`/map`)
* Interactive Leaflet + OpenStreetMap engine.
* Periyar River Flood Plain danger polygon and Safe High Ground plateau vector layers.
* Filter chips: Flood Risk (Red), Landslides (Amber), Safe Shelters, Medical Units, and Rescue Boats.
* **Privacy Minimization**: Public markers obfuscate precise coordinates and suppress victim names/phone numbers.

### 5. Multi-Role Portals
* **Citizen Portal (`/citizen`)**: District weather telemetry, hydro-gauge levels, flash alert banner, relief shelters directory (`/citizen/shelters`), and distress tracking (`/citizen/requests`).
* **Volunteer Portal (`/volunteer`)**: Live queue of nearby incidents, 1-tap task acceptance, tactical radio stream, and rescue equipment tracking.
* **Admin Command Center (`/admin`)**: Operations room dark mode, triage incident verification, volunteer accreditation approvals, logistics inventory management, and audit logs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 14 App Router (React 18, TypeScript) |
| **Styling** | Tailwind CSS with custom design tokens, dark mode, animations |
| **Database & Auth** | Supabase Auth, PostgreSQL 15, Row Level Security (RLS) on all 11 tables |
| **Mapping & GIS** | Leaflet, OpenStreetMap, Vector GeoJSON polygons |
| **PWA & Offline** | Web App Manifest, Service Worker (`sw.js`), IndexedDB offline queue |
| **Audio & Hardware** | Web Audio API (Synthesized Siren Oscillator), Haptic Vibrate API |
| **Icons & Fonts** | Material Symbols Outlined, Plus Jakarta Sans, Inter |

---

## 📚 Complete Project Documentation

Detailed technical documentation is available in the `docs/` directory:

* [`docs/AUTHENTICATION.md`](file:///Users/abhinavprajeev/Desktop/resq%20kerala/docs/AUTHENTICATION.md): Login, registration, role resolution, password reset, and session policies.
* [`docs/DATABASE.md`](file:///Users/abhinavprajeev/Desktop/resq%20kerala/docs/DATABASE.md): PostgreSQL schema (11 tables), relationships, triggers, functions, and RLS policies.
* [`docs/PWA.md`](file:///Users/abhinavprajeev/Desktop/resq%20kerala/docs/PWA.md): PWA manifest, service worker caching boundaries, install banner, and iOS/Android guidance.
* [`docs/SECURITY_PRIVACY.md`](file:///Users/abhinavprajeev/Desktop/resq%20kerala/docs/SECURITY_PRIVACY.md): Data minimization, location coordinate privacy, DPDP compliance, data export, and deletion.
* [`docs/TESTING.md`](file:///Users/abhinavprajeev/Desktop/resq%20kerala/docs/TESTING.md): Test matrix, route status codes, and verification report.

---

## 💻 Running Locally

### 1. Prerequisites
- Node.js 18.17+ or Node.js 20+
- npm or pnpm

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-never-expose-to-browser
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
*(Note: If Supabase credentials are not provided, the platform operates in a zero-crash demonstration/fallback mode).*

### 3. Install Dependencies
```bash
npm install
```

### 4. Apply Database Migrations (Supabase)
```bash
supabase link --project-ref your-project-ref
supabase db push
```
Or paste `supabase/migrations/20261030000000_resq_kerala_schema.sql` into the Supabase Web SQL Editor.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build
```bash
npm run build
npm run start
```

---

## 🚀 Deployment Instructions

### Vercel Deployment (Recommended)
1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://resq-kerala.vercel.app`)
4. Deploy. Vercel automatically configures HTTPS (required for Service Worker and PWA installation).
5. In your Supabase Dashboard under **Authentication ➔ URL Configuration**:
   - Set Site URL to your production domain.
   - Add `https://your-domain.vercel.app/auth/callback` to the Redirect URLs list.

---

*Disaster Response Prototype. In a real life-threatening emergency, dial **112** (Police & Fire Rescue) or **1077** (District Collectorate EOC) immediately.*
