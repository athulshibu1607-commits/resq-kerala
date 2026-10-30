# RESQ KERALA — Database & RLS Architecture

This document describes the PostgreSQL relational data model, triggers, security functions, Row Level Security (RLS) policies, and migration instructions for RESQ KERALA.

---

## 1. Schema Overview

The database schema is defined declaratively in `supabase/migrations/20261030000000_resq_kerala_schema.sql`. It establishes 11 interrelated operational tables with foreign key cascades, check constraints, composite unique indexes, and audit logging.

```
                          ┌──────────────────────────┐
                          │       auth.users         │
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┼───────────────────────────┐
           ▼                            ▼                           ▼
┌────────────────────┐       ┌────────────────────┐      ┌─────────────────────────┐
│     profiles       │       │    user_roles      │      │ volunteer_applications  │
└────────────────────┘       └────────────────────┘      └─────────────────────────┘
           │
           ├────────────────────────────┬───────────────────────────┐
           ▼                            ▼                           ▼
┌────────────────────┐       ┌────────────────────┐      ┌─────────────────────────┐
│emergency_incidents │◄──────┤volunteer_assignment│      │      notifications      │
└──────────┬─────────┘       └────────────────────┘      └─────────────────────────┘
           │
           ├────────────────────────────┐
           ▼                            ▼
┌────────────────────┐       ┌────────────────────┐
│  incident_history  │       │     audit_logs     │
└────────────────────┘       └────────────────────┘

┌────────────────────┐       ┌────────────────────┐      ┌─────────────────────────┐
│     shelters       │       │     inventory      │      │    resource_requests    │
└────────────────────┘       └────────────────────┘      └─────────────────────────┘
```

---

## 2. Table Specifications

### 2.1 Identity & User Profiles
- **`public.profiles`**: Contains citizen/responder identity metadata.
  - Columns: `id (UUID PK)`, `email`, `full_name`, `phone`, `preferred_language`, `avatar_url`, `status`, `created_at`, `updated_at`.
- **`public.user_roles`**: Authoritative role mappings (`citizen`, `volunteer`, `admin`).
  - Columns: `id (UUID PK)`, `user_id`, `role`, `granted_by`, `granted_at`, `notes`.
  - Constraint: `UNIQUE (user_id, role)`.
- **`public.volunteer_applications`**: Citizen applications for emergency response accreditation.
  - Columns: `id`, `applicant_id`, `status` (`pending`, `approved`, `rejected`), `skills (TEXT[])`, `service_area`, `availability`, `reviewer_id`, `reviewed_at`, `review_notes`.

### 2.2 Operational Incident Management
- **`public.emergency_incidents`**: Central distress repository for live and synced SOS submissions.
  - Columns: `id`, `tracking_code (UNIQUE)`, `reporter_id`, `category` (`boat_rescue`, `medical_critical`, `trapped_water`, `food_water`, `infant_elderly`, `landslide`), `severity` (`low`, `moderate`, `high`, `critical`), `status` (`reported`, `verified`, `assigned`, `in_progress`, `resolved`, `cancelled`), `title`, `title_ml`, `description`, `people_affected`, `lat`, `lng`, `district`, `location_description`, `special_needs`, `ai_priority_score (1-100)`, `contact_name`, `contact_phone`, `photo_url`, `location_consent_granted`, `idempotency_key (UNIQUE)`.
- **`public.volunteer_assignments`**: Field worker assignments for task dispatch.
  - Columns: `id`, `incident_id`, `volunteer_id`, `assigned_by`, `status` (`pending`, `accepted`, `in_progress`, `completed`, `cancelled`), `accepted_at`, `started_at`, `completed_at`, `completion_notes`.
- **`public.incident_history`**: Immutably records every status transition for compliance and triage audits.
  - Columns: `id`, `incident_id`, `actor_id`, `previous_status`, `new_status`, `change_reason`, `created_at`.

