# RESQ KERALA — Authentication & Identity Architecture

This document outlines the authentication lifecycle, credential security, role authorization, and session policies implemented in RESQ KERALA.

---

## 1. Authentication Provider & Architecture

RESQ KERALA utilizes **Supabase Auth** (GoTrue engine) backed by PostgreSQL Row Level Security (RLS) for zero-trust identity management.

### Key Authentication Routes
- `/login`: Secure email & password authentication with show/hide toggle, remember-me preference, accessible inline error messages, and automatic role-based destination redirection.
- `/register`: Comprehensive onboarding collecting Full Name, Email, Password (with strength metrics), Confirm Password, optional Phone Number, Language Preference (`en` / `ml`), and mandatory Privacy Notice / Terms consent.
- `/forgot-password`: Email recovery trigger requesting a secure OTP / password-reset magic link.
- `/reset-password`: Authenticated password replacement supporting minimum 8-character complexity.
- `/auth/callback`: Server-side OAuth and PKCE exchange route verifying tokens and establishing HTTP-only session cookies.

---

## 2. Server-Enforced Role Separation

RESQ KERALA strictly rejects client-supplied roles. User roles are managed via a dedicated PostgreSQL table (`user_roles`) and verified through server-side helper functions:

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'citizen',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, role)
);
```

### Role Matrix & Default Assignments

| Role | Default Assignment | Access Rights | Navigation Destination |
| :--- | :--- | :--- | :--- |
| **`citizen`** | Assigned automatically to every new signup via PostgreSQL trigger `handle_new_user` | SOS Dispatch, Incident Reporting, My Requests Tracking, Shelter Locator, Weather Telemetry, Profile & Settings | `/citizen` |
| **`volunteer`** | Requires manual application submission and administrative vetting | Available Incident Queue, 1-Tap Task Acceptance, Emergency Radio, Logistics Supplies, Assignment Completion Notes | `/volunteer` |
| **`admin`** | Granted strictly via database migration or server-side CLI (`SUPERUSER`) | Full Command Operations Room, Incident Verification & Triage, Volunteer Application Vetting, Task Assignment, Inventory Balances, Audit Logs | `/admin` |

> [!IMPORTANT]
> A citizen cannot elevate themselves to `volunteer` or `admin` via browser requests, local storage manipulation, or custom registration payloads. The database trigger and security definer function `get_user_role(auth.uid())` enforce this boundary at the database query level.

---

## 3. Account Lifecycle & Workflows

### 3.1 Registration Workflow
1. User enters profile details and consents to Terms and Location usage.
2. The client validates password match and strength (>= 8 characters).
3. `supabase.auth.signUp(...)` creates the identity in `auth.users`.
4. Trigger `on_auth_user_created` fires on PostgreSQL:
   - Inserts row into `public.profiles` (`full_name`, `phone`, `preferred_language`, `status: active`).
   - Inserts row into `public.user_roles` with `role: 'citizen'`.
5. If email confirmation is enabled on Supabase, the user is presented with a clear verification guidance banner.

### 3.2 Login & Redirection
1. The user logs in via `/login`.
2. Supabase Auth validates credentials, returning session JWTs.
3. The client queries `user_roles` via server function to obtain the user's highest role.
4. Redirection occurs based on server response:
   - `admin` $\rightarrow$ `/admin`
   - `volunteer` $\rightarrow$ `/volunteer`
   - `citizen` $\rightarrow$ `/citizen`
5. Generic error messages ("Invalid email or password") are displayed to prevent user enumeration attacks.

### 3.3 Session Persistence & Revocation
- Browser sessions utilize Supabase's secure cookie / token storage with automated token refresh.
- Logging out invalidates active tokens and clears client caches, redirecting to `/login`.
- Expired sessions gracefully prompt the user to re-authenticate without losing unsubmitted offline distress drafts stored in IndexedDB.

---

## 4. Volunteer Application & Approval Flow

1. Registered citizens apply for volunteer status under `/settings` $\rightarrow$ "Apply for Volunteer Status".
2. The user provides service area (District), availability (Immediate / Weekends / 24x7), and operational skills (First Aid, Boat Operations, Swimming, Ham Radio, Heavy Machinery).
3. An entry is created in `public.volunteer_applications` with status `pending`.
4. An Administrator reviews the application inside the `/admin` portal $\rightarrow$ "Volunteer Approvals".
5. Upon approval:
   - `volunteer_applications.status` transitions to `approved`.
   - A row with `role: 'volunteer'` is inserted into `public.user_roles`.
   - The user is notified via `public.notifications`.
   - On the next session refresh, the user is granted access to `/volunteer`.

---

## 5. Security & Privacy Guarantees
- **No Plaintext Passwords**: Passwords are never stored in application tables, never written to client logs, and never returned in API responses.
- **No Tokens in URLs**: OAuth callbacks use PKCE code exchange to prevent token leakage in browser history.
- **Rate Limiting**: Supabase Auth enforces rate limits against brute-force login and SMS OTP requests.
