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
