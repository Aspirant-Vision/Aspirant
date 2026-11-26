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
