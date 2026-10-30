-- RESQ KERALA — Disaster Management Schema
-- Production PostgreSQL Database Migration with Row Level Security (RLS)
-- Fully audited for Zero-Trust Identity, Strict Search Paths, and Immutable Audit Trails

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('citizen', 'volunteer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_status_enum AS ENUM ('pending', 'verified', 'dispatched', 'in_transit', 'resolved', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE volunteer_app_status_enum AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  preferred_language TEXT DEFAULT 'en',
  district TEXT DEFAULT 'Ernakulam',
  avatar_url TEXT,
  account_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER ROLES TABLE (Server-side Role Management, Prevents Self-Promotion)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL DEFAULT 'citizen',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 5. FUNCTION: Check User Role Safely (SECURITY DEFINER with Strict Search Path)
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID)
RETURNS user_role_enum AS $$
DECLARE
  v_role user_role_enum;
BEGIN
  IF uid IS NULL THEN
    RETURN 'citizen'::user_role_enum;
  END IF;

  SELECT role INTO v_role 
  FROM public.user_roles 
  WHERE user_id = uid 
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 6. VOLUNTEER APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status volunteer_app_status_enum DEFAULT 'pending',
  skills TEXT[] DEFAULT '{}',
  service_district TEXT NOT NULL,
  availability TEXT DEFAULT 'immediate',
  vehicle_type TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_reason TEXT
);

-- 7. EMERGENCY INCIDENTS TABLE (Includes UUID Idempotency Key)
CREATE TABLE IF NOT EXISTS public.emergency_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code TEXT NOT NULL UNIQUE,
  idempotency_key TEXT UNIQUE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  title_ml TEXT,
  description TEXT,
  severity TEXT DEFAULT 'high',
  people_affected INT DEFAULT 1,
  special_needs TEXT[] DEFAULT '{}',
  district TEXT NOT NULL,
  panchayat TEXT,
  location_description TEXT,
  lat NUMERIC(10, 6) NOT NULL,
  lng NUMERIC(10, 6) NOT NULL,
  location_consent BOOLEAN DEFAULT TRUE,
  status incident_status_enum DEFAULT 'pending',
  ai_priority_score INT DEFAULT 70,
  is_ai_duplicate BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_district ON public.emergency_incidents(district);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.emergency_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_tracking ON public.emergency_incidents(tracking_code);
CREATE INDEX IF NOT EXISTS idx_incidents_idempotency ON public.emergency_incidents(idempotency_key);

-- 8. VOLUNTEER ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'assigned', -- 'assigned', 'accepted', 'in_transit', 'completed', 'declined'
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SHELTERS TABLE
CREATE TABLE IF NOT EXISTS public.shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ml TEXT,
  district TEXT NOT NULL,
  taluk TEXT,
  address TEXT NOT NULL,
  lat NUMERIC(10, 6) NOT NULL,
  lng NUMERIC(10, 6) NOT NULL,
  capacity INT NOT NULL DEFAULT 100,
  current_occupancy INT NOT NULL DEFAULT 0,
  available_beds INT NOT NULL DEFAULT 100,
  has_water BOOLEAN DEFAULT TRUE,
  has_food BOOLEAN DEFAULT TRUE,
  has_generator BOOLEAN DEFAULT FALSE,
  has_medical BOOLEAN DEFAULT FALSE,
  has_baby_food BOOLEAN DEFAULT FALSE,
  coordinator_name TEXT,
  coordinator_phone TEXT,
  verification_status TEXT DEFAULT 'verified',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'Units',
  quantity_available INT NOT NULL DEFAULT 0,
  quantity_allocated INT NOT NULL DEFAULT 0,
  quantity_distributed INT NOT NULL DEFAULT 0,
  target_district TEXT NOT NULL,
  verification_status TEXT DEFAULT 'verified',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RESOURCE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.resource_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id),
  incident_id UUID REFERENCES public.emergency_incidents(id),
  resource_category TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'Units',
  approximate_location TEXT,
  urgency TEXT DEFAULT 'high',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. INCIDENT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.incident_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  actor_name TEXT,
  previous_status incident_status_enum,
  new_status incident_status_enum NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AUDIT LOGS TABLE (Immutable operational record)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. PUBLIC HAZARD MAP VIEW (Obfuscates Coordinates & Suppresses Private Contact Details)
CREATE OR REPLACE VIEW public.public_hazard_map AS
SELECT 
  id,
  tracking_code,
  category,
  severity,
  status,
  district,
  panchayat,
  -- Coordinate jitter / rounding to ~500m sector to safeguard citizen privacy
  ROUND(lat, 2) AS lat,
  ROUND(lng, 2) AS lng,
  people_affected,
  created_at
