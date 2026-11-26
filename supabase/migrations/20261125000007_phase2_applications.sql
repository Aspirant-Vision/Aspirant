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
