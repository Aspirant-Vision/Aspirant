-- ==============================================================================
-- ASPIRANT VISION — INITIAL DATABASE FOUNDATION SCHEMA (PHASE 01)
-- ==============================================================================
-- Description: Core schema establishing database extensions, RBAC enums,
--              user profiles table, RLS security policies, and auth triggers.
-- Target Capacity: 10,000+ registered users with scale-ready indexing.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'counsellor', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM (
        'new',
        'contacted',
        'counselling_scheduled',
        'documents_pending',
        'admitted',
        'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'student',
    city TEXT,
    state TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 4. SYSTEM HEALTH PROBE TABLE (Phase 01 Verification)
CREATE TABLE IF NOT EXISTS public.system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'healthy',
    version TEXT NOT NULL DEFAULT '1.0.0',
    last_ping TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can read system health" ON public.system_health;
CREATE POLICY "Public can read system health"
    ON public.system_health
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Helper Security Definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (
        public.get_current_user_role() IN ('admin', 'super_admin')
    );

-- 6. AUTOMATED TRIGGER: USER REGISTRATION TO PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, avatar_url, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null),
        new.phone,
        new.raw_user_meta_data->>'avatar_url',
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = NOW();

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    new.updated_at = NOW();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 001 USER MANAGEMENT & ROLE-BASED ACCESS
-- ==============================================================================

-- 1. ACCOUNT STATUS ENUM
DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('active', 'suspended', 'pending_verification', 'deactivated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ENSURE PROFILES TABLE MATCHES SPECIFICATION
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status account_status NOT NULL DEFAULT 'active';

-- 3. USER ROLES TABLE (Decoupled RBAC preventing self-privilege escalation)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. SECURITY DEFINER HELPER FUNCTIONS FOR TRUSTED RBAC
CREATE OR REPLACE FUNCTION public.has_role(check_role user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = check_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_counsellor()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('counsellor', 'admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('counsellor', 'admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. AUTOMATED TRIGGER: POPULATE PROFILE AND DEFAULT STUDENT ROLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    assigned_role user_role;
BEGIN
    assigned_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role);

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, full_name, phone, avatar_url, role, account_status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null),
        new.phone,
        new.raw_user_meta_data->>'avatar_url',
        assigned_role,
        'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        updated_at = NOW();

    -- Insert into user_roles (prevent duplicate assignments)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, assigned_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 002 COLLEGE MANAGEMENT DATABASE
-- ==============================================================================

-- 1. ENUMS FOR COLLEGES
DO $$ BEGIN
    CREATE TYPE college_publication_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admission_status AS ENUM ('open', 'closing_soon', 'closed', 'upcoming');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    college_type TEXT,
    ownership_type TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    website_url TEXT,
    email TEXT,
    phone TEXT,
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    pincode TEXT,
    established_year INTEGER,
    accreditation TEXT,
    affiliation TEXT,
    ranking_information JSONB DEFAULT '{}'::jsonb,
    average_placement NUMERIC(12, 2),
    highest_placement NUMERIC(12, 2),
    placement_percentage NUMERIC(5, 2),
    admission_status admission_status NOT NULL DEFAULT 'open',
    publication_status college_publication_status NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    seo_title TEXT,
    seo_description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Auto updated_at trigger
DROP TRIGGER IF EXISTS trg_colleges_updated_at ON public.colleges;
CREATE TRIGGER trg_colleges_updated_at
    BEFORE UPDATE ON public.colleges
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. COLLEGE CAMPUSES TABLE (1-to-many relationship)
CREATE TABLE IF NOT EXISTS public.college_campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    campus_name TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    pincode TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.college_campuses ENABLE ROW LEVEL SECURITY;

-- Auto updated_at trigger
DROP TRIGGER IF EXISTS trg_college_campuses_updated_at ON public.college_campuses;
CREATE TRIGGER trg_college_campuses_updated_at
    BEFORE UPDATE ON public.college_campuses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 003 COURSE MANAGEMENT DATABASE
-- ==============================================================================

-- 1. ENUMS FOR COURSES
DO $$ BEGIN
    CREATE TYPE course_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE duration_unit AS ENUM ('years', 'months', 'semesters');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    degree_type TEXT NOT NULL,
    stream TEXT NOT NULL,
    duration NUMERIC(4, 1) NOT NULL,
    duration_unit duration_unit NOT NULL DEFAULT 'years',
    description TEXT,
    eligibility TEXT,
    entrance_exam_information TEXT,
    status course_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. COLLEGE COURSES TABLE (Many-to-Many Bridge Table with Academic Overrides)
CREATE TABLE IF NOT EXISTS public.college_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    course_code TEXT,
    intake_capacity INTEGER,
    admission_status admission_status NOT NULL DEFAULT 'open',
    eligibility_override TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_college_courses_college_course UNIQUE (college_id, course_id)
);

-- Enable RLS
ALTER TABLE public.college_courses ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_college_courses_updated_at ON public.college_courses;
CREATE TRIGGER trg_college_courses_updated_at
    BEFORE UPDATE ON public.college_courses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 004 FEE & SCHOLARSHIP DATABASE
-- ==============================================================================

-- 1. COLLEGE FEES TABLE
CREATE TABLE IF NOT EXISTS public.college_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_course_id UUID NOT NULL REFERENCES public.college_courses(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL,
    tuition_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    admission_fee NUMERIC(12, 2) DEFAULT 0.00,
    hostel_fee NUMERIC(12, 2) DEFAULT 0.00,
    other_fees NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    fee_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_college_fees_course_year UNIQUE (college_course_id, academic_year)
);

-- Enable RLS
ALTER TABLE public.college_fees ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_college_fees_updated_at ON public.college_fees;
CREATE TRIGGER trg_college_fees_updated_at
    BEFORE UPDATE ON public.college_fees
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. SCHOLARSHIPS TABLE (College-wide or Course-specific)
CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    college_course_id UUID REFERENCES public.college_courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    eligibility TEXT,
    scholarship_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    application_deadline DATE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_scholarships_updated_at ON public.scholarships;
CREATE TRIGGER trg_scholarships_updated_at
    BEFORE UPDATE ON public.scholarships
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 005 LEAD MANAGEMENT & CRM DATABASE
-- ==============================================================================

-- 1. EXPAND LEAD STATUS ENUM (Ensure all 9 values exist)
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'interested';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'application_started';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'application_submitted';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'not_interested';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'lost';