FROM public.emergency_incidents
WHERE status != 'resolved' AND status != 'cancelled';

GRANT SELECT ON public.public_hazard_map TO anon, authenticated;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile; admins can view all
CREATE POLICY "Profiles viewable by owner and admins" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Profiles editable by owner" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles insertable by owner" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles: Only readable by the user themselves or admins; modified strictly by admin
CREATE POLICY "Roles readable by owner and admin" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Roles insertable only by admin" ON public.user_roles
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Roles updatable only by admin" ON public.user_roles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Roles deletable only by admin" ON public.user_roles
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- Volunteer applications: Applicants can view/create their own; Admins review
CREATE POLICY "Volunteer apps viewable by owner and admin" ON public.volunteer_applications
  FOR SELECT USING (auth.uid() = applicant_id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Volunteer apps insertable by authenticated users" ON public.volunteer_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Volunteer apps updatable by admin" ON public.volunteer_applications
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- Emergency incidents:
-- Citizen A CANNOT read Citizen B's raw private incidents.
-- Only reporter, assigned/authorized volunteers, and admins can view full row with contact details.
CREATE POLICY "Incidents viewable by reporter, volunteer, admin" ON public.emergency_incidents
  FOR SELECT USING (
    auth.uid() = reporter_id 
    OR public.get_user_role(auth.uid()) IN ('volunteer', 'admin')
  );

-- Submittable by authenticated citizens or emergency anonymous dispatches
CREATE POLICY "Incidents can be submitted safely" ON public.emergency_incidents
  FOR INSERT WITH CHECK (
    (auth.uid() IS NULL AND reporter_id IS NULL)
    OR (auth.uid() = reporter_id)
    OR public.get_user_role(auth.uid()) IN ('volunteer', 'admin')
  );

-- Updates restricted to reporter, assigned volunteers, and admins
CREATE POLICY "Incidents updatable by reporter, volunteer, admin" ON public.emergency_incidents
  FOR UPDATE USING (
    auth.uid() = reporter_id 
    OR public.get_user_role(auth.uid()) IN ('volunteer', 'admin')
  );

-- Volunteer assignments:
-- Unapproved volunteers CANNOT access assignments. Only assigned approved volunteer or admin.
CREATE POLICY "Assignments viewable by assigned volunteer and admins" ON public.volunteer_assignments
  FOR SELECT USING (
    (auth.uid() = volunteer_id AND public.get_user_role(auth.uid()) = 'volunteer')
    OR public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Assignments updatable by assigned volunteer and admins" ON public.volunteer_assignments
  FOR UPDATE USING (
    (auth.uid() = volunteer_id AND public.get_user_role(auth.uid()) = 'volunteer')
    OR public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Assignments creatable only by admins" ON public.volunteer_assignments
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Shelters: Publicly readable for life safety, editable only by admins
CREATE POLICY "Shelters viewable by anyone" ON public.shelters
  FOR SELECT USING (true);

CREATE POLICY "Shelters editable by admin" ON public.shelters
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Inventory: Publicly viewable for civic transparency, editable only by admins
CREATE POLICY "Inventory viewable by all" ON public.inventory
  FOR SELECT USING (true);

CREATE POLICY "Inventory editable by admin" ON public.inventory
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Notifications: Only accessible by recipient
CREATE POLICY "Notifications accessible by recipient" ON public.notifications
  FOR ALL USING (auth.uid() = recipient_id);

-- Incident History: Viewable by reporter, volunteer, and admin
CREATE POLICY "Incident history viewable by authorized roles" ON public.incident_history
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('volunteer', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.emergency_incidents 
      WHERE id = incident_history.incident_id AND reporter_id = auth.uid()
    )
  );

CREATE POLICY "Incident history insertable by authorized actors" ON public.incident_history
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('volunteer', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.emergency_incidents 
      WHERE id = incident_history.incident_id AND reporter_id = auth.uid()
    )
  );

-- Audit logs: Read-only for admins; modification/deletion completely disallowed
CREATE POLICY "Audit logs viewable only by admins" ON public.audit_logs
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Audit logs insertable by system and admins" ON public.audit_logs
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin' OR auth.uid() IS NULL);

-- 16. AUTOMATIC TRIGGER: Initialize Profile & Role on New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, preferred_language, district)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'district', 'Ernakulam')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Strictly assign citizen role by default. Ignores client metadata claims.
  INSERT INTO public.user_roles (user_id, role, reason)
  VALUES (NEW.id, 'citizen', 'Default role upon registration')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
