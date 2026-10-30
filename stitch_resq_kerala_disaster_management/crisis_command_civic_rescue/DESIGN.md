---
name: Crisis Command & Civic Rescue
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777e'
  outline-variant: '#c5c6cd'
  surface-tint: '#515f78'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#0d1c32'
  on-primary-container: '#76849f'
  inverse-primary: '#b9c7e4'
  secondary: '#bb0112'
  on-secondary: '#ffffff'
  secondary-container: '#e02928'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002109'
  on-tertiary-container: '#009842'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b9c7e4'
  on-primary-fixed: '#0d1c32'
  on-primary-fixed-variant: '#39475f'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000b'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is engineered for life-critical civic interventions, rapid emergency mobilization, and real-time community coordination. Built specifically to handle crisis environments—such as monsoon flooding, severe landslides, and coastal surges—the interface projects calm authority, unwavering reliability, and instant operational clarity. It merges a modern high-contrast emergency-grade visual language with thoughtful regional grounding for the state of Kerala.

The aesthetic fuses modern civic infrastructure with high-contrast tactical utility. It rejects decorative bloat, heavy skeuomorphism, and bandwidth-costly graphic clutter in favor of high-legibility cards, prominent state indicators, and rapid spatial recognition. Subtle regional touches—including bilingual Malayalam micro-labels (`അടിയന്തിരം` for Emergency, `രക്ഷ` for Rescue/Safe, `സന്നദ്ധസേവനം` for Volunteer) and streamlined river/wave stroke motifs—ground the interface locally without sacrificing universal cognitive speed.

### Guiding Principles
- **Clarity Under Duress:** Users may be stressed, in low-light, or handling degraded network connections. Content hierarchy prioritizes critical triage data: location, status, direct SOS actions, and verified alerts.
- **Emergency Ergonomics:** Critical controls feature generous target dimensions (minimum 48px to 56px), ultra-distinct color coding, and unambiguous tactile feedback.
- **Uncompromising Contrast:** High-contrast baseline palettes ensure outdoor sunlight readability and compliance with AAA accessibility standards for mission-critical alerts.

## Colors

The system employs a strict, semantically locked color hierarchy designed to convey triage conditions in fractions of a second.

### Palette Architecture
- **Primary Navy (`#0A192F` / `#0F2744`):** Represents structural stability, authoritative civic broadcast, and official verification. Used for core navigation, persistent topbars, primary headlines, and active structural states.
- **Alert Signal Red (`#DC2626` / `#EF4444`):** Reserved exclusively for severe distress calls, SOS actions, dam shutter warnings, flash floods, and active red alerts. Red must never be applied for non-urgent branding elements.
- **Safety Emerald (`#16A34A` / `#22C55E`):** Designates verified relief camps, cleared evacuation routes, resolved incident requests, and available shelter capacities.
- **Advisory Amber (`#D97706` / `#F59E0B`):** Flags orange alerts, rising river levels, isolated landslide risks, and pending verification states.
- **Cool Slate Neutrals (`#F8FAFC` base, `#F1F5F9` surfaces, `#E2E8F0` borders, `#64748B` secondary text, `#0F172A` body text):** Establishes clean, clinical separations between triage feeds, form panels, and spatial maps.

In dark situations or critical field use, the high-contrast light baseline prevents optical vibration, while full-bleed alert headers inject distinct, unmistakable visual weight.

## Typography

Typography prioritizes cognitive speed, reading stamina, and uncompromised legibility on lower-tier smartphone displays.

### Font Pairing
- **Headlines (Plus Jakarta Sans):** Balanced geometric curves provide immediate modern presence, high visual authority, and clear letterform distinction for critical triage titles and rapid status scans.
- **Body & Data Displays (Inter):** Highly legible neutral grotesque with tall x-height, distinct aperture tracking, and clear numerical figures. Ideal for GPS coordinates, victim counts, emergency contacts, and dual-script Malayalam/English subtext.

### Regional Bilingual Layout
When displaying Malayalam bilingual hints alongside English labels, render the Malayalam script at `0.9em` sizing with an opacity of `80%` inline or directly beneath the primary descriptor. Avoid excessive serif detailing to guarantee pixel clarity under wet screens or direct sun glare.

## Layout & Spacing

The layout is built on a 12-column adaptive fluid grid engineered for operational situational awareness.

### Breakpoints & Flow
- **Mobile (< 768px):** 4 columns, `margin: 1rem`, `gutter: 1rem`. High-priority elements (SOS trigger, quick alert ticker, current location broadcast) take stacked 4-column span. Primary actions pin to the thumb zone at the bottom of the viewport.
- **Tablet (768px - 1023px):** 8 columns, `margin-md: 2rem`, `gutter-md: 1.5rem`. Split-screen balance featuring map telemetry alongside operational rescue incident queues.
- **Desktop (≥ 1024px):** 12 columns, `margin-lg: 3rem`, `gutter-lg: 2rem`, max-width bounded at 1440px to eliminate excessive horizontal eye fatigue. Standard split: 4 columns for district incident filter/triage, 8 columns for interactive GIS live-feed and camp capacity tables.

