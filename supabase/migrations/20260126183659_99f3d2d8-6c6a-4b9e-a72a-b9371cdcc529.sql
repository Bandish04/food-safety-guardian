-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'qa_staff');

-- Create enum for violation severity
CREATE TYPE public.violation_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Create enum for violation status
CREATE TYPE public.violation_status AS ENUM ('open', 'investigating', 'resolved', 'closed');

-- User Roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'qa_staff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  employee_id TEXT,
  department TEXT DEFAULT 'Quality Assurance',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- HACCP Critical Control Points
CREATE TABLE public.haccp_ccps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  critical_limit_min NUMERIC,
  critical_limit_max NUMERIC,
  unit TEXT NOT NULL DEFAULT '°C',
  monitoring_frequency TEXT DEFAULT 'Every 2 hours',
  corrective_action TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily Quality Checks
CREATE TABLE public.daily_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_time TIME WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIME,
  temperature NUMERIC,
  weight NUMERIC,
  hygiene_score INTEGER CHECK (hygiene_score >= 1 AND hygiene_score <= 10),
  location TEXT,
  equipment_id TEXT,
  notes TEXT,
  is_compliant BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CCP Compliance Records
CREATE TABLE public.ccp_compliance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ccp_id UUID REFERENCES public.haccp_ccps(id) ON DELETE CASCADE NOT NULL,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_time TIME WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIME,
  measured_value NUMERIC NOT NULL,
  is_compliant BOOLEAN NOT NULL,
  deviation_notes TEXT,
  corrective_action_taken TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Safety Violations
CREATE TABLE public.safety_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  violation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  severity violation_severity NOT NULL DEFAULT 'medium',
  status violation_status NOT NULL DEFAULT 'open',
  location TEXT,
  corrective_action TEXT,
  resolution_notes TEXT,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit Records
CREATE TABLE public.audit_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('internal', 'external', 'cfia', 'haccp')),
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  auditor_name TEXT NOT NULL,
  auditor_organization TEXT,
  findings TEXT,
  score NUMERIC,
  pass_status BOOLEAN NOT NULL,
  recommendations TEXT,
  follow_up_required BOOLEAN NOT NULL DEFAULT false,
  follow_up_date DATE,
  conducted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Immutable Audit Log
CREATE TABLE public.audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haccp_ccps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ccp_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Helper function to check if user is QA staff or admin
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'qa_staff')
  )
$$;

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to create profile and role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'qa_staff');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_haccp_ccps_updated_at
  BEFORE UPDATE ON public.haccp_ccps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_safety_violations_updated_at
  BEFORE UPDATE ON public.safety_violations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for haccp_ccps
CREATE POLICY "Staff can view CCPs" ON public.haccp_ccps
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can manage CCPs" ON public.haccp_ccps
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for daily_checks
CREATE POLICY "Staff can view all daily checks" ON public.daily_checks
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can create daily checks" ON public.daily_checks
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Users can update their own checks" ON public.daily_checks
  FOR UPDATE USING (auth.uid() = created_by OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete checks" ON public.daily_checks
  FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS Policies for ccp_compliance
CREATE POLICY "Staff can view compliance records" ON public.ccp_compliance
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can create compliance records" ON public.ccp_compliance
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Users can update their own compliance records" ON public.ccp_compliance
  FOR UPDATE USING (auth.uid() = created_by OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete compliance records" ON public.ccp_compliance
  FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS Policies for safety_violations
CREATE POLICY "Staff can view all violations" ON public.safety_violations
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can report violations" ON public.safety_violations
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update violations they reported or are assigned to" ON public.safety_violations
  FOR UPDATE USING (auth.uid() = reported_by OR auth.uid() = assigned_to OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete violations" ON public.safety_violations
  FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS Policies for audit_records
CREATE POLICY "Staff can view audit records" ON public.audit_records
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can create audit records" ON public.audit_records
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Admins can update audit records" ON public.audit_records
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete audit records" ON public.audit_records
  FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS Policies for audit_log (immutable - select only for staff, insert for triggers)
CREATE POLICY "Staff can view audit logs" ON public.audit_log
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- Insert some default HACCP CCPs for meat processing
INSERT INTO public.haccp_ccps (name, description, critical_limit_min, critical_limit_max, unit, monitoring_frequency, corrective_action) VALUES
  ('Cold Storage Temperature', 'Monitor refrigeration units for proper cold storage', -2, 4, '°C', 'Every 2 hours', 'Adjust thermostat, move product if necessary, report to supervisor'),
  ('Freezer Temperature', 'Monitor freezer units for proper frozen storage', NULL, -18, '°C', 'Every 4 hours', 'Check compressor, move product to backup freezer'),
  ('Cooking Internal Temperature', 'Verify internal cooking temperature of meat products', 74, NULL, '°C', 'Each batch', 'Continue cooking until minimum temperature reached'),
  ('Metal Detection', 'Check for metal contamination in finished products', 0, 0, 'ppm', 'Continuous', 'Reject product, inspect equipment, recalibrate detector'),
  ('Sanitizer Concentration', 'Verify sanitizer concentration in wash stations', 100, 200, 'ppm', 'Every 2 hours', 'Adjust concentration, re-sanitize surfaces');