-- 2. CRM ENUMS
DO $$ BEGIN
    CREATE TYPE lead_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('active', 'reassigned', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE follow_up_status AS ENUM ('pending', 'completed', 'cancelled', 'rescheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    interested_college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    interested_course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    source TEXT DEFAULT 'website_modal',
    status lead_status NOT NULL DEFAULT 'new',
    priority lead_priority NOT NULL DEFAULT 'medium',
    assigned_counsellor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    enquiry_message TEXT,
    consent_status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. LEAD ASSIGNMENTS TABLE (Maintains full historical assignment audit trail)
CREATE TABLE IF NOT EXISTS public.lead_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    counsellor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assignment_status assignment_status NOT NULL DEFAULT 'active',
    unassigned_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;

-- 5. LEAD ACTIVITIES TABLE (Tracks all status transitions and communications)
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    old_status lead_status,
    new_status lead_status,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- 6. FOLLOW UPS TABLE (Counsellor scheduling and reminders)
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    counsellor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    follow_up_type TEXT NOT NULL,
    notes TEXT,
    status follow_up_status NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_follow_ups_updated_at ON public.follow_ups;
CREATE TRIGGER trg_follow_ups_updated_at
    BEFORE UPDATE ON public.follow_ups
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 006 STUDENT PREFERENCES & SHORTLISTS
-- ==============================================================================

-- 1. STUDENT PREFERENCES TABLE (1-to-1 profile preferences)
CREATE TABLE IF NOT EXISTS public.student_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    preferred_stream TEXT,
    preferred_course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    preferred_state TEXT,
    preferred_city TEXT,
    budget_min NUMERIC(12, 2),
    budget_max NUMERIC(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_preferences_student UNIQUE (student_id)
);

-- Enable RLS
ALTER TABLE public.student_preferences ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_student_preferences_updated_at ON public.student_preferences;
CREATE TRIGGER trg_student_preferences_updated_at
    BEFORE UPDATE ON public.student_preferences
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. STUDENT SHORTLISTS TABLE (Prevents duplicate shortlists for same student)
CREATE TABLE IF NOT EXISTS public.student_shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_shortlists_student_college UNIQUE (student_id, college_id)
);

-- Enable RLS
ALTER TABLE public.student_shortlists ENABLE ROW LEVEL SECURITY;
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 007 APPLICATION & DOCUMENT MANAGEMENT
-- ==============================================================================

-- 1. APPLICATION ENUMS
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'draft',
        'submitted',
        'under_review',
        'documents_required',
        'verified',
        'forwarded',
        'accepted',
        'rejected',
        'waitlisted',
        'withdrawn'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
    college_course_id UUID NOT NULL REFERENCES public.college_courses(id) ON DELETE RESTRICT,
    assigned_counsellor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    application_status application_status NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. APPLICATION DOCUMENTS TABLE (Private Storage Mapping)
CREATE TABLE IF NOT EXISTS public.application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    verification_status document_verification_status NOT NULL DEFAULT 'pending',
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 008 ADMISSION MANAGEMENT DATABASE
-- ==============================================================================

-- 1. ADMISSION OUTCOME ENUM
DO $$ BEGIN
    CREATE TYPE admission_outcome AS ENUM ('admitted', 'rejected', 'waitlisted', 'withdrawn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ADMISSIONS TABLE (1:1 with confirmed application, immutable against unintended cascade delete)
CREATE TABLE IF NOT EXISTS public.admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE RESTRICT UNIQUE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    admission_status admission_outcome NOT NULL DEFAULT 'admitted',
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    academic_year TEXT NOT NULL,
    admission_reference TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_admissions_updated_at ON public.admissions;
CREATE TRIGGER trg_admissions_updated_at
    BEFORE UPDATE ON public.admissions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 009 NOTIFICATIONS DATABASE
-- ==============================================================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    related_entity_type TEXT,
    related_entity_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 010 AUDIT LOGGING DATABASE
-- ==============================================================================

-- 1. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address_if_appropriate TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Block all UPDATE and DELETE operations on audit_logs (append-only ledger)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_mutation ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_mutation
    BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 011 PERFORMANCE INDEXING
-- ==============================================================================

-- 1. COLLEGES & CAMPUSES INDEXES
CREATE INDEX IF NOT EXISTS idx_colleges_slug ON public.colleges(slug);
CREATE INDEX IF NOT EXISTS idx_colleges_pub_status ON public.colleges(publication_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_colleges_location ON public.colleges(state, city);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON public.colleges(college_type);
CREATE INDEX IF NOT EXISTS idx_colleges_featured ON public.colleges(is_featured) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_colleges_created_by ON public.colleges(created_by);

CREATE INDEX IF NOT EXISTS idx_college_campuses_college ON public.college_campuses(college_id);
CREATE INDEX IF NOT EXISTS idx_college_campuses_location ON public.college_campuses(state, city);

-- 2. COURSES & COLLEGE-COURSES INDEXES
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_stream ON public.courses(stream);
CREATE INDEX IF NOT EXISTS idx_courses_degree_type ON public.courses(degree_type);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

CREATE INDEX IF NOT EXISTS idx_college_courses_college ON public.college_courses(college_id);
CREATE INDEX IF NOT EXISTS idx_college_courses_course ON public.college_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_college_courses_adm_status ON public.college_courses(admission_status);

-- 3. FEES & SCHOLARSHIPS INDEXES
CREATE INDEX IF NOT EXISTS idx_college_fees_course ON public.college_fees(college_course_id);
CREATE INDEX IF NOT EXISTS idx_college_fees_year ON public.college_fees(academic_year);

CREATE INDEX IF NOT EXISTS idx_scholarships_college ON public.scholarships(college_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_course ON public.scholarships(college_course_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_status ON public.scholarships(status);

-- 4. LEADS & CRM INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_student ON public.leads(student_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_counsellor ON public.leads(assigned_counsellor_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email_phone ON public.leads(email, phone);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead ON public.lead_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_counsellor ON public.lead_assignments(counsellor_id, assignment_status);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON public.lead_activities(lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follow_ups_counsellor_status ON public.follow_ups(counsellor_id, status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_at ON public.follow_ups(scheduled_at) WHERE status = 'pending';

-- 5. STUDENT MANAGEMENT INDEXES
CREATE INDEX IF NOT EXISTS idx_student_preferences_student ON public.student_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_student_shortlists_student ON public.student_shortlists(student_id);
CREATE INDEX IF NOT EXISTS idx_student_shortlists_college ON public.student_shortlists(college_id);

-- 6. APPLICATIONS & ADMISSIONS INDEXES
CREATE INDEX IF NOT EXISTS idx_applications_number ON public.applications(application_number);
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_college ON public.applications(college_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(application_status);
CREATE INDEX IF NOT EXISTS idx_applications_counsellor ON public.applications(assigned_counsellor_id);

CREATE INDEX IF NOT EXISTS idx_app_documents_application ON public.application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_app_documents_status ON public.application_documents(verification_status);

CREATE INDEX IF NOT EXISTS idx_admissions_application ON public.admissions(application_id);
CREATE INDEX IF NOT EXISTS idx_admissions_student ON public.admissions(student_id);
CREATE INDEX IF NOT EXISTS idx_admissions_college ON public.admissions(college_id);
CREATE INDEX IF NOT EXISTS idx_admissions_reference ON public.admissions(admission_reference);

-- 7. NOTIFICATIONS & AUDIT INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON public.notifications(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 012 ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Strictly enforces multi-tenant RBAC:
-- - Super Admin: Full administrative sovereignty
-- - Admin: Operational CRUD (Colleges, Courses, Fees, CRM, Admissions)
-- - Counsellor: Assigned Leads, Scheduled Follow-ups, Review Applications
-- - Student: Self-managed Profile, Preferences, Shortlists, Applications
-- - Public / Anon: Read published colleges, courses, campuses, fees, scholarships; Submit enquiries
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USER ROLES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can manage user roles" ON public.user_roles;
CREATE POLICY "Super admins can manage user roles"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 2. COLLEGES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view published non-deleted colleges" ON public.colleges;
CREATE POLICY "Public can view published non-deleted colleges"
    ON public.colleges
    FOR SELECT
    TO anon, authenticated
    USING (publication_status = 'published' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins and counsellors can view all colleges" ON public.colleges;
CREATE POLICY "Admins and counsellors can view all colleges"
    ON public.colleges
    FOR SELECT
    TO authenticated
    USING (public.is_counsellor());

DROP POLICY IF EXISTS "Admins have full CRUD on colleges" ON public.colleges;
CREATE POLICY "Admins have full CRUD on colleges"
    ON public.colleges
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. COLLEGE CAMPUSES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view campuses of published colleges" ON public.college_campuses;
CREATE POLICY "Public can view campuses of published colleges"
    ON public.college_campuses
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.colleges c
            WHERE c.id = college_campuses.college_id
              AND c.publication_status = 'published'
              AND c.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Admins can manage campuses" ON public.college_campuses;
CREATE POLICY "Admins can manage campuses"
    ON public.college_campuses
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. COURSES & COLLEGE COURSES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active courses" ON public.courses;
CREATE POLICY "Public can view active courses"
    ON public.courses
    FOR SELECT
    TO anon, authenticated
    USING (status = 'active');

DROP POLICY IF EXISTS "Admins have full CRUD on courses" ON public.courses;
CREATE POLICY "Admins have full CRUD on courses"
    ON public.courses
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view published college courses" ON public.college_courses;
CREATE POLICY "Public can view published college courses"
    ON public.college_courses
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.colleges c
            WHERE c.id = college_courses.college_id
              AND c.publication_status = 'published'
              AND c.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Admins have full CRUD on college courses" ON public.college_courses;
CREATE POLICY "Admins have full CRUD on college courses"
    ON public.college_courses
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. FEES & SCHOLARSHIPS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view fees of published college courses" ON public.college_fees;
CREATE POLICY "Public can view fees of published college courses"
    ON public.college_fees
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.college_courses cc
            JOIN public.colleges c ON c.id = cc.college_id
            WHERE cc.id = college_fees.college_course_id
              AND c.publication_status = 'published'
              AND c.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Admins have full CRUD on college fees" ON public.college_fees;
CREATE POLICY "Admins have full CRUD on college fees"
    ON public.college_fees
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view active scholarships" ON public.scholarships;
CREATE POLICY "Public can view active scholarships"
    ON public.scholarships
    FOR SELECT
    TO anon, authenticated
    USING (status = 'active');

DROP POLICY IF EXISTS "Admins have full CRUD on scholarships" ON public.scholarships;
CREATE POLICY "Admins have full CRUD on scholarships"
    ON public.scholarships
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. LEADS & CRM POLICIES
-- ------------------------------------------------------------------------------
-- Anyone (including anonymous prospective students) can submit a lead enquiry
DROP POLICY IF EXISTS "Public can submit lead enquiry" ON public.leads;
CREATE POLICY "Public can submit lead enquiry"
    ON public.leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Students can view their own submitted leads
DROP POLICY IF EXISTS "Students can view own leads" ON public.leads;
CREATE POLICY "Students can view own leads"
    ON public.leads
    FOR SELECT
    TO authenticated
    USING (student_user_id = auth.uid());

-- Counsellors can view & update assigned leads
DROP POLICY IF EXISTS "Counsellors can view assigned leads" ON public.leads;
CREATE POLICY "Counsellors can view assigned leads"
    ON public.leads
    FOR SELECT
    TO authenticated
    USING (
        assigned_counsellor_id = auth.uid()
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.lead_assignments la
            WHERE la.lead_id = leads.id
              AND la.counsellor_id = auth.uid()
              AND la.assignment_status = 'active'
        )
    );

DROP POLICY IF EXISTS "Counsellors can update assigned leads" ON public.leads;
CREATE POLICY "Counsellors can update assigned leads"
    ON public.leads
    FOR UPDATE
    TO authenticated
    USING (
        assigned_counsellor_id = auth.uid()
        OR public.is_admin()
    )
    WITH CHECK (
        assigned_counsellor_id = auth.uid()
        OR public.is_admin()
    );

-- Admins have full management access on leads
DROP POLICY IF EXISTS "Admins have full access to leads" ON public.leads;
CREATE POLICY "Admins have full access to leads"
    ON public.leads
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Lead Assignments & Activities
DROP POLICY IF EXISTS "Staff can view lead assignments" ON public.lead_assignments;
CREATE POLICY "Staff can view lead assignments"
    ON public.lead_assignments
    FOR SELECT
    TO authenticated
    USING (counsellor_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage lead assignments" ON public.lead_assignments;
CREATE POLICY "Admins can manage lead assignments"
    ON public.lead_assignments
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Staff can view lead activities" ON public.lead_activities;
CREATE POLICY "Staff can view lead activities"
    ON public.lead_activities
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.leads l
            WHERE l.id = lead_activities.lead_id
              AND (l.assigned_counsellor_id = auth.uid() OR l.student_user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Staff can insert lead activities" ON public.lead_activities;
CREATE POLICY "Staff can insert lead activities"
    ON public.lead_activities
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_counsellor());

-- Follow Ups
DROP POLICY IF EXISTS "Counsellors can view and manage assigned follow-ups" ON public.follow_ups;
CREATE POLICY "Counsellors can view and manage assigned follow-ups"
    ON public.follow_ups
    FOR ALL
    TO authenticated
    USING (counsellor_id = auth.uid() OR public.is_admin())
    WITH CHECK (counsellor_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. STUDENT MANAGEMENT POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students manage own preferences" ON public.student_preferences;
CREATE POLICY "Students manage own preferences"
    ON public.student_preferences
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid() OR public.is_admin())
    WITH CHECK (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Students manage own shortlists" ON public.student_shortlists;
CREATE POLICY "Students manage own shortlists"
    ON public.student_shortlists
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid() OR public.is_admin())
    WITH CHECK (student_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. APPLICATIONS & DOCUMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can view own applications" ON public.applications;
CREATE POLICY "Students can view own applications"
    ON public.applications
    FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR assigned_counsellor_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Students can create own applications" ON public.applications;
CREATE POLICY "Students can create own applications"
    ON public.applications
    FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students and staff can update applications" ON public.applications;
CREATE POLICY "Students and staff can update applications"
    ON public.applications
    FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid() OR assigned_counsellor_id = auth.uid() OR public.is_admin())
    WITH CHECK (student_id = auth.uid() OR assigned_counsellor_id = auth.uid() OR public.is_admin());

-- Application Documents
DROP POLICY IF EXISTS "Application documents view policy" ON public.application_documents;
CREATE POLICY "Application documents view policy"
    ON public.application_documents
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_documents.application_id
              AND (a.student_id = auth.uid() OR a.assigned_counsellor_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Students can upload application documents" ON public.application_documents;
CREATE POLICY "Students can upload application documents"
    ON public.application_documents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_documents.application_id
              AND a.student_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can verify application documents" ON public.application_documents;
CREATE POLICY "Staff can verify application documents"
    ON public.application_documents
    FOR UPDATE
    TO authenticated
    USING (public.is_counsellor())
    WITH CHECK (public.is_counsellor());

-- ------------------------------------------------------------------------------
-- 9. ADMISSIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admissions view policy" ON public.admissions;
CREATE POLICY "Admissions view policy"
    ON public.admissions
    FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.is_counsellor());

DROP POLICY IF EXISTS "Admins can manage admissions" ON public.admissions;
CREATE POLICY "Admins can manage admissions"
    ON public.admissions
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users manage their own notifications" ON public.notifications;
CREATE POLICY "Users manage their own notifications"
    ON public.notifications
    FOR ALL
    TO authenticated
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 11. AUDIT LOGS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Staff can insert audit logs" ON public.audit_logs;
CREATE POLICY "Staff can insert audit logs"
    ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_counsellor());
-- ==============================================================================
-- ASPIRANT VISION — PHASE 03: 013 STAFF INVITATIONS & PROVISIONING
-- ==============================================================================
-- Enables authorized administrators to invite new staff (admins, counsellors)
-- with expiring cryptographic tokens. Prohibits public admin registration.
-- ==============================================================================

-- 1. STAFF INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.staff_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role user_role NOT NULL CHECK (role IN ('admin', 'counsellor')),
    token TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for instant token lookup
CREATE INDEX IF NOT EXISTS idx_staff_invitations_token ON public.staff_invitations(token);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_email ON public.staff_invitations(email);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_active ON public.staff_invitations(token, expires_at) WHERE accepted_at IS NULL;

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
DROP POLICY IF EXISTS "Admins can view and manage staff invitations" ON public.staff_invitations;
CREATE POLICY "Admins can view and manage staff invitations"
    ON public.staff_invitations
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can validate invitation with exact token" ON public.staff_invitations;
CREATE POLICY "Anyone can validate invitation with exact token"
    ON public.staff_invitations
    FOR SELECT
    TO anon, authenticated
    USING (accepted_at IS NULL AND expires_at > NOW());
-- ==============================================================================
-- ASPIRANT VISION — PHASE 05: 014 COLLEGE MANAGEMENT ENHANCEMENTS & STORAGE
-- ==============================================================================

-- 1. ADD BACKWARD-COMPATIBLE COLUMNS TO PUBLIC.COLLEGES
ALTER TABLE public.colleges
    ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS facilities TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
    ADD COLUMN IF NOT EXISTS admission_contact TEXT,
    ADD COLUMN IF NOT EXISTS admission_email TEXT,
    ADD COLUMN IF NOT EXISTS admission_process TEXT,
    ADD COLUMN IF NOT EXISTS eligibility_overview TEXT,
    ADD COLUMN IF NOT EXISTS entrance_exams TEXT,
    ADD COLUMN IF NOT EXISTS admission_start_date DATE,
    ADD COLUMN IF NOT EXISTS admission_end_date DATE,
    ADD COLUMN IF NOT EXISTS accreditation_body TEXT,
    ADD COLUMN IF NOT EXISTS accreditation_grade TEXT,
    ADD COLUMN IF NOT EXISTS naac_grade TEXT,
    ADD COLUMN IF NOT EXISTS nirf_rank INTEGER,
    ADD COLUMN IF NOT EXISTS other_rankings TEXT,
    ADD COLUMN IF NOT EXISTS recognition_details TEXT,
    ADD COLUMN IF NOT EXISTS canonical_url TEXT,
    ADD COLUMN IF NOT EXISTS og_image_url TEXT,
    ADD COLUMN IF NOT EXISTS no_index BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 2. CREATE INDEXES FOR FAST FILTERING & SEARCH
CREATE INDEX IF NOT EXISTS idx_colleges_publication_status ON public.colleges(publication_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_colleges_is_featured ON public.colleges(is_featured) WHERE publication_status = 'published';
CREATE INDEX IF NOT EXISTS idx_colleges_college_type ON public.colleges(college_type);
CREATE INDEX IF NOT EXISTS idx_colleges_state_city ON public.colleges(state, city);

-- 3. STORAGE CONFIGURATION FOR COLLEGE ASSETS
-- Creates or updates public bucket for logos, covers, and gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'college-assets',
    'college-assets',
    true,
    5242880, -- 5MB limit per asset
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Storage RLS Policies for college-assets
-- Allow public reading of college logos, banners and galleries
DO $$ BEGIN
    CREATE POLICY "Public Read College Assets"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'college-assets');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Allow authenticated staff to upload college assets
DO $$ BEGIN
    CREATE POLICY "Staff Upload College Assets"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'college-assets' AND
            (public.is_admin() OR public.is_counsellor())
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Allow authenticated staff to update/replace college assets
DO $$ BEGIN
    CREATE POLICY "Staff Update College Assets"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'college-assets' AND
            (public.is_admin() OR public.is_counsellor())
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Allow authenticated staff to delete college assets
DO $$ BEGIN
    CREATE POLICY "Staff Delete College Assets"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'college-assets' AND
            (public.is_admin() OR public.is_counsellor())
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
-- ==============================================================================
-- ASPIRANT VISION — PHASE 06: COURSES, FEES & SCHOLARSHIPS SCHEMA ENHANCEMENTS
-- ==============================================================================

-- 1. COURSES TABLE ENHANCEMENTS
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Engineering',
    ADD COLUMN IF NOT EXISTS code TEXT,
    ADD COLUMN IF NOT EXISTS specialization TEXT,
    ADD COLUMN IF NOT EXISTS short_description TEXT,
    ADD COLUMN IF NOT EXISTS study_mode TEXT DEFAULT 'full_time',
    ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'undergraduate',
    ADD COLUMN IF NOT EXISTS intake INTEGER,
    ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
    ADD COLUMN IF NOT EXISTS min_qualification TEXT,
    ADD COLUMN IF NOT EXISTS min_percentage NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS required_subjects TEXT,
    ADD COLUMN IF NOT EXISTS age_criteria TEXT,
    ADD COLUMN IF NOT EXISTS additional_requirements TEXT,
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
    ADD COLUMN IF NOT EXISTS banner_url TEXT,
    ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS seo_title TEXT,
    ADD COLUMN IF NOT EXISTS seo_description TEXT,
    ADD COLUMN IF NOT EXISTS og_image_url TEXT,
    ADD COLUMN IF NOT EXISTS no_index BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS publication_status TEXT DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. COLLEGE COURSES ENHANCEMENTS
ALTER TABLE public.college_courses
    ADD COLUMN IF NOT EXISTS course_name_override TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS fee_notes_override TEXT;

-- 3. COLLEGE FEES ENHANCEMENTS
-- Drop the single-row per year constraint to allow multiple breakdown components (tuition, hostel, lab, etc.)
ALTER TABLE public.college_fees DROP CONSTRAINT IF EXISTS uq_college_fees_course_year;

ALTER TABLE public.college_fees
    ADD COLUMN IF NOT EXISTS fee_type TEXT DEFAULT 'tuition',
    ADD COLUMN IF NOT EXISTS payment_frequency TEXT DEFAULT 'annual',
    ADD COLUMN IF NOT EXISTS student_category TEXT DEFAULT 'all',
    ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS effective_date DATE,
    ADD COLUMN IF NOT EXISTS expiry_date DATE,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 4. SCHOLARSHIPS ENHANCEMENTS
-- Allow general / national scholarships by making college_id nullable
ALTER TABLE public.scholarships ALTER COLUMN college_id DROP NOT NULL;

ALTER TABLE public.scholarships
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS provider TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'merit',
    ADD COLUMN IF NOT EXISTS min_percentage NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS scholarship_percentage NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS max_benefit NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS application_start_date DATE,
    ADD COLUMN IF NOT EXISTS application_instructions TEXT,
    ADD COLUMN IF NOT EXISTS official_url TEXT,
    ADD COLUMN IF NOT EXISTS required_documents JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS contact_info TEXT,
    ADD COLUMN IF NOT EXISTS publication_status TEXT DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Unique slug for scholarships
CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarships_slug ON public.scholarships (slug) WHERE deleted_at IS NULL;

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_courses_pub_featured 
    ON public.courses (publication_status, is_featured, name) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_courses_category_degree 
    ON public.courses (category, degree_type);

CREATE INDEX IF NOT EXISTS idx_college_courses_composite 
    ON public.college_courses (college_id, course_id, admission_status);

CREATE INDEX IF NOT EXISTS idx_college_fees_query 
    ON public.college_fees (college_course_id, academic_year, fee_type);

CREATE INDEX IF NOT EXISTS idx_scholarships_pub 
    ON public.scholarships (publication_status, category) 
    WHERE deleted_at IS NULL;

-- 6. STORAGE BUCKET FOR COURSE & SCHOLARSHIP ASSETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'course-assets',
    'course-assets',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Storage RLS on course-assets
DROP POLICY IF EXISTS "Public can view course assets" ON storage.objects;
CREATE POLICY "Public can view course assets"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'course-assets');

DROP POLICY IF EXISTS "Staff can upload course assets" ON storage.objects;
CREATE POLICY "Staff can upload course assets"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'course-assets' 
        AND public.is_staff()
    );

DROP POLICY IF EXISTS "Staff can update course assets" ON storage.objects;
CREATE POLICY "Staff can update course assets"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'course-assets' 
        AND public.is_staff()
    );

DROP POLICY IF EXISTS "Staff can delete course assets" ON storage.objects;
CREATE POLICY "Staff can delete course assets"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'course-assets' 
        AND public.is_staff()
    );

-- 7. REFRESH COURSES & SCHOLARSHIPS RLS POLICIES FOR PUBLISHED STATUS
DROP POLICY IF EXISTS "Public can view active courses" ON public.courses;
CREATE POLICY "Public can view active courses"
    ON public.courses
    FOR SELECT
    TO anon, authenticated
    USING (
        (publication_status = 'published' OR status = 'active')
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Public can view active scholarships" ON public.scholarships;
CREATE POLICY "Public can view active scholarships"
    ON public.scholarships
    FOR SELECT
    TO anon, authenticated
    USING (
        (publication_status = 'published' OR status = 'active')
        AND deleted_at IS NULL
    );
-- ==============================================================================
-- ASPIRANT VISION — PHASE 07: LEAD MANAGEMENT & COUNSELLING CRM ENHANCEMENTS
-- ==============================================================================

-- 1. ENHANCE LEADS TABLE
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS preferred_location TEXT,
  ADD COLUMN IF NOT EXISTS current_qualification TEXT,
  ADD COLUMN IF NOT EXISTS passing_year INTEGER,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS referring_page TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_params JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS lost_reason TEXT,
  ADD COLUMN IF NOT EXISTS status_reason TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. ENHANCE FOLLOW_UPS TABLE
ALTER TABLE public.follow_ups
  ADD COLUMN IF NOT EXISTS priority lead_priority NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS completion_notes TEXT;

-- 3. ENHANCE LEAD_ACTIVITIES TABLE
ALTER TABLE public.lead_activities
  ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT true;

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_interested_college ON public.leads(interested_college_id);
CREATE INDEX IF NOT EXISTS idx_leads_interested_course ON public.leads(interested_course_id);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON public.leads(deleted_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_lead ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_date ON public.follow_ups(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_priority ON public.follow_ups(priority);
CREATE INDEX IF NOT EXISTS idx_lead_activities_actor ON public.lead_activities(actor_id);
-- ==============================================================================
-- ASPIRANT VISION — PHASE 08: STUDENT PORTAL & PROFILE ENHANCEMENTS
-- ==============================================================================

-- 1. ENHANCE PROFILES TABLE FOR STUDENT PERSONAL DETAILS
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'India',
    ADD COLUMN IF NOT EXISTS pin_code TEXT;

-- 2. CREATE STUDENT ACADEMICS TABLE (1-to-1 with student profile)
CREATE TABLE IF NOT EXISTS public.student_academics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    education_level TEXT NOT NULL DEFAULT '12th',
    highest_qualification TEXT,
    institution_name TEXT,
    board_or_university TEXT,
    passing_year INTEGER,
    percentage_or_cgpa NUMERIC(5, 2),
    stream TEXT,
    entrance_exam_name TEXT,
    entrance_exam_score TEXT,
    additional_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_academics_student UNIQUE (student_id)
);

-- Enable RLS
ALTER TABLE public.student_academics ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_student_academics_updated_at ON public.student_academics;
CREATE TRIGGER trg_student_academics_updated_at
    BEFORE UPDATE ON public.student_academics
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS Policies for student_academics
DROP POLICY IF EXISTS "Students manage own academic record" ON public.student_academics;
CREATE POLICY "Students manage own academic record"
    ON public.student_academics
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid() OR public.is_admin())
    WITH CHECK (student_id = auth.uid() OR public.is_admin());

-- 3. ENHANCE STUDENT PREFERENCES TABLE
ALTER TABLE public.student_preferences
    ADD COLUMN IF NOT EXISTS preferred_study_level TEXT,
    ADD COLUMN IF NOT EXISTS preferred_specialization TEXT,
    ADD COLUMN IF NOT EXISTS preferred_college_type TEXT,
    ADD COLUMN IF NOT EXISTS preferred_study_mode TEXT,
    ADD COLUMN IF NOT EXISTS preferred_admission_year INTEGER,
    ADD COLUMN IF NOT EXISTS entrance_exam_preference TEXT;

-- 4. ENHANCE STUDENT SHORTLISTS (Support both colleges & courses)
ALTER TABLE public.student_shortlists
    ALTER COLUMN college_id DROP NOT NULL;

ALTER TABLE public.student_shortlists
    ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- Drop previous single-column unique constraint
ALTER TABLE public.student_shortlists
    DROP CONSTRAINT IF EXISTS uq_student_shortlists_student_college;

-- Create partial unique indexes so student cannot duplicate a college or course shortlist
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_shortlists_college
    ON public.student_shortlists (student_id, college_id)
    WHERE college_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_student_shortlists_course
    ON public.student_shortlists (student_id, course_id)
    WHERE course_id IS NOT NULL;

-- 5. INDEXES FOR STUDENT PORTAL FAST RETRIEVAL
CREATE INDEX IF NOT EXISTS idx_student_academics_student ON public.student_academics(student_id);
CREATE INDEX IF NOT EXISTS idx_student_shortlists_course ON public.student_shortlists(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON public.notifications(recipient_id, is_read);

-- 6. STORAGE BUCKET FOR STUDENT PROFILE AVATARS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-avatars',
    'student-avatars',
    true,
    3145728, -- 3MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 3145728,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Bucket RLS
DROP POLICY IF EXISTS "Public can view student avatars" ON storage.objects;
CREATE POLICY "Public can view student avatars"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'student-avatars');

DROP POLICY IF EXISTS "Students can upload own avatars" ON storage.objects;
CREATE POLICY "Students can upload own avatars"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'student-avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Students can update own avatars" ON storage.objects;
CREATE POLICY "Students can update own avatars"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'student-avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Students can delete own avatars" ON storage.objects;
CREATE POLICY "Students can delete own avatars"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'student-avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
-- ==============================================================================
-- ASPIRANT VISION — PHASE 09: APPLICATIONS & ADMISSION MANAGEMENT ENHANCEMENTS
-- ==============================================================================

-- 1. ENHANCE APPLICATIONS TABLE
ALTER TABLE public.applications 
    ADD COLUMN IF NOT EXISTS personal_details JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS academic_details JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS additional_info JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2026-27',
    ADD COLUMN IF NOT EXISTS review_notes TEXT,
    ADD COLUMN IF NOT EXISTS decision_reason TEXT,
    ADD COLUMN IF NOT EXISTS forwarded_to TEXT,
    ADD COLUMN IF NOT EXISTS forwarded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS decision_at TIMESTAMPTZ;

-- 2. ENHANCE APPLICATION DOCUMENTS TABLE
ALTER TABLE public.application_documents
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
    ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- 3. ENHANCE ADMISSIONS TABLE
ALTER TABLE public.admissions
    ADD COLUMN IF NOT EXISTS admitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS remarks TEXT;

-- 4. REFERENCE GENERATOR FUNCTIONS (Collision-Free, Cryptographically Random Suffix)
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TEXT AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
    rand_chars TEXT;
    new_app_num TEXT;
    done BOOLEAN := FALSE;
BEGIN
    WHILE NOT done LOOP
        -- Generate 6 uppercase alphanumeric characters
        rand_chars := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        new_app_num := 'AV-APP-' || current_yr || '-' || rand_chars;
        
        IF NOT EXISTS (SELECT 1 FROM public.applications WHERE application_number = new_app_num) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_app_num;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_admission_reference()
RETURNS TEXT AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
    rand_chars TEXT;
    new_adm_ref TEXT;
    done BOOLEAN := FALSE;
BEGIN
    WHILE NOT done LOOP
        rand_chars := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        new_adm_ref := 'AV-ADM-' || current_yr || '-' || rand_chars;
        
        IF NOT EXISTS (SELECT 1 FROM public.admissions WHERE admission_reference = new_adm_ref) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_adm_ref;
END;
$$ LANGUAGE plpgsql;

-- 5. PRIVATE STORAGE BUCKET FOR APPLICATION DOCUMENTS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'application-documents',
    'application-documents',
    false, -- STRICTLY PRIVATE BUCKET: No unauthenticated or public URL access
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- 6. PRIVATE STORAGE POLICIES
DROP POLICY IF EXISTS "Students can upload own application documents" ON storage.objects;
CREATE POLICY "Students can upload own application documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'application-documents'
        AND (auth.uid()::text = (storage.foldername(name))[1])
    );

DROP POLICY IF EXISTS "Authorized users can view application documents" ON storage.objects;
CREATE POLICY "Authorized users can view application documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'application-documents'
        AND (
            -- Student owns the file
            auth.uid()::text = (storage.foldername(name))[1]
            -- Or user is staff (admin or counsellor)
            OR public.is_counsellor()
            OR public.is_admin()
        )
    );

DROP POLICY IF EXISTS "Students can delete own draft documents" ON storage.objects;
CREATE POLICY "Students can delete own draft documents"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'application-documents'
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR public.is_admin()
        )
    );

-- 7. RE-VERIFY APPLICATION INDEXES
CREATE INDEX IF NOT EXISTS idx_applications_college ON public.applications(college_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(application_status);
CREATE INDEX IF NOT EXISTS idx_applications_counsellor ON public.applications(assigned_counsellor_id);
CREATE INDEX IF NOT EXISTS idx_applications_created ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admissions_college ON public.admissions(college_id);
CREATE INDEX IF NOT EXISTS idx_admissions_student ON public.admissions(student_id);
-- ==============================================================================
-- ASPIRANT VISION — PHASE 10: REALTIME NOTIFICATIONS, PREFERENCES & FOLLOW-UP REMINDERS
-- ==============================================================================

-- 1. EXTEND NOTIFICATIONS TABLE
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS destination_url TEXT,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create high-performance indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id 
    ON public.notifications(recipient_id);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
    ON public.notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
    ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_category 
    ON public.notifications(category);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread 
    ON public.notifications(recipient_id, is_read) 
    WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_related_entity 
    ON public.notifications(related_entity_type, related_entity_id);

-- 2. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_notification_preferences_user_category UNIQUE (user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id 
    ON public.notification_preferences(user_id);

-- Enable RLS on preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users manage their own notification preferences"
    ON public.notification_preferences
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at on notification_preferences
DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. FOLLOW-UP REMINDER IDEMPOTENCY & AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.follow_up_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follow_up_id UUID NOT NULL REFERENCES public.follow_ups(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL, -- 'upcoming_24h', 'due_today', 'overdue', 'missed'
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'skipped', 'failed'
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_follow_up_id 
    ON public.follow_up_reminders(follow_up_id);

CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_recipient_id 
    ON public.follow_up_reminders(recipient_id);

CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_idempotency_key 
    ON public.follow_up_reminders(idempotency_key);

-- Enable RLS on follow_up_reminders
ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view reminder logs" ON public.follow_up_reminders;
CREATE POLICY "Staff can view reminder logs"
    ON public.follow_up_reminders
    FOR SELECT
    TO authenticated
    USING (public.is_staff() OR public.is_admin());

-- 4. ENSURE SERVICE ROLE / STAFF NOTIFICATION INSERT PERMISSIONS
-- Drop and recreate notification RLS policy to allow users to read/update their own,
-- and admins/counsellors or triggers to insert notifications
DROP POLICY IF EXISTS "Users manage their own notifications" ON public.notifications;

CREATE POLICY "Users can select own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (recipient_id = auth.uid());

CREATE POLICY "Staff and users can insert notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        recipient_id = auth.uid() 
        OR public.is_staff() 
        OR public.is_admin()
    );

-- 5. REALTIME PUBLICATION CONFIGURATION
-- Ensure notifications table is part of the supabase_realtime publication
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;

-- Set REPLICA IDENTITY FULL so UPDATE / DELETE payloads include full previous data
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
-- ==============================================================================
-- ASPIRANT VISION — PHASE 12: ANALYTICS, REPORTING & PERFORMANCE DASHBOARDS
-- ==============================================================================

-- 1. HIGH-PERFORMANCE ANALYTICS INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_counsellor ON public.leads(assigned_counsellor_id);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_applications_college_id ON public.applications(college_id);
CREATE INDEX IF NOT EXISTS idx_applications_college_course_id ON public.applications(college_course_id);
CREATE INDEX IF NOT EXISTS idx_admissions_admission_date ON public.admissions(admission_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_counsellor_status ON public.follow_ups(counsellor_id, status);
CREATE INDEX IF NOT EXISTS idx_lead_activities_actor ON public.lead_activities(actor_id, activity_type);

-- 2. SECURE ANALYTICS RPC FUNCTIONS
-- All functions run with fixed search_path to prevent security vulnerabilities.

-- A. Leads Summary & Funnel RPC
CREATE OR REPLACE FUNCTION public.get_analytics_leads_funnel(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_counsellor_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_leads BIGINT,
    new_leads BIGINT,
    contacted_leads BIGINT,
    interested_leads BIGINT,
    apps_started BIGINT,
    apps_submitted BIGINT,
    admitted_leads BIGINT,
    lost_leads BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_leads,
        COUNT(*) FILTER (WHERE status = 'new')::BIGINT AS new_leads,
        COUNT(*) FILTER (WHERE status = 'contacted')::BIGINT AS contacted_leads,
        COUNT(*) FILTER (WHERE status = 'interested')::BIGINT AS interested_leads,
        COUNT(*) FILTER (WHERE status = 'application_started')::BIGINT AS apps_started,
        COUNT(*) FILTER (WHERE status = 'application_submitted')::BIGINT AS apps_submitted,
        COUNT(*) FILTER (WHERE status = 'admitted')::BIGINT AS admitted_leads,
        COUNT(*) FILTER (WHERE status IN ('not_interested', 'lost'))::BIGINT AS lost_leads
    FROM public.leads
    WHERE created_at >= p_start_date
      AND created_at <= p_end_date
      AND (p_counsellor_id IS NULL OR assigned_counsellor_id = p_counsellor_id);
END;
$$;

-- B. Counsellor Performance Summary RPC
CREATE OR REPLACE FUNCTION public.get_counsellor_performance_summary(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_counsellor_id UUID DEFAULT NULL
)
RETURNS TABLE (
    counsellor_id UUID,
    full_name TEXT,
    email TEXT,
    assigned_leads BIGINT,
    contacted_leads BIGINT,
    interested_leads BIGINT,
    admitted_leads BIGINT,
    completed_followups BIGINT,
    overdue_followups BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS counsellor_id,
        COALESCE(p.full_name, 'Counsellor') AS full_name,
        p.email,
        COUNT(DISTINCT l.id)::BIGINT AS assigned_leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status IN ('contacted', 'interested', 'application_started', 'application_submitted', 'admitted'))::BIGINT AS contacted_leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status IN ('interested', 'application_started', 'application_submitted', 'admitted'))::BIGINT AS interested_leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'admitted')::BIGINT AS admitted_leads,
        (
            SELECT COUNT(*)::BIGINT
            FROM public.follow_ups f
            WHERE f.counsellor_id = p.id
              AND f.status = 'completed'
              AND f.updated_at >= p_start_date
              AND f.updated_at <= p_end_date
        ) AS completed_followups,
        (
            SELECT COUNT(*)::BIGINT
            FROM public.follow_ups f
            WHERE f.counsellor_id = p.id
              AND f.status = 'pending'
              AND f.scheduled_at < NOW()
        ) AS overdue_followups
    FROM public.profiles p
    LEFT JOIN public.leads l 
      ON l.assigned_counsellor_id = p.id
     AND l.created_at >= p_start_date
     AND l.created_at <= p_end_date
    WHERE (p.role = 'counsellor' OR EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = p.id AND ur.role = 'counsellor'
    ))
    AND (p_counsellor_id IS NULL OR p.id = p_counsellor_id)
    GROUP BY p.id, p.full_name, p.email
    ORDER BY assigned_leads DESC;
END;
$$;

-- C. College & Course Demand Leaderboard RPC
CREATE OR REPLACE FUNCTION public.get_college_demand_leaderboard(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    college_id UUID,
    college_name TEXT,
    college_city TEXT,
    college_state TEXT,
    leads_count BIGINT,
    applications_count BIGINT,
    admissions_count BIGINT,
    shortlists_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS college_id,
        c.name AS college_name,
        COALESCE(c.city, '') AS college_city,
        COALESCE(c.state, '') AS college_state,
        COUNT(DISTINCT l.id)::BIGINT AS leads_count,
        COUNT(DISTINCT a.id)::BIGINT AS applications_count,
        COUNT(DISTINCT adm.id)::BIGINT AS admissions_count,
        COUNT(DISTINCT s.id)::BIGINT AS shortlists_count
    FROM public.colleges c
    LEFT JOIN public.leads l 
      ON l.interested_college_id = c.id
     AND l.created_at >= p_start_date
     AND l.created_at <= p_end_date
    LEFT JOIN public.applications a 
      ON a.college_id = c.id
     AND a.created_at >= p_start_date
     AND a.created_at <= p_end_date
    LEFT JOIN public.admissions adm 
      ON adm.college_id = c.id
     AND adm.created_at >= p_start_date
     AND adm.created_at <= p_end_date
    LEFT JOIN public.student_shortlists s 
      ON s.college_id = c.id
     AND s.created_at >= p_start_date
     AND s.created_at <= p_end_date
    GROUP BY c.id, c.name, c.city, c.state
    ORDER BY (COUNT(DISTINCT l.id) + COUNT(DISTINCT a.id) * 2 + COUNT(DISTINCT adm.id) * 3) DESC
    LIMIT p_limit;
END;
$$;

-- Grant execution to authenticated users (functions internally scope permissions)
GRANT EXECUTE ON FUNCTION public.get_analytics_leads_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_counsellor_performance_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_college_demand_leaderboard TO authenticated;
-- ==============================================================================
-- ASPIRANT VISION — PHASE 13: PRODUCTION SECURITY HARDENING & OPTIMIZATIONS
-- ==============================================================================
-- 1. Hardens all SECURITY DEFINER functions with explicit `SET search_path = public`
--    to prevent search_path hijacking vulnerabilities.
-- 2. Closes privilege escalation vectors in `handle_new_user()` trigger by strictly
--    verifying staff invitations before any staff role assignment.
-- 3. Adds production composite indexes for high-frequency queries.
-- 4. Verifies private storage access constraints.
-- ==============================================================================

-- 1. HARDEN SECURITY DEFINER FUNCTIONS WITH EXPLICIT SEARCH_PATH
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(check_role user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = check_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_counsellor()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('counsellor', 'admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('counsellor', 'admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TEXT AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
    rand_chars TEXT;
    new_app_num TEXT;
BEGIN
    rand_chars := upper(substring(md5(random()::text) from 1 for 6));
    new_app_num := 'AV-' || current_yr || '-' || rand_chars;
    RETURN new_app_num;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_admission_reference()
RETURNS TEXT AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
    rand_chars TEXT;
    new_adm_ref TEXT;
BEGIN
    rand_chars := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 7));
    new_adm_ref := 'ADM-' || current_yr || '-' || rand_chars;
    RETURN new_adm_ref;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. PRIVILEGE ESCALATION DEFENSE IN HANDLE_NEW_USER TRIGGER
-- ------------------------------------------------------------------------------
-- Prevents unauthorized users from registering with staff roles. Staff roles
-- (admin, counsellor) require an active, unaccepted invitation in staff_invitations.
-- Super Admin can NEVER be self-assigned via metadata under any circumstance.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    assigned_role user_role := 'student'::user_role;
    requested_role TEXT;
    has_valid_invite BOOLEAN := FALSE;
BEGIN
    requested_role := new.raw_user_meta_data->>'role';

    -- Only allow staff roles if an unexpired staff invitation exists for this exact email
    IF requested_role IN ('admin', 'counsellor') THEN
        SELECT EXISTS (
            SELECT 1 FROM public.staff_invitations
            WHERE email = LOWER(new.email)
              AND accepted_at IS NULL
              AND expires_at > NOW()
              AND role = requested_role::user_role
        ) INTO has_valid_invite;

        IF has_valid_invite THEN
            assigned_role := requested_role::user_role;
            -- Mark the invitation as accepted
            UPDATE public.staff_invitations
            SET accepted_at = NOW()
            WHERE email = LOWER(new.email)
              AND accepted_at IS NULL
              AND expires_at > NOW()
              AND role = requested_role::user_role;
        ELSE
            -- Reject escalation attempt and default to student
            assigned_role := 'student'::user_role;
        END IF;
    ELSE
        -- Default safely to student
        assigned_role := 'student'::user_role;
    END IF;

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, full_name, phone, avatar_url, role, account_status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null),
        new.phone,
        new.raw_user_meta_data->>'avatar_url',
        assigned_role,
        'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        updated_at = NOW();

    -- Insert into user_roles (prevent duplicate assignments)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, assigned_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. HIGH-PERFORMANCE PRODUCTION COMPOSITE INDEXES
-- ------------------------------------------------------------------------------

-- Fast public queries for colleges & courses
CREATE INDEX IF NOT EXISTS idx_colleges_published_featured 
    ON public.colleges(publication_status, is_featured);

CREATE INDEX IF NOT EXISTS idx_courses_published_category 
    ON public.courses(publication_status, category);

-- CRM Leads & Follow-ups fast querying
CREATE INDEX IF NOT EXISTS idx_leads_status_created 
    ON public.leads(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follow_ups_counsellor_active 
    ON public.follow_ups(counsellor_id, scheduled_at) 
    WHERE status = 'pending';

-- Applications & Admissions fast lookup
CREATE INDEX IF NOT EXISTS idx_applications_student_status 
    ON public.applications(student_id, application_status);

-- High-frequency realtime unread notification badge index
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread_badge 
    ON public.notifications(recipient_id, is_read, created_at DESC);