Spacing tokens follow a strict 4px/8px rhythm. Compact spacing (`space-xs` and `space-sm`) handles tight telemetry data grids, while generous touch container paddings (`space-md` and `space-lg`) prevent accidental tap errors during distress submissions.

## Elevation & Depth

This design system uses **tonal layer stacking combined with clean, low-contrast structural outlines**, deliberately minimizing heavy dark drop shadows that degrade visual legibility on battery-saver or budget screens.

### Elevation Architecture
- **Level 0 (Base Canvas):** `#F8FAFC`. Clean, non-distracting slate background.
- **Level 1 (Card & Section Containers):** `#FFFFFF` with a crisp `1px` solid outline in `#E2E8F0`. No drop shadow required in resting state.
- **Level 2 (Interactive Floating Modules & Modals):** `#FFFFFF` paired with a soft ambient outline (`#CBD5E1`) and an ultra-diffused shadow: `0 8px 24px -4px rgba(10, 25, 47, 0.08)`.
- **Level 3 (Emergency Overlays & Urgent Drawers):** High-contrast sheet elevated via `0 16px 36px -6px rgba(10, 25, 47, 0.16)` bordered with a distinct top accent strip denoting triage state.

### Alert Layering & Pulse Signaling
To indicate active, unacknowledged emergencies (e.g., active water rescue requests), critical cards incorporate a dynamic glowing pulse border: an animated outer spread `0 0 0 4px rgba(220, 38, 38, 0.25)` cycling to `0 0 0 0px rgba(220, 38, 38, 0)` that captures attention without occluding adjacent information.

## Shapes

The design system applies a balanced **Rounded (`roundedness: 2`)** aesthetic, standardizing on soft yet disciplined geometric silhouettes:
- Base standard radius: `0.5rem` (8px) for buttons, inputs, chips, and small alert banners.
- Large radius (`rounded-lg`): `1rem` (16px) for telemetry cards, operational dashboards, and incident request summaries.
- Extra-large radius (`rounded-xl` / `rounded-2xl`): `1.5rem` to `2rem` for primary emergency dialogs, high-impact SOS triggers, and interactive map bottom-sheets.

This shape approach avoids severe brutalist angles—which increase cognitive stress—while remaining structured and authoritative. Pill-shaped geometry is strictly restricted to status tags, category chips, and live notification counters.

## Components

### Buttons & SOS Controls
- **SOS Critical Action:** Minimum height 56px, high-visibility red (`#DC2626`), high-contrast white text (`#FFFFFF`), `rounded-xl`, bold label with dual-script subtitle (`അടിയന്തിരം | SEND SOS`). Equipped with a haptic 1.5s press-and-hold trigger to avoid accidental activation.
- **Primary Navy:** `#0A192F` fill, `#FFFFFF` text, `rounded-lg`, 48px height. Used for confirmations, report submissions, and volunteer check-ins.
- **Secondary / Ghost:** Transparent fill, `1.5px` border in `#CBD5E1`, `#0F2744` text.
- **Safe State Action:** `#16A34A` fill, white text, designated for marking individuals or zones as safe (`രക്ഷപെട്ടു / I AM SAFE`).

### Status Chips & Badges
- **Pill Geometry (12px vertical padding, 16px horizontal):**
  - **Red Alert:** Solid `#FEF2F2` background, `#B91C1C` text, `1px` border `#FCA5A5`, featuring an active pulsating red dot indicator.
  - **Amber Advisory:** Solid `#FFFBEB` background, `#B45309` text, `1px` border `#FCD34D`.
  - **Safe Zone:** Solid `#F0FDF4` background, `#15803D` text, `1px` border `#86EFAC`.
  - **Neutral / Informational:** `#F1F5F9` background, `#334155` text, `#CBD5E1` border.

### Incident & Camp Cards
- Built on `#FFFFFF` base, `16px` border radius, `1px` outer border in `#E2E8F0`.
- Includes a dedicated 4px left-hand triage accent bar keyed to the emergency status (Red, Amber, or Green).
- Header row contains the bilingual incident title, real-time relative timestamp ("3m ago"), and status chip.
- Content body highlights pinned telemetry: GPS Coordinates / Panchayat name, people trapped count, and specialized tags (e.g., `Infant`, `Elderly`, `Medical Needs`).

### Input Fields
- Height 48px, background `#FFFFFF`, border `1.5px` solid `#CBD5E1`, corner radius `8px`.
- Focus state: Border color changes to Primary Navy (`#0A192F`) with a `3px` focus ring in `rgba(15, 39, 68, 0.15)`.
- Input fields display localized placeholder hints in English with Malayalam auxiliary text.

### Checkboxes & Segmented Controls
- Checkboxes: 20px x 20px, high-contrast checkmark, `4px` corner radius.
- Segmented switch for district views (e.g., `Wayanad`, `Idukki`, `Alappuzha`): Solid slate background (`#F1F5F9`), selected tab elevated in white with Navy typography.

### Specialized Crisis Components
- **Water Level Gauge Card:** Vertical bar meter showing current reservoir/river capacity vs. danger line with rapid visual warning markers.
- **Offline Sync Indicator:** Persistent top badge indicating cached offline operations when connectivity drops, syncing queued SOS payloads automatically upon network reconnection.