### 2.3 Relief Logistics & Infrastructure
- **`public.shelters`**: Official relief camp directories with real-time occupancy.
  - Columns: `id`, `name`, `district`, `location_description`, `lat`, `lng`, `capacity`, `occupancy`, `available_beds`, `contact_phone`, `has_water`, `has_food`, `has_medical`, `has_sanitation`, `is_verified`, `last_verified_at`.
- **`public.inventory`**: District collectorate emergency stockpiles.
  - Columns: `id`, `name`, `category` (`medical`, `food`, `water`, `rescue_equipment`, `shelter_supplies`), `unit`, `reported_qty`, `allocated_qty`, `distributed_qty`, `district`, `storage_location`, `is_verified`, `updated_by`.
- **`public.resource_requests`**: Material requisition tickets from shelters and relief camps.
  - Columns: `id`, `requester_id`, `category`, `quantity`, `unit`, `urgency` (`routine`, `urgent`, `critical`), `status` (`open`, `approved`, `dispatched`, `fulfilled`, `rejected`), `location_description`, `district`.

### 2.4 Telemetry & Compliance
- **`public.notifications`**: Targeted user alerts (rescue updates, volunteer call-outs).
  - Columns: `id`, `recipient_id`, `type`, `title`, `message`, `is_read`, `read_at`, `created_at`.
- **`public.audit_logs`**: Tamper-resistant compliance ledger.
  - Columns: `id`, `actor_id`, `action`, `target_table`, `target_id`, `metadata (JSONB)`, `created_at`.

---

## 3. Database Security & Row Level Security (RLS)

RLS is activated on all 11 tables using `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.

### Role Resolution Helper Function
To avoid recursive policy lookups, a secure `SECURITY DEFINER` function resolves the caller's role:

```sql
CREATE OR REPLACE FUNCTION public.get_user_role(lookup_uid UUID)
RETURNS user_role_enum
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role user_role_enum;
BEGIN
  IF lookup_uid IS NULL THEN
    RETURN 'citizen'::user_role_enum;
  END IF;

  SELECT role INTO v_role 
  FROM public.user_roles 
  WHERE user_id = lookup_uid 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'volunteer' THEN 2 
      ELSE 3 
    END 
  LIMIT 1;

  IF v_role IS NULL THEN
    RETURN 'citizen'::user_role_enum;
  END IF;

  RETURN v_role;
END;
$$;
```

### Policy Rules Enforced

1. **Profiles**:
   - Citizens can view and update only their own profile (`auth.uid() = id`).
   - Admins can inspect profiles for operational dispatch.
2. **User Roles**:
   - Users can read their own roles.
   - Only `admin` role holders can insert, update, or delete rows in `user_roles`. Self-promotion is strictly blocked.
3. **Emergency Incidents**:
   - Citizens can view only their own reported incidents (`auth.uid() = reporter_id`). Citizen A cannot query Citizen B's private distress report.
   - Verified volunteers and admins can inspect active incidents for dispatch.
   - Public map displays query the view `public.public_hazard_map`, which jitter-rounds coordinates to ~500m sectors and suppresses victim names and phone numbers.
   - Unique constraint on `idempotency_key` ensures retried dispatches never create duplicate incidents.
4. **Volunteer Assignments**:
   - Volunteers can view assignments directed to their `user_id`.
   - Volunteers can update status only on their own active assignments (`volunteer_id = auth.uid()`).
   - Administrators can assign tasks and reassign workloads.
5. **Audit Logs**:
   - Only administrators have read access. Modification (`UPDATE` or `DELETE`) is completely disabled for all users.

---

## 4. Migration Execution Guide

To initialize or apply this schema to your Supabase project:

### Using Supabase CLI (Recommended)
```bash
# Link project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

### Using Supabase Web Dashboard
1. Navigate to the **SQL Editor** tab in your Supabase project dashboard.
2. Open `supabase/migrations/20261030000000_resq_kerala_schema.sql`.
3. Paste the contents into the editor and click **Run**.
4. Verify all 11 tables appear under the **Table Editor** with RLS enabled.
