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
