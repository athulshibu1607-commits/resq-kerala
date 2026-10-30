# RESQ KERALA — Security & Data Privacy Framework

This document outlines the security controls, data minimization practices, emergency location handling, and compliance policies implemented across the RESQ KERALA disaster coordination platform.

---

## 1. Principles of Data Minimization

RESQ KERALA collects only the minimum personal data strictly necessary to coordinate humanitarian rescue and deliver emergency relief:
- **Registration**: Name and Email are mandatory for authentication. Phone number is requested optionally for emergency contact.
- **SOS Submissions**: Distress requests collect location coordinates and situational requirements (e.g. stranded count, medical urgency).
- **Public Displays**: Victim names, personal contact numbers, and precise residence coordinates are **never published on public maps or feeds**.

---

## 2. Emergency Location Privacy & Coordinate Obfuscation

Emergency coordinates require careful handling to protect vulnerable citizens during natural disasters:

```
Citizen Distress Coordinates (e.g., 10.1076° N, 76.3516° E)
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
Public GIS Hazard Map            Authorized Command / First Responders
  - Truncated / Jittered           - High-Precision GPS
  - Obfuscated to ~500m Sector     - Direct Rescue Coordinates
  - No personal victim names       - Encrypted in Transit & at Rest
  - No victim telephone numbers    - Restricted via PostgreSQL RLS
```

1. **Explicit Location Consent**:
   - Location is captured only after the citizen gives browser permission via the Geolocation API.
   - An explicit toggle allows users to submit manual landmarks if GPS permission is withheld.
2. **Access Control**:
   - Only authenticated First Responders assigned to an incident and verified District EOC Administrators can view raw GPS coordinates and victim telephone numbers.
   - Database Row Level Security (RLS) filters coordinate precision based on `get_user_role(auth.uid())`.

---

## 3. Account Rights: Export & Deletion Workflows

In accordance with modern privacy principles and India's Digital Personal Data Protection (DPDP) Act:

### 3.1 Data Portability (JSON Export)
- Users can export a complete machine-readable copy of their personal records at any time via `/settings` $\rightarrow$ "Export Personal Data Archive".
- The export package includes:
  - Account profile (`profiles`)
  - Assigned roles (`user_roles`)
  - Submitted emergency requests (`emergency_incidents`)
  - Volunteer records (`volunteer_assignments`)
  - User notifications (`notifications`)

### 3.2 Right to Erasure / Account Deletion
- Users can initiate account deletion via `/settings` $\rightarrow$ "Request Account Deletion".
- To preserve operational triage integrity and prevent evidence tampering during active disaster events:
  - Incident logs associated with past rescue dispatches are anonymized (personal names and phone numbers redacted) rather than deleted outright, maintaining aggregate disaster statistics.
  - Active credentials, profile entries, and notification records are permanently deleted.

---

## 4. Platform Security Controls

### 4.1 Server-Side Role Enforcement
- Client-side role claims are completely untrusted.
- Roles are queried server-side from `public.user_roles` using the user's validated JWT `auth.uid()`.
- Self-promotion attacks (e.g., attempting to write `role = 'admin'`) are blocked by PostgreSQL RLS policies that reject non-admin modifications to `user_roles`.

### 4.2 Idempotent Emergency Submissions
- Every offline SOS draft generates a UUID `idempotency_key`.
- The database enforces a `UNIQUE(idempotency_key)` constraint on `emergency_incidents`.
- If an unreliable mobile connection causes a client to submit the same draft multiple times, the database safely ignores duplicates and acknowledges the existing incident.

### 4.3 Content Security & Headers
- Production deployments must configure strict security headers:
  - `Content-Security-Policy`: Restricts script and frame execution.
  - `X-Frame-Options: DENY`: Mitigates clickjacking.
  - `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
  - `Referrer-Policy: strict-origin-when-cross-origin`: Prevents coordinate leakage in referrer headers.
  - `Strict-Transport-Security`: Enforces HTTPS.

### 4.4 Audit Logging
- Critical operational actions (approving volunteers, modifying shelter capacities, reassigning rescue tasks) automatically generate records in `public.audit_logs`.
- Normal users cannot alter or truncate the audit log